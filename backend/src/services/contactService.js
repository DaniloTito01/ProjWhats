/**
 * Serviço de Contatos
 * 
 * Este serviço gerencia as operações relacionadas aos contatos,
 * incluindo criação, atualização, importação e gerenciamento de tags.
 */

const { Contact, Stage } = require('../models');
const logger = require('../config/logger');
const fs = require('fs');
const csv = require('csv-parser');
const { Op } = require('sequelize');

/**
 * Cria um novo contato
 * @param {Object} contactData - Dados do contato
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Contact>} - Contato criado
 */
const createContact = async (contactData, companyId) => {
  try {
    // Formata o número de telefone
    if (contactData.phone) {
      contactData.phone = formatPhoneNumber(contactData.phone);
    }

    // Verifica se o contato já existe
    const existingContact = await Contact.findOne({
      where: {
        companyId,
        [Op.or]: [
          { phone: contactData.phone },
          { email: contactData.email }
        ]
      }
    });

    if (existingContact) {
      throw new Error('Já existe um contato com este telefone ou email');
    }

    // Cria o contato no banco de dados
    const contact = await Contact.create({
      ...contactData,
      companyId,
      active: true
    });

    logger.info(`Contato ${contact.id} criado para a empresa ${companyId}`);
    return contact;
  } catch (error) {
    logger.error(`Erro ao criar contato: ${error.message}`);
    throw error;
  }
};

/**
 * Atualiza um contato existente
 * @param {number} contactId - ID do contato
 * @param {Object} contactData - Dados atualizados do contato
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Contact>} - Contato atualizado
 */
const updateContact = async (contactId, contactData, companyId) => {
  try {
    // Formata o número de telefone
    if (contactData.phone) {
      contactData.phone = formatPhoneNumber(contactData.phone);
    }

    // Busca o contato
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        companyId
      }
    });

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    // Verifica se o telefone ou email já está em uso por outro contato
    if (contactData.phone || contactData.email) {
      const existingContact = await Contact.findOne({
        where: {
          companyId,
          id: { [Op.ne]: contactId },
          [Op.or]: [
            contactData.phone ? { phone: contactData.phone } : null,
            contactData.email ? { email: contactData.email } : null
          ].filter(Boolean)
        }
      });

      if (existingContact) {
        throw new Error('Já existe outro contato com este telefone ou email');
      }
    }

    // Atualiza o contato
    await contact.update(contactData);

    logger.info(`Contato ${contactId} atualizado para a empresa ${companyId}`);
    return contact;
  } catch (error) {
    logger.error(`Erro ao atualizar contato ${contactId}: ${error.message}`);
    throw error;
  }
};

/**
 * Importa contatos a partir de um arquivo CSV
 * @param {string} filePath - Caminho do arquivo CSV
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Object>} - Resultado da importação
 */
const importContacts = async (filePath, companyId) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const errors = [];
    let totalProcessed = 0;

    // Busca o estágio padrão
    let defaultStageId = null;
    Stage.findOne({
      where: {
        companyId,
        isDefault: true
      }
    }).then(stage => {
      if (stage) {
        defaultStageId = stage.id;
      }

      // Processa o arquivo CSV
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', async (data) => {
          totalProcessed++;
          
          try {
            // Verifica se tem os campos obrigatórios
            if (!data.nome || !data.telefone) {
              throw new Error('Nome e telefone são obrigatórios');
            }

            // Formata o número de telefone
            const phone = formatPhoneNumber(data.telefone);

            // Verifica se o contato já existe
            const existingContact = await Contact.findOne({
              where: {
                companyId,
                [Op.or]: [
                  { phone },
                  data.email ? { email: data.email } : null
                ].filter(Boolean)
              }
            });

            if (existingContact) {
              throw new Error('Contato já existe');
            }

            // Prepara os dados do contato
            const contactData = {
              name: data.nome,
              phone,
              email: data.email || null,
              tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : [],
              stageId: defaultStageId,
              companyId,
              active: true
            };

            // Adiciona campos adicionais se existirem
            if (data.endereco) contactData.address = data.endereco;
            if (data.cidade) contactData.city = data.cidade;
            if (data.estado) contactData.state = data.estado;
            if (data.cep) contactData.zipCode = data.cep;
            if (data.observacoes) contactData.notes = data.observacoes;

            // Cria o contato
            const contact = await Contact.create(contactData);
            results.push(contact);
          } catch (error) {
            errors.push({
              row: totalProcessed,
              data,
              error: error.message
            });
          }
        })
        .on('end', () => {
          // Remove o arquivo temporário
          fs.unlink(filePath, (err) => {
            if (err) {
              logger.error(`Erro ao remover arquivo temporário: ${err.message}`);
            }
          });

          logger.info(`Importação concluída: ${results.length} contatos importados, ${errors.length} erros`);
          resolve({
            totalProcessed,
            successCount: results.length,
            errorCount: errors.length,
            errors
          });
        })
        .on('error', (error) => {
          logger.error(`Erro ao processar arquivo CSV: ${error.message}`);
          reject(error);
        });
    }).catch(error => {
      logger.error(`Erro ao buscar estágio padrão: ${error.message}`);
      reject(error);
    });
  });
};

/**
 * Adiciona tags a um contato
 * @param {number} contactId - ID do contato
 * @param {Array<string>} tags - Tags a serem adicionadas
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Contact>} - Contato atualizado
 */
const addTags = async (contactId, tags, companyId) => {
  try {
    // Busca o contato
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        companyId
      }
    });

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    // Adiciona as tags
    const currentTags = contact.tags || [];
    const newTags = [...new Set([...currentTags, ...tags])];

    // Atualiza o contato
    await contact.update({ tags: newTags });

    logger.info(`Tags adicionadas ao contato ${contactId}`);
    return contact;
  } catch (error) {
    logger.error(`Erro ao adicionar tags ao contato ${contactId}: ${error.message}`);
    throw error;
  }
};

/**
 * Remove tags de um contato
 * @param {number} contactId - ID do contato
 * @param {Array<string>} tags - Tags a serem removidas
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Contact>} - Contato atualizado
 */
const removeTags = async (contactId, tags, companyId) => {
  try {
    // Busca o contato
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        companyId
      }
    });

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    // Remove as tags
    const currentTags = contact.tags || [];
    const newTags = currentTags.filter(tag => !tags.includes(tag));

    // Atualiza o contato
    await contact.update({ tags: newTags });

    logger.info(`Tags removidas do contato ${contactId}`);
    return contact;
  } catch (error) {
    logger.error(`Erro ao remover tags do contato ${contactId}: ${error.message}`);
    throw error;
  }
};

/**
 * Move um contato para um estágio
 * @param {number} contactId - ID do contato
 * @param {number} stageId - ID do estágio
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Contact>} - Contato atualizado
 */
const moveToStage = async (contactId, stageId, companyId) => {
  try {
    // Busca o contato
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        companyId
      }
    });

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    // Verifica se o estágio existe
    const stage = await Stage.findOne({
      where: {
        id: stageId,
        companyId
      }
    });

    if (!stage) {
      throw new Error('Estágio não encontrado');
    }

    // Atualiza o contato
    await contact.update({ stageId });

    logger.info(`Contato ${contactId} movido para o estágio ${stageId}`);
    return contact;
  } catch (error) {
    logger.error(`Erro ao mover contato ${contactId} para o estágio ${stageId}: ${error.message}`);
    throw error;
  }
};

/**
 * Formata um número de telefone para o padrão internacional
 * @param {string} phone - Número de telefone
 * @returns {string} - Número formatado
 */
const formatPhoneNumber = (phone) => {
  // Remove caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Adiciona o código do país (Brasil) se não estiver presente
  if (cleaned.length <= 11) {
    cleaned = `55${cleaned}`;
  }
  
  return cleaned;
};

module.exports = {
  createContact,
  updateContact,
  importContacts,
  addTags,
  removeTags,
  moveToStage
};


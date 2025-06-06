/**
 * Controlador de Contatos
 * 
 * Este controlador gerencia as operações relacionadas aos contatos,
 * como listar, criar, atualizar, excluir e importar contatos.
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Contact } = require('../models');
const logger = require('../config/logger');

/**
 * Listar todos os contatos da empresa
 * @route GET /api/contacts
 */
const getAllContacts = async (req, res, next) => {
  try {
    const companyId = req.companyId; // Obtido do middleware de autenticação
    const { page = 1, limit = 10, search, tag, stage } = req.query;

    // Configuração da paginação
    const offset = (page - 1) * limit;
    
    // Configuração dos filtros
    const whereClause = { companyId };
    
    // Filtro por busca (nome ou telefone)
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { phone: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filtro por tag
    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }
    
    // Filtro por estágio
    if (stage) {
      whereClause.stage = stage;
    }

    // Busca os contatos com paginação e filtros
    const { count, rows: contacts } = await Contact.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    // Calcula o total de páginas
    const totalPages = Math.ceil(count / limit);

    res.status(200).json({
      success: true,
      count,
      totalPages,
      currentPage: parseInt(page),
      data: contacts
    });
  } catch (error) {
    logger.error(`Erro ao listar contatos: ${error.message}`);
    next(error);
  }
};

/**
 * Obter um contato específico
 * @route GET /api/contacts/:id
 */
const getContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o contato pelo ID e companyId
    const contact = await Contact.findOne({
      where: { id, companyId }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contato não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    logger.error(`Erro ao buscar contato: ${error.message}`);
    next(error);
  }
};

/**
 * Criar um novo contato
 * @route POST /api/contacts
 */
const createContact = async (req, res, next) => {
  try {
    const { name, phone, email, tags, notes, stage, source, customFields } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Verifica se os campos obrigatórios foram fornecidos
    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Nome e telefone são obrigatórios'
      });
    }

    // Verifica se o telefone já está cadastrado para esta empresa
    const existingContact = await Contact.findOne({
      where: { phone, companyId }
    });

    if (existingContact) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um contato com este número de telefone'
      });
    }

    // Cria o novo contato
    const contact = await Contact.create({
      name,
      phone,
      email,
      tags: tags || [],
      notes,
      stage,
      source,
      customFields: customFields || {},
      companyId
    });

    res.status(201).json({
      success: true,
      message: 'Contato criado com sucesso',
      data: contact
    });
  } catch (error) {
    logger.error(`Erro ao criar contato: ${error.message}`);
    next(error);
  }
};

/**
 * Atualizar um contato
 * @route PUT /api/contacts/:id
 */
const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, email, tags, notes, stage, source, customFields, active } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o contato pelo ID e companyId
    const contact = await Contact.findOne({
      where: { id, companyId }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contato não encontrado'
      });
    }

    // Verifica se o telefone já está cadastrado para outro contato desta empresa
    if (phone && phone !== contact.phone) {
      const existingContact = await Contact.findOne({
        where: { phone, companyId }
      });

      if (existingContact) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um contato com este número de telefone'
        });
      }
    }

    // Atualiza os campos do contato
    if (name) contact.name = name;
    if (phone) contact.phone = phone;
    if (email !== undefined) contact.email = email;
    if (tags) contact.tags = tags;
    if (notes !== undefined) contact.notes = notes;
    if (stage !== undefined) contact.stage = stage;
    if (source !== undefined) contact.source = source;
    if (customFields) contact.customFields = { ...contact.customFields, ...customFields };
    if (active !== undefined) contact.active = active;

    await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contato atualizado com sucesso',
      data: contact
    });
  } catch (error) {
    logger.error(`Erro ao atualizar contato: ${error.message}`);
    next(error);
  }
};

/**
 * Excluir um contato
 * @route DELETE /api/contacts/:id
 */
const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o contato pelo ID e companyId
    const contact = await Contact.findOne({
      where: { id, companyId }
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contato não encontrado'
      });
    }

    // Exclui o contato
    await contact.destroy();

    res.status(200).json({
      success: true,
      message: 'Contato excluído com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao excluir contato: ${error.message}`);
    next(error);
  }
};

/**
 * Importar contatos a partir de um arquivo CSV
 * @route POST /api/contacts/import
 */
const importContacts = async (req, res, next) => {
  try {
    // Verifica se um arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const companyId = req.companyId; // Obtido do middleware de autenticação
    const filePath = req.file.path;
    const results = [];
    const errors = [];
    let successCount = 0;
    let errorCount = 0;

    // Processa o arquivo CSV
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', async (data) => {
        try {
          // Verifica se os campos obrigatórios estão presentes
          if (!data.name || !data.phone) {
            errors.push({
              row: data,
              error: 'Nome e telefone são obrigatórios'
            });
            errorCount++;
            return;
          }

          // Formata as tags se existirem
          const tags = data.tags ? data.tags.split(',').map(tag => tag.trim()) : [];

          // Verifica se o contato já existe
          const existingContact = await Contact.findOne({
            where: { phone: data.phone, companyId }
          });

          if (existingContact) {
            errors.push({
              row: data,
              error: 'Já existe um contato com este número de telefone'
            });
            errorCount++;
            return;
          }

          // Cria o novo contato
          const contact = await Contact.create({
            name: data.name,
            phone: data.phone,
            email: data.email || null,
            tags,
            companyId
          });

          results.push(contact);
          successCount++;
        } catch (error) {
          errors.push({
            row: data,
            error: error.message
          });
          errorCount++;
        }
      })
      .on('end', () => {
        // Remove o arquivo temporário
        fs.unlinkSync(filePath);

        res.status(200).json({
          success: true,
          message: 'Importação concluída',
          data: {
            totalProcessed: successCount + errorCount,
            successCount,
            errorCount,
            errors
          }
        });
      })
      .on('error', (error) => {
        // Remove o arquivo temporário em caso de erro
        fs.unlinkSync(filePath);
        
        logger.error(`Erro ao processar arquivo CSV: ${error.message}`);
        next(error);
      });
  } catch (error) {
    logger.error(`Erro ao importar contatos: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllContacts,
  getContact,
  createContact,
  updateContact,
  deleteContact,
  importContacts
};


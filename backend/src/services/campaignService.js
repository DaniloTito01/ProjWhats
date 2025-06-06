/**
 * Serviço de Campanhas
 * 
 * Este serviço gerencia as operações relacionadas às campanhas de mensagens,
 * incluindo criação, agendamento, execução e monitoramento.
 */

const { Campaign, Contact, Message, Response } = require('../models');
const whatsappService = require('./whatsappService');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * Cria uma nova campanha
 * @param {Object} campaignData - Dados da campanha
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Campaign>} - Campanha criada
 */
const createCampaign = async (campaignData, companyId) => {
  try {
    // Cria a campanha no banco de dados
    const campaign = await Campaign.create({
      ...campaignData,
      companyId,
      status: 'draft',
      totalContacts: 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      responseCount: 0
    });

    logger.info(`Campanha ${campaign.id} criada para a empresa ${companyId}`);
    return campaign;
  } catch (error) {
    logger.error(`Erro ao criar campanha: ${error.message}`);
    throw error;
  }
};

/**
 * Atualiza uma campanha existente
 * @param {number} campaignId - ID da campanha
 * @param {Object} campaignData - Dados atualizados da campanha
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Campaign>} - Campanha atualizada
 */
const updateCampaign = async (campaignId, campaignData, companyId) => {
  try {
    // Busca a campanha
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    // Verifica se a campanha pode ser atualizada
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      throw new Error('Apenas campanhas em rascunho ou agendadas podem ser atualizadas');
    }

    // Atualiza a campanha
    await campaign.update(campaignData);

    logger.info(`Campanha ${campaignId} atualizada para a empresa ${companyId}`);
    return campaign;
  } catch (error) {
    logger.error(`Erro ao atualizar campanha ${campaignId}: ${error.message}`);
    throw error;
  }
};

/**
 * Prepara uma campanha para envio
 * @param {number} campaignId - ID da campanha
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Object>} - Resultado da preparação
 */
const prepareCampaign = async (campaignId, companyId) => {
  try {
    // Busca a campanha
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    // Verifica se a campanha pode ser preparada
    if (campaign.status !== 'draft') {
      throw new Error('Apenas campanhas em rascunho podem ser preparadas');
    }

    // Busca os contatos com base nos filtros da campanha
    const filters = campaign.filters || {};
    const contactQuery = {
      companyId,
      active: true
    };

    // Aplica filtros adicionais se existirem
    if (filters.tags && filters.tags.length > 0) {
      contactQuery.tags = {
        [Op.overlap]: filters.tags
      };
    }

    if (filters.stageId) {
      contactQuery.stageId = filters.stageId;
    }

    // Conta o total de contatos
    const totalContacts = await Contact.count({
      where: contactQuery
    });

    // Atualiza a campanha com o total de contatos
    await campaign.update({
      totalContacts,
      status: 'scheduled'
    });

    logger.info(`Campanha ${campaignId} preparada com ${totalContacts} contatos para a empresa ${companyId}`);
    
    return {
      campaign: campaign.toJSON(),
      totalContacts
    };
  } catch (error) {
    logger.error(`Erro ao preparar campanha ${campaignId}: ${error.message}`);
    throw error;
  }
};

/**
 * Inicia o envio de uma campanha
 * @param {number} campaignId - ID da campanha
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Campaign>} - Campanha iniciada
 */
const startCampaign = async (campaignId, companyId) => {
  try {
    // Busca a campanha
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    // Verifica se a campanha pode ser iniciada
    if (campaign.status !== 'scheduled') {
      throw new Error('Apenas campanhas agendadas podem ser iniciadas');
    }

    // Verifica se a sessão do WhatsApp está ativa
    const sessionName = `company_${companyId}`;
    if (!whatsappService.isSessionActive(sessionName)) {
      throw new Error('Sessão do WhatsApp não está ativa');
    }

    // Atualiza o status da campanha
    await campaign.update({
      status: 'in_progress',
      startedAt: new Date()
    });

    // Inicia o processo de envio em background
    processCampaign(campaign, companyId);

    logger.info(`Campanha ${campaignId} iniciada para a empresa ${companyId}`);
    return campaign;
  } catch (error) {
    logger.error(`Erro ao iniciar campanha ${campaignId}: ${error.message}`);
    throw error;
  }
};

/**
 * Processa o envio de uma campanha em background
 * @param {Campaign} campaign - Campanha a ser processada
 * @param {number} companyId - ID da empresa
 */
const processCampaign = async (campaign, companyId) => {
  try {
    // Nome da sessão do WhatsApp
    const sessionName = `company_${companyId}`;

    // Busca os contatos com base nos filtros da campanha
    const filters = campaign.filters || {};
    const contactQuery = {
      companyId,
      active: true
    };

    // Aplica filtros adicionais se existirem
    if (filters.tags && filters.tags.length > 0) {
      contactQuery.tags = {
        [Op.overlap]: filters.tags
      };
    }

    if (filters.stageId) {
      contactQuery.stageId = filters.stageId;
    }

    // Busca os contatos
    const contacts = await Contact.findAll({
      where: contactQuery
    });

    // Processa cada contato
    let sentCount = 0;
    for (const contact of contacts) {
      try {
        // Verifica se a campanha foi cancelada
        const updatedCampaign = await Campaign.findByPk(campaign.id);
        if (updatedCampaign.status === 'cancelled') {
          logger.info(`Campanha ${campaign.id} foi cancelada durante o processamento`);
          break;
        }

        // Substitui variáveis na mensagem
        let messageContent = campaign.message;
        messageContent = messageContent.replace(/{nome}/g, contact.name || '');
        messageContent = messageContent.replace(/{telefone}/g, contact.phone || '');
        messageContent = messageContent.replace(/{email}/g, contact.email || '');

        // Envia a mensagem
        const result = await whatsappService.sendText(sessionName, contact.phone, messageContent);

        // Registra a mensagem enviada
        await Message.create({
          campaignId: campaign.id,
          contactId: contact.id,
          content: messageContent,
          status: 'sent',
          sentAt: new Date()
        });

        // Incrementa o contador
        sentCount++;

        // Atualiza o progresso da campanha a cada 10 mensagens
        if (sentCount % 10 === 0) {
          await campaign.update({
            sentCount
          });
        }

        // Aguarda o intervalo configurado entre mensagens
        await new Promise(resolve => setTimeout(resolve, campaign.interval || 1000));
      } catch (error) {
        logger.error(`Erro ao enviar mensagem para o contato ${contact.id}: ${error.message}`);
        
        // Registra a falha
        await Message.create({
          campaignId: campaign.id,
          contactId: contact.id,
          content: campaign.message,
          status: 'failed',
          sentAt: new Date(),
          error: error.message
        });
      }
    }

    // Atualiza o status da campanha
    await campaign.update({
      status: 'completed',
      sentCount,
      completedAt: new Date()
    });

    logger.info(`Campanha ${campaign.id} concluída com ${sentCount} mensagens enviadas`);
  } catch (error) {
    logger.error(`Erro ao processar campanha ${campaign.id}: ${error.message}`);
    
    // Atualiza o status da campanha para erro
    await campaign.update({
      status: 'error',
      error: error.message
    });
  }
};

/**
 * Cancela uma campanha em andamento
 * @param {number} campaignId - ID da campanha
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Campaign>} - Campanha cancelada
 */
const cancelCampaign = async (campaignId, companyId) => {
  try {
    // Busca a campanha
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    // Verifica se a campanha pode ser cancelada
    if (campaign.status !== 'scheduled' && campaign.status !== 'in_progress') {
      throw new Error('Apenas campanhas agendadas ou em andamento podem ser canceladas');
    }

    // Atualiza o status da campanha
    await campaign.update({
      status: 'cancelled',
      cancelledAt: new Date()
    });

    logger.info(`Campanha ${campaignId} cancelada para a empresa ${companyId}`);
    return campaign;
  } catch (error) {
    logger.error(`Erro ao cancelar campanha ${campaignId}: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém estatísticas de uma campanha
 * @param {number} campaignId - ID da campanha
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Object>} - Estatísticas da campanha
 */
const getCampaignStats = async (campaignId, companyId) => {
  try {
    // Busca a campanha
    const campaign = await Campaign.findOne({
      where: {
        id: campaignId,
        companyId
      }
    });

    if (!campaign) {
      throw new Error('Campanha não encontrada');
    }

    // Conta as mensagens por status
    const sentCount = await Message.count({
      where: {
        campaignId,
        status: 'sent'
      }
    });

    const deliveredCount = await Message.count({
      where: {
        campaignId,
        status: 'delivered'
      }
    });

    const readCount = await Message.count({
      where: {
        campaignId,
        status: 'read'
      }
    });

    const failedCount = await Message.count({
      where: {
        campaignId,
        status: 'failed'
      }
    });

    // Conta as respostas
    const responseCount = await Response.count({
      where: {
        campaignId
      }
    });

    // Calcula as taxas
    const totalContacts = campaign.totalContacts || 0;
    const deliveryRate = totalContacts > 0 ? (deliveredCount / totalContacts) * 100 : 0;
    const readRate = deliveredCount > 0 ? (readCount / deliveredCount) * 100 : 0;
    const responseRate = deliveredCount > 0 ? (responseCount / deliveredCount) * 100 : 0;
    const failureRate = totalContacts > 0 ? (failedCount / totalContacts) * 100 : 0;

    // Atualiza as estatísticas na campanha
    await campaign.update({
      sentCount,
      deliveredCount,
      readCount,
      responseCount
    });

    logger.info(`Estatísticas obtidas para a campanha ${campaignId}`);
    
    return {
      campaign: campaign.toJSON(),
      stats: {
        totalContacts,
        sentCount,
        deliveredCount,
        readCount,
        failedCount,
        responseCount,
        deliveryRate,
        readRate,
        responseRate,
        failureRate
      }
    };
  } catch (error) {
    logger.error(`Erro ao obter estatísticas da campanha ${campaignId}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createCampaign,
  updateCampaign,
  prepareCampaign,
  startCampaign,
  cancelCampaign,
  getCampaignStats
};


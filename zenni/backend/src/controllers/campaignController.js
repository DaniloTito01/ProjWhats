/**
 * Controlador de Campanhas
 * 
 * Este controlador gerencia as operações relacionadas às campanhas,
 * como listar, criar, atualizar, excluir e executar campanhas.
 */

const { Campaign, Contact, Message } = require('../models');
const logger = require('../config/logger');

/**
 * Listar todas as campanhas da empresa
 * @route GET /api/campaigns
 */
const getAllCampaigns = async (req, res, next) => {
  try {
    const companyId = req.companyId; // Obtido do middleware de autenticação
    const { page = 1, limit = 10, status } = req.query;

    // Configuração da paginação
    const offset = (page - 1) * limit;
    
    // Configuração dos filtros
    const whereClause = { companyId };
    
    // Filtro por status
    if (status) {
      whereClause.status = status;
    }

    // Busca as campanhas com paginação e filtros
    const { count, rows: campaigns } = await Campaign.findAndCountAll({
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
      data: campaigns
    });
  } catch (error) {
    logger.error(`Erro ao listar campanhas: ${error.message}`);
    next(error);
  }
};

/**
 * Obter uma campanha específica
 * @route GET /api/campaigns/:id
 */
const getCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a campanha pelo ID e companyId
    const campaign = await Campaign.findOne({
      where: { id, companyId }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    logger.error(`Erro ao buscar campanha: ${error.message}`);
    next(error);
  }
};

/**
 * Criar uma nova campanha
 * @route POST /api/campaigns
 */
const createCampaign = async (req, res, next) => {
  try {
    const {
      name,
      description,
      messageTemplate,
      mediaType = 'none',
      mediaUrl,
      scheduledAt,
      targetTags,
      minDelaySeconds = 5,
      maxDelaySeconds = 15
    } = req.body;
    
    const companyId = req.companyId; // Obtido do middleware de autenticação
    const createdBy = req.user.id; // Obtido do middleware de autenticação

    // Verifica se os campos obrigatórios foram fornecidos
    if (!name || !messageTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Nome e modelo de mensagem são obrigatórios'
      });
    }

    // Verifica se o mediaUrl foi fornecido quando mediaType não é 'none'
    if (mediaType !== 'none' && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL da mídia é obrigatória quando o tipo de mídia não é "none"'
      });
    }

    // Cria a nova campanha
    const campaign = await Campaign.create({
      name,
      description,
      messageTemplate,
      mediaType,
      mediaUrl,
      scheduledAt,
      targetTags: targetTags || [],
      minDelaySeconds,
      maxDelaySeconds,
      companyId,
      createdBy
    });

    res.status(201).json({
      success: true,
      message: 'Campanha criada com sucesso',
      data: campaign
    });
  } catch (error) {
    logger.error(`Erro ao criar campanha: ${error.message}`);
    next(error);
  }
};

/**
 * Atualizar uma campanha
 * @route PUT /api/campaigns/:id
 */
const updateCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      messageTemplate,
      mediaType,
      mediaUrl,
      scheduledAt,
      targetTags,
      minDelaySeconds,
      maxDelaySeconds
    } = req.body;
    
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a campanha pelo ID e companyId
    const campaign = await Campaign.findOne({
      where: { id, companyId }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    // Verifica se a campanha pode ser atualizada
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível atualizar uma campanha em andamento ou concluída'
      });
    }

    // Verifica se o mediaUrl foi fornecido quando mediaType não é 'none'
    if (mediaType && mediaType !== 'none' && !mediaUrl) {
      return res.status(400).json({
        success: false,
        message: 'URL da mídia é obrigatória quando o tipo de mídia não é "none"'
      });
    }

    // Atualiza os campos da campanha
    if (name) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (messageTemplate) campaign.messageTemplate = messageTemplate;
    if (mediaType) campaign.mediaType = mediaType;
    if (mediaUrl !== undefined) campaign.mediaUrl = mediaUrl;
    if (scheduledAt !== undefined) campaign.scheduledAt = scheduledAt;
    if (targetTags) campaign.targetTags = targetTags;
    if (minDelaySeconds) campaign.minDelaySeconds = minDelaySeconds;
    if (maxDelaySeconds) campaign.maxDelaySeconds = maxDelaySeconds;

    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Campanha atualizada com sucesso',
      data: campaign
    });
  } catch (error) {
    logger.error(`Erro ao atualizar campanha: ${error.message}`);
    next(error);
  }
};

/**
 * Excluir uma campanha
 * @route DELETE /api/campaigns/:id
 */
const deleteCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a campanha pelo ID e companyId
    const campaign = await Campaign.findOne({
      where: { id, companyId }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    // Verifica se a campanha pode ser excluída
    if (campaign.status === 'in_progress') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir uma campanha em andamento'
      });
    }

    // Exclui a campanha
    await campaign.destroy();

    res.status(200).json({
      success: true,
      message: 'Campanha excluída com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao excluir campanha: ${error.message}`);
    next(error);
  }
};

/**
 * Preparar uma campanha para envio
 * @route POST /api/campaigns/:id/prepare
 */
const prepareCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a campanha pelo ID e companyId
    const campaign = await Campaign.findOne({
      where: { id, companyId }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    // Verifica se a campanha pode ser preparada
    if (campaign.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Apenas campanhas em rascunho podem ser preparadas'
      });
    }

    // Busca os contatos que correspondem aos critérios da campanha
    let whereClause = { companyId, active: true };
    
    // Filtra por tags se especificado
    if (campaign.targetTags && campaign.targetTags.length > 0) {
      whereClause.tags = { [Op.overlap]: campaign.targetTags };
    }

    const contacts = await Contact.findAll({ where: whereClause });

    // Atualiza o total de contatos da campanha
    campaign.totalContacts = contacts.length;
    
    // Se houver uma data agendada, atualiza o status para 'scheduled'
    if (campaign.scheduledAt && new Date(campaign.scheduledAt) > new Date()) {
      campaign.status = 'scheduled';
    }
    
    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Campanha preparada com sucesso',
      data: {
        campaign,
        totalContacts: contacts.length
      }
    });
  } catch (error) {
    logger.error(`Erro ao preparar campanha: ${error.message}`);
    next(error);
  }
};

/**
 * Iniciar o envio de uma campanha
 * @route POST /api/campaigns/:id/start
 */
const startCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a campanha pelo ID e companyId
    const campaign = await Campaign.findOne({
      where: { id, companyId }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    // Verifica se a campanha pode ser iniciada
    if (campaign.status !== 'draft' && campaign.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Apenas campanhas em rascunho ou agendadas podem ser iniciadas'
      });
    }

    // Atualiza o status da campanha para 'in_progress'
    campaign.status = 'in_progress';
    await campaign.save();

    // Inicia o processo de envio em segundo plano
    // Nota: Em uma implementação real, isso seria feito por um worker ou job queue
    // Aqui, apenas simulamos o início do processo
    
    res.status(200).json({
      success: true,
      message: 'Campanha iniciada com sucesso',
      data: campaign
    });

    // Aqui seria chamado o serviço de envio de mensagens
    // sendCampaignMessages(campaign.id);
  } catch (error) {
    logger.error(`Erro ao iniciar campanha: ${error.message}`);
    next(error);
  }
};

/**
 * Cancelar uma campanha
 * @route POST /api/campaigns/:id/cancel
 */
const cancelCampaign = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a campanha pelo ID e companyId
    const campaign = await Campaign.findOne({
      where: { id, companyId }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    // Verifica se a campanha pode ser cancelada
    if (campaign.status === 'completed' || campaign.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível cancelar uma campanha já concluída ou cancelada'
      });
    }

    // Atualiza o status da campanha para 'cancelled'
    campaign.status = 'cancelled';
    await campaign.save();

    res.status(200).json({
      success: true,
      message: 'Campanha cancelada com sucesso',
      data: campaign
    });
  } catch (error) {
    logger.error(`Erro ao cancelar campanha: ${error.message}`);
    next(error);
  }
};

/**
 * Obter estatísticas de uma campanha
 * @route GET /api/campaigns/:id/stats
 */
const getCampaignStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a campanha pelo ID e companyId
    const campaign = await Campaign.findOne({
      where: { id, companyId }
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campanha não encontrada'
      });
    }

    // Busca as estatísticas das mensagens
    const stats = {
      total: campaign.totalContacts,
      sent: campaign.sentCount,
      delivered: campaign.deliveredCount,
      read: campaign.readCount,
      failed: campaign.failedCount,
      responses: campaign.responseCount,
      pending: campaign.totalContacts - campaign.sentCount - campaign.failedCount,
      deliveryRate: campaign.sentCount > 0 ? (campaign.deliveredCount / campaign.sentCount * 100).toFixed(2) : 0,
      readRate: campaign.deliveredCount > 0 ? (campaign.readCount / campaign.deliveredCount * 100).toFixed(2) : 0,
      responseRate: campaign.sentCount > 0 ? (campaign.responseCount / campaign.sentCount * 100).toFixed(2) : 0,
      failureRate: campaign.sentCount > 0 ? (campaign.failedCount / campaign.sentCount * 100).toFixed(2) : 0
    };

    res.status(200).json({
      success: true,
      data: {
        campaign,
        stats
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter estatísticas da campanha: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  prepareCampaign,
  startCampaign,
  cancelCampaign,
  getCampaignStats
};


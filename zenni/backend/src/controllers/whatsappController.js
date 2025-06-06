/**
 * Controlador de WhatsApp
 * 
 * Este controlador gerencia as operações relacionadas ao WhatsApp,
 * como iniciar sessões, enviar mensagens e gerenciar conexões.
 */

const whatsappService = require('../services/whatsappService');
const logger = require('../config/logger');
const fs = require('fs');
const path = require('path');

/**
 * Inicia uma sessão do WhatsApp
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const initSession = async (req, res) => {
  try {
    const { companyId } = req.company;
    const sessionName = `company_${companyId}`;

    // Inicia a sessão do WhatsApp
    await whatsappService.initSession(sessionName, companyId);

    res.status(200).json({
      success: true,
      message: 'Sessão do WhatsApp iniciada com sucesso',
      data: { sessionName }
    });
  } catch (error) {
    logger.error(`Erro ao iniciar sessão do WhatsApp: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao iniciar sessão do WhatsApp',
      error: error.message
    });
  }
};

/**
 * Verifica o status da sessão do WhatsApp
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const checkSessionStatus = async (req, res) => {
  try {
    const { companyId } = req.company;
    const sessionName = `company_${companyId}`;

    // Verifica se a sessão está ativa
    const isActive = whatsappService.isSessionActive(sessionName);
    
    if (isActive) {
      // Obtém o estado da conexão
      const connectionState = await whatsappService.getConnectionState(sessionName);
      
      res.status(200).json({
        success: true,
        data: {
          isActive,
          connectionState
        }
      });
    } else {
      res.status(200).json({
        success: true,
        data: {
          isActive: false,
          connectionState: 'DISCONNECTED'
        }
      });
    }
  } catch (error) {
    logger.error(`Erro ao verificar status da sessão do WhatsApp: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar status da sessão do WhatsApp',
      error: error.message
    });
  }
};

/**
 * Envia uma mensagem de texto via WhatsApp
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const sendText = async (req, res) => {
  try {
    const { companyId } = req.company;
    const sessionName = `company_${companyId}`;
    const { to, message } = req.body;

    // Valida os parâmetros
    if (!to || !message) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone e mensagem são obrigatórios'
      });
    }

    // Verifica se a sessão está ativa
    if (!whatsappService.isSessionActive(sessionName)) {
      return res.status(400).json({
        success: false,
        message: 'Sessão do WhatsApp não está ativa'
      });
    }

    // Envia a mensagem
    const result = await whatsappService.sendText(sessionName, to, message);

    res.status(200).json({
      success: true,
      message: 'Mensagem enviada com sucesso',
      data: result
    });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem de texto: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem de texto',
      error: error.message
    });
  }
};

/**
 * Envia uma mensagem com mídia via WhatsApp
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const sendMedia = async (req, res) => {
  try {
    const { companyId } = req.company;
    const sessionName = `company_${companyId}`;
    const { to, caption, mediaType } = req.body;
    const mediaFile = req.file;

    // Valida os parâmetros
    if (!to || !mediaFile) {
      return res.status(400).json({
        success: false,
        message: 'Número de telefone e arquivo de mídia são obrigatórios'
      });
    }

    // Verifica se a sessão está ativa
    if (!whatsappService.isSessionActive(sessionName)) {
      return res.status(400).json({
        success: false,
        message: 'Sessão do WhatsApp não está ativa'
      });
    }

    // Envia a mídia
    const result = await whatsappService.sendMedia(
      sessionName,
      to,
      mediaFile.path,
      caption || '',
      mediaType || 'image'
    );

    res.status(200).json({
      success: true,
      message: 'Mídia enviada com sucesso',
      data: result
    });
  } catch (error) {
    logger.error(`Erro ao enviar mídia: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mídia',
      error: error.message
    });
  }
};

/**
 * Envia uma mensagem com botões via WhatsApp
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const sendButtons = async (req, res) => {
  try {
    const { companyId } = req.company;
    const sessionName = `company_${companyId}`;
    const { to, title, body, buttons } = req.body;

    // Valida os parâmetros
    if (!to || !title || !body || !buttons || !Array.isArray(buttons)) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos'
      });
    }

    // Verifica se a sessão está ativa
    if (!whatsappService.isSessionActive(sessionName)) {
      return res.status(400).json({
        success: false,
        message: 'Sessão do WhatsApp não está ativa'
      });
    }

    // Envia a mensagem com botões
    const result = await whatsappService.sendButtons(sessionName, to, title, body, buttons);

    res.status(200).json({
      success: true,
      message: 'Mensagem com botões enviada com sucesso',
      data: result
    });
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com botões: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao enviar mensagem com botões',
      error: error.message
    });
  }
};

/**
 * Fecha a sessão do WhatsApp
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const closeSession = async (req, res) => {
  try {
    const { companyId } = req.company;
    const sessionName = `company_${companyId}`;

    // Fecha a sessão
    const result = await whatsappService.closeSession(sessionName);

    if (result) {
      res.status(200).json({
        success: true,
        message: 'Sessão do WhatsApp fechada com sucesso'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Sessão do WhatsApp não encontrada ou já fechada'
      });
    }
  } catch (error) {
    logger.error(`Erro ao fechar sessão do WhatsApp: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao fechar sessão do WhatsApp',
      error: error.message
    });
  }
};

/**
 * Obtém informações do perfil do WhatsApp
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getProfileInfo = async (req, res) => {
  try {
    const { companyId } = req.company;
    const sessionName = `company_${companyId}`;

    // Verifica se a sessão está ativa
    if (!whatsappService.isSessionActive(sessionName)) {
      return res.status(400).json({
        success: false,
        message: 'Sessão do WhatsApp não está ativa'
      });
    }

    // Obtém as informações do perfil
    const profileInfo = await whatsappService.getProfileInfo(sessionName);

    res.status(200).json({
      success: true,
      data: profileInfo
    });
  } catch (error) {
    logger.error(`Erro ao obter informações do perfil: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter informações do perfil',
      error: error.message
    });
  }
};

module.exports = {
  initSession,
  checkSessionStatus,
  sendText,
  sendMedia,
  sendButtons,
  closeSession,
  getProfileInfo
};


/**
 * Serviço de WhatsApp
 * 
 * Este serviço gerencia a conexão com o WhatsApp usando o Venom Bot,
 * permitindo o envio de mensagens e o gerenciamento de sessões.
 */

const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');

// Importação condicional do venom-bot
// Isso permite que o sistema funcione mesmo sem o venom-bot instalado
let venom;
try {
  venom = require('venom-bot');
} catch (error) {
  logger.warn('Venom Bot não está instalado. O serviço de WhatsApp não estará disponível.');
}

// Armazena as sessões ativas do WhatsApp
const sessions = new Map();

/**
 * Inicializa uma sessão do WhatsApp
 * @param {string} sessionName - Nome da sessão
 * @param {string} companyId - ID da empresa
 * @returns {Promise<any>} - Cliente do WhatsApp
 */
const initSession = async (sessionName, companyId) => {
  if (!venom) {
    throw new Error('Venom Bot não está instalado');
  }

  try {
    // Verifica se a sessão já existe
    if (sessions.has(sessionName)) {
      logger.info(`Sessão ${sessionName} já está ativa`);
      return sessions.get(sessionName);
    }

    // Diretório para armazenar os tokens da sessão
    const sessionDir = path.join(__dirname, '../../tokens', companyId);
    
    // Cria o diretório se não existir
    if (!fs.existsSync(sessionDir)) {
      fs.mkdirSync(sessionDir, { recursive: true });
    }

    logger.info(`Iniciando sessão ${sessionName} para a empresa ${companyId}`);

    // Cria uma nova sessão do WhatsApp
    const client = await venom.create(
      sessionName,
      // Função para capturar o QR code
      (base64Qrimg, asciiQR, attempts, urlCode) => {
        logger.info(`QR Code gerado para a sessão ${sessionName} (tentativa ${attempts})`);
        // Aqui você pode salvar o QR code ou enviá-lo para o frontend
        // O QR code está disponível em base64Qrimg
      },
      // Função para monitorar o status da sessão
      (statusSession, session) => {
        logger.info(`Status da sessão ${session}: ${statusSession}`);
      },
      // Opções da sessão
      {
        folderNameToken: sessionDir,
        headless: 'new', // Usar o novo modo headless do Puppeteer
        useChrome: false,
        debug: false,
        logQR: true,
        browserArgs: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
        disableWelcome: true,
        updatesLog: false,
        autoClose: 60000,
        createPathFileToken: true,
      }
    );

    // Configura o evento de desconexão
    client.onStateChange((state) => {
      if (state === 'CONFLICT' || state === 'UNLAUNCHED') {
        client.useHere();
      }
      if (state === 'DISCONNECTED') {
        logger.warn(`Sessão ${sessionName} desconectada`);
        sessions.delete(sessionName);
      }
    });

    // Armazena a sessão
    sessions.set(sessionName, client);
    logger.info(`Sessão ${sessionName} iniciada com sucesso`);

    return client;
  } catch (error) {
    logger.error(`Erro ao iniciar sessão ${sessionName}: ${error.message}`);
    throw error;
  }
};

/**
 * Envia uma mensagem de texto via WhatsApp
 * @param {string} sessionName - Nome da sessão
 * @param {string} to - Número de telefone do destinatário (com código do país)
 * @param {string} message - Mensagem a ser enviada
 * @returns {Promise<any>} - Resultado do envio
 */
const sendText = async (sessionName, to, message) => {
  try {
    const client = sessions.get(sessionName);
    if (!client) {
      throw new Error(`Sessão ${sessionName} não encontrada`);
    }

    // Formata o número de telefone se necessário
    const formattedNumber = formatPhoneNumber(to);

    // Envia a mensagem
    const result = await client.sendText(formattedNumber, message);
    logger.info(`Mensagem enviada para ${formattedNumber} via sessão ${sessionName}`);
    
    return result;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem para ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Envia uma mensagem com mídia via WhatsApp
 * @param {string} sessionName - Nome da sessão
 * @param {string} to - Número de telefone do destinatário (com código do país)
 * @param {string} mediaPath - Caminho para o arquivo de mídia
 * @param {string} caption - Legenda da mídia (opcional)
 * @param {string} mediaType - Tipo de mídia ('image', 'video', 'audio', 'document')
 * @returns {Promise<any>} - Resultado do envio
 */
const sendMedia = async (sessionName, to, mediaPath, caption = '', mediaType = 'image') => {
  try {
    const client = sessions.get(sessionName);
    if (!client) {
      throw new Error(`Sessão ${sessionName} não encontrada`);
    }

    // Formata o número de telefone se necessário
    const formattedNumber = formatPhoneNumber(to);

    // Verifica se o arquivo existe
    if (!fs.existsSync(mediaPath)) {
      throw new Error(`Arquivo não encontrado: ${mediaPath}`);
    }

    let result;
    
    // Envia a mídia de acordo com o tipo
    switch (mediaType.toLowerCase()) {
      case 'image':
        result = await client.sendImage(formattedNumber, mediaPath, path.basename(mediaPath), caption);
        break;
      case 'video':
        result = await client.sendVideoAsGif(formattedNumber, mediaPath, path.basename(mediaPath), caption);
        break;
      case 'audio':
        result = await client.sendVoice(formattedNumber, mediaPath);
        break;
      case 'document':
        result = await client.sendFile(formattedNumber, mediaPath, path.basename(mediaPath), caption);
        break;
      default:
        throw new Error(`Tipo de mídia não suportado: ${mediaType}`);
    }

    logger.info(`Mídia ${mediaType} enviada para ${formattedNumber} via sessão ${sessionName}`);
    
    return result;
  } catch (error) {
    logger.error(`Erro ao enviar mídia para ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Envia uma mensagem com botões via WhatsApp
 * @param {string} sessionName - Nome da sessão
 * @param {string} to - Número de telefone do destinatário (com código do país)
 * @param {string} title - Título da mensagem
 * @param {string} body - Corpo da mensagem
 * @param {Array<{buttonText: string, id: string}>} buttons - Botões a serem exibidos
 * @returns {Promise<any>} - Resultado do envio
 */
const sendButtons = async (sessionName, to, title, body, buttons) => {
  try {
    const client = sessions.get(sessionName);
    if (!client) {
      throw new Error(`Sessão ${sessionName} não encontrada`);
    }

    // Formata o número de telefone se necessário
    const formattedNumber = formatPhoneNumber(to);

    // Envia a mensagem com botões
    const result = await client.sendButtons(formattedNumber, title, buttons, body);
    logger.info(`Mensagem com botões enviada para ${formattedNumber} via sessão ${sessionName}`);
    
    return result;
  } catch (error) {
    logger.error(`Erro ao enviar mensagem com botões para ${to}: ${error.message}`);
    throw error;
  }
};

/**
 * Fecha uma sessão do WhatsApp
 * @param {string} sessionName - Nome da sessão
 * @returns {Promise<boolean>} - Resultado do fechamento
 */
const closeSession = async (sessionName) => {
  try {
    const client = sessions.get(sessionName);
    if (!client) {
      logger.warn(`Sessão ${sessionName} não encontrada para fechamento`);
      return false;
    }

    // Fecha a sessão
    await client.close();
    sessions.delete(sessionName);
    logger.info(`Sessão ${sessionName} fechada com sucesso`);
    
    return true;
  } catch (error) {
    logger.error(`Erro ao fechar sessão ${sessionName}: ${error.message}`);
    sessions.delete(sessionName);
    return false;
  }
};

/**
 * Verifica se uma sessão está ativa
 * @param {string} sessionName - Nome da sessão
 * @returns {boolean} - Status da sessão
 */
const isSessionActive = (sessionName) => {
  return sessions.has(sessionName);
};

/**
 * Formata um número de telefone para o formato esperado pelo WhatsApp
 * @param {string} phone - Número de telefone
 * @returns {string} - Número formatado
 */
const formatPhoneNumber = (phone) => {
  // Remove caracteres não numéricos
  let cleaned = phone.replace(/\D/g, '');
  
  // Adiciona o sufixo @c.us se não estiver presente
  if (!cleaned.endsWith('@c.us')) {
    cleaned = `${cleaned}@c.us`;
  }
  
  return cleaned;
};

/**
 * Configura um webhook para receber mensagens
 * @param {string} sessionName - Nome da sessão
 * @param {Function} callback - Função de callback para processar as mensagens
 */
const setupWebhook = (sessionName, callback) => {
  try {
    const client = sessions.get(sessionName);
    if (!client) {
      throw new Error(`Sessão ${sessionName} não encontrada`);
    }

    // Configura o evento de mensagem
    client.onMessage((message) => {
      logger.info(`Mensagem recebida na sessão ${sessionName} de ${message.from}`);
      callback(message);
    });

    logger.info(`Webhook configurado para a sessão ${sessionName}`);
  } catch (error) {
    logger.error(`Erro ao configurar webhook para sessão ${sessionName}: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém o status de conexão do WhatsApp
 * @param {string} sessionName - Nome da sessão
 * @returns {Promise<string>} - Status da conexão
 */
const getConnectionState = async (sessionName) => {
  try {
    const client = sessions.get(sessionName);
    if (!client) {
      return 'DISCONNECTED';
    }

    const state = await client.getConnectionState();
    return state;
  } catch (error) {
    logger.error(`Erro ao obter estado da conexão para sessão ${sessionName}: ${error.message}`);
    return 'ERROR';
  }
};

/**
 * Obtém informações do perfil do WhatsApp
 * @param {string} sessionName - Nome da sessão
 * @returns {Promise<any>} - Informações do perfil
 */
const getProfileInfo = async (sessionName) => {
  try {
    const client = sessions.get(sessionName);
    if (!client) {
      throw new Error(`Sessão ${sessionName} não encontrada`);
    }

    const profileInfo = await client.getHostDevice();
    return profileInfo;
  } catch (error) {
    logger.error(`Erro ao obter informações do perfil para sessão ${sessionName}: ${error.message}`);
    throw error;
  }
};

module.exports = {
  initSession,
  sendText,
  sendMedia,
  sendButtons,
  closeSession,
  isSessionActive,
  setupWebhook,
  getConnectionState,
  getProfileInfo
};


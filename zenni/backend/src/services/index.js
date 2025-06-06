/**
 * Índice de Serviços
 * 
 * Este arquivo exporta todos os serviços disponíveis na aplicação.
 */

const authService = require('./authService');
const campaignService = require('./campaignService');
const contactService = require('./contactService');
const stageService = require('./stageService');
const whatsappService = require('./whatsappService');

module.exports = {
  authService,
  campaignService,
  contactService,
  stageService,
  whatsappService
};


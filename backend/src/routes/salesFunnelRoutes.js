/**
 * Rotas de Funil de Vendas
 * 
 * Este arquivo define as rotas para operações relacionadas ao funil de vendas,
 * incluindo análise de conversão, acompanhamento de leads e relatórios.
 */

const express = require('express');
const router = express.Router();
const salesFunnelController = require('../controllers/salesFunnelController');
const authMiddleware = require('../middlewares/auth');

// Todas as rotas de funil de vendas requerem autenticação
router.use(authMiddleware);

// Rota para obter estatísticas do funil de vendas
router.get('/stats', salesFunnelController.getFunnelStats);

// Rota para obter a distribuição de contatos por estágio
router.get('/distribution', salesFunnelController.getContactDistribution);

// Rota para obter a taxa de conversão por campanha
router.get('/campaigns/conversion', salesFunnelController.getCampaignConversionRates);

// Rota para obter a previsão de vendas
router.get('/forecast', salesFunnelController.getSalesForecast);

// Rota para obter os contatos parados
router.get('/stuck-contacts', salesFunnelController.getStuckContacts);

module.exports = router;


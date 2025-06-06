/**
 * Rotas de Campanhas
 * 
 * Este arquivo define as rotas relacionadas às campanhas,
 * como listar, criar, atualizar, excluir e executar campanhas.
 */

const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaignController');
const { authenticate } = require('../middlewares/auth');

// Todas as rotas de campanhas requerem autenticação
router.use(authenticate);

// Rotas para gerenciamento de campanhas
router.get('/', campaignController.getAllCampaigns);
router.get('/:id', campaignController.getCampaign);
router.post('/', campaignController.createCampaign);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

// Rotas para operações específicas de campanhas
router.post('/:id/prepare', campaignController.prepareCampaign);
router.post('/:id/start', campaignController.startCampaign);
router.post('/:id/cancel', campaignController.cancelCampaign);
router.get('/:id/stats', campaignController.getCampaignStats);

module.exports = router;


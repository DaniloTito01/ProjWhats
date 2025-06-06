/**
 * Rotas de Estágios do Funil de Vendas
 * 
 * Este arquivo define as rotas relacionadas aos estágios do funil de vendas,
 * como listar, criar, atualizar e excluir estágios.
 */

const express = require('express');
const router = express.Router();
const stageController = require('../controllers/stageController');
const { authenticate } = require('../middlewares/auth');

// Todas as rotas de estágios requerem autenticação
router.use(authenticate);

// Rotas para gerenciamento de estágios
router.get('/', stageController.getAllStages);
router.get('/:id', stageController.getStage);
router.post('/', stageController.createStage);
router.put('/:id', stageController.updateStage);
router.put('/reorder', stageController.reorderStages);
router.put('/:id/archive', stageController.archiveStage);
router.put('/:id/restore', stageController.restoreStage);
router.delete('/:id', stageController.deleteStage);

module.exports = router;


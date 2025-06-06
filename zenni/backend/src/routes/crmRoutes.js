/**
 * Rotas de CRM
 * 
 * Este arquivo define as rotas para operações relacionadas ao CRM,
 * incluindo atividades, tarefas, notas e interações com contatos.
 */

const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crmController');
const authMiddleware = require('../middlewares/auth');

// Todas as rotas de CRM requerem autenticação
router.use(authMiddleware);

// Rotas de atividades
router.post('/contacts/:contactId/activities', crmController.createActivity);
router.put('/activities/:activityId', crmController.updateActivity);
router.put('/activities/:activityId/complete', crmController.completeActivity);

// Rotas de tarefas
router.post('/contacts/:contactId/tasks', crmController.createTask);
router.put('/tasks/:taskId', crmController.updateTask);
router.put('/tasks/:taskId/complete', crmController.completeTask);

// Rotas de notas
router.post('/contacts/:contactId/notes', crmController.addNote);
router.put('/notes/:noteId', crmController.updateNote);

// Rotas de histórico
router.get('/contacts/:contactId/history', crmController.getContactHistory);

// Rotas de pendências
router.get('/pending/tasks', crmController.getPendingTasks);
router.get('/pending/activities', crmController.getPendingActivities);

module.exports = router;


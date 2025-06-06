/**
 * Controlador de CRM
 * 
 * Este controlador gerencia as operações relacionadas ao CRM,
 * incluindo atividades, tarefas, notas e interações com contatos.
 */

const crmService = require('../services/crmService');
const logger = require('../config/logger');

/**
 * Cria uma nova atividade para um contato
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const createActivity = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { id: userId } = req.user;
    const { contactId } = req.params;
    const activityData = req.body;

    const activity = await crmService.createActivity(activityData, contactId, companyId, userId);

    res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: activity
    });
  } catch (error) {
    logger.error(`Erro ao criar atividade: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar atividade',
      error: error.message
    });
  }
};

/**
 * Atualiza uma atividade existente
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const updateActivity = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { activityId } = req.params;
    const activityData = req.body;

    const activity = await crmService.updateActivity(activityId, activityData, companyId);

    res.status(200).json({
      success: true,
      message: 'Atividade atualizada com sucesso',
      data: activity
    });
  } catch (error) {
    logger.error(`Erro ao atualizar atividade: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar atividade',
      error: error.message
    });
  }
};

/**
 * Marca uma atividade como concluída
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const completeActivity = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { activityId } = req.params;

    const activity = await crmService.completeActivity(activityId, companyId);

    res.status(200).json({
      success: true,
      message: 'Atividade marcada como concluída',
      data: activity
    });
  } catch (error) {
    logger.error(`Erro ao marcar atividade como concluída: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar atividade como concluída',
      error: error.message
    });
  }
};

/**
 * Cria uma nova tarefa para um contato
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const createTask = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { id: userId } = req.user;
    const { contactId } = req.params;
    const taskData = req.body;

    const task = await crmService.createTask(taskData, contactId, companyId, userId);

    res.status(201).json({
      success: true,
      message: 'Tarefa criada com sucesso',
      data: task
    });
  } catch (error) {
    logger.error(`Erro ao criar tarefa: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar tarefa',
      error: error.message
    });
  }
};

/**
 * Atualiza uma tarefa existente
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const updateTask = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { taskId } = req.params;
    const taskData = req.body;

    const task = await crmService.updateTask(taskId, taskData, companyId);

    res.status(200).json({
      success: true,
      message: 'Tarefa atualizada com sucesso',
      data: task
    });
  } catch (error) {
    logger.error(`Erro ao atualizar tarefa: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar tarefa',
      error: error.message
    });
  }
};

/**
 * Marca uma tarefa como concluída
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const completeTask = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { taskId } = req.params;

    const task = await crmService.completeTask(taskId, companyId);

    res.status(200).json({
      success: true,
      message: 'Tarefa marcada como concluída',
      data: task
    });
  } catch (error) {
    logger.error(`Erro ao marcar tarefa como concluída: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao marcar tarefa como concluída',
      error: error.message
    });
  }
};

/**
 * Adiciona uma nota a um contato
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const addNote = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { id: userId } = req.user;
    const { contactId } = req.params;
    const noteData = req.body;

    const note = await crmService.addNote(noteData, contactId, companyId, userId);

    res.status(201).json({
      success: true,
      message: 'Nota adicionada com sucesso',
      data: note
    });
  } catch (error) {
    logger.error(`Erro ao adicionar nota: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao adicionar nota',
      error: error.message
    });
  }
};

/**
 * Atualiza uma nota existente
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const updateNote = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { noteId } = req.params;
    const noteData = req.body;

    const note = await crmService.updateNote(noteId, noteData, companyId);

    res.status(200).json({
      success: true,
      message: 'Nota atualizada com sucesso',
      data: note
    });
  } catch (error) {
    logger.error(`Erro ao atualizar nota: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar nota',
      error: error.message
    });
  }
};

/**
 * Obtém o histórico de atividades de um contato
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getContactHistory = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { contactId } = req.params;

    const history = await crmService.getContactHistory(contactId, companyId);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    logger.error(`Erro ao obter histórico do contato: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter histórico do contato',
      error: error.message
    });
  }
};

/**
 * Obtém as tarefas pendentes de um usuário
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getPendingTasks = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { id: userId } = req.user;

    const pendingTasks = await crmService.getPendingTasks(userId, companyId);

    res.status(200).json({
      success: true,
      data: pendingTasks
    });
  } catch (error) {
    logger.error(`Erro ao obter tarefas pendentes: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter tarefas pendentes',
      error: error.message
    });
  }
};

/**
 * Obtém as atividades pendentes de um usuário
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getPendingActivities = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { id: userId } = req.user;

    const pendingActivities = await crmService.getPendingActivities(userId, companyId);

    res.status(200).json({
      success: true,
      data: pendingActivities
    });
  } catch (error) {
    logger.error(`Erro ao obter atividades pendentes: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter atividades pendentes',
      error: error.message
    });
  }
};

module.exports = {
  createActivity,
  updateActivity,
  completeActivity,
  createTask,
  updateTask,
  completeTask,
  addNote,
  updateNote,
  getContactHistory,
  getPendingTasks,
  getPendingActivities
};


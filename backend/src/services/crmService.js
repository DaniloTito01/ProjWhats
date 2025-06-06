/**
 * Serviço de CRM
 * 
 * Este serviço gerencia as operações relacionadas ao CRM,
 * incluindo atividades, tarefas, notas e interações com contatos.
 */

const { Contact, Activity, Task, Note, User } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');

/**
 * Cria uma nova atividade para um contato
 * @param {Object} activityData - Dados da atividade
 * @param {number} contactId - ID do contato
 * @param {number} companyId - ID da empresa
 * @param {number} userId - ID do usuário
 * @returns {Promise<Activity>} - Atividade criada
 */
const createActivity = async (activityData, contactId, companyId, userId) => {
  try {
    // Verifica se o contato existe
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        companyId
      }
    });

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    // Cria a atividade
    const activity = await Activity.create({
      ...activityData,
      contactId,
      companyId,
      userId,
      completed: false
    });

    logger.info(`Atividade ${activity.id} criada para o contato ${contactId}`);
    return activity;
  } catch (error) {
    logger.error(`Erro ao criar atividade: ${error.message}`);
    throw error;
  }
};

/**
 * Atualiza uma atividade existente
 * @param {number} activityId - ID da atividade
 * @param {Object} activityData - Dados atualizados da atividade
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Activity>} - Atividade atualizada
 */
const updateActivity = async (activityId, activityData, companyId) => {
  try {
    // Busca a atividade
    const activity = await Activity.findOne({
      where: {
        id: activityId,
        companyId
      }
    });

    if (!activity) {
      throw new Error('Atividade não encontrada');
    }

    // Atualiza a atividade
    await activity.update(activityData);

    logger.info(`Atividade ${activityId} atualizada`);
    return activity;
  } catch (error) {
    logger.error(`Erro ao atualizar atividade ${activityId}: ${error.message}`);
    throw error;
  }
};

/**
 * Marca uma atividade como concluída
 * @param {number} activityId - ID da atividade
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Activity>} - Atividade atualizada
 */
const completeActivity = async (activityId, companyId) => {
  try {
    // Busca a atividade
    const activity = await Activity.findOne({
      where: {
        id: activityId,
        companyId
      }
    });

    if (!activity) {
      throw new Error('Atividade não encontrada');
    }

    // Marca como concluída
    await activity.update({
      completed: true,
      completedAt: new Date()
    });

    logger.info(`Atividade ${activityId} marcada como concluída`);
    return activity;
  } catch (error) {
    logger.error(`Erro ao marcar atividade ${activityId} como concluída: ${error.message}`);
    throw error;
  }
};

/**
 * Cria uma nova tarefa para um contato
 * @param {Object} taskData - Dados da tarefa
 * @param {number} contactId - ID do contato
 * @param {number} companyId - ID da empresa
 * @param {number} userId - ID do usuário
 * @returns {Promise<Task>} - Tarefa criada
 */
const createTask = async (taskData, contactId, companyId, userId) => {
  try {
    // Verifica se o contato existe
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        companyId
      }
    });

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    // Cria a tarefa
    const task = await Task.create({
      ...taskData,
      contactId,
      companyId,
      userId,
      completed: false
    });

    logger.info(`Tarefa ${task.id} criada para o contato ${contactId}`);
    return task;
  } catch (error) {
    logger.error(`Erro ao criar tarefa: ${error.message}`);
    throw error;
  }
};

/**
 * Atualiza uma tarefa existente
 * @param {number} taskId - ID da tarefa
 * @param {Object} taskData - Dados atualizados da tarefa
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Task>} - Tarefa atualizada
 */
const updateTask = async (taskId, taskData, companyId) => {
  try {
    // Busca a tarefa
    const task = await Task.findOne({
      where: {
        id: taskId,
        companyId
      }
    });

    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    // Atualiza a tarefa
    await task.update(taskData);

    logger.info(`Tarefa ${taskId} atualizada`);
    return task;
  } catch (error) {
    logger.error(`Erro ao atualizar tarefa ${taskId}: ${error.message}`);
    throw error;
  }
};

/**
 * Marca uma tarefa como concluída
 * @param {number} taskId - ID da tarefa
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Task>} - Tarefa atualizada
 */
const completeTask = async (taskId, companyId) => {
  try {
    // Busca a tarefa
    const task = await Task.findOne({
      where: {
        id: taskId,
        companyId
      }
    });

    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    // Marca como concluída
    await task.update({
      completed: true,
      completedAt: new Date()
    });

    logger.info(`Tarefa ${taskId} marcada como concluída`);
    return task;
  } catch (error) {
    logger.error(`Erro ao marcar tarefa ${taskId} como concluída: ${error.message}`);
    throw error;
  }
};

/**
 * Adiciona uma nota a um contato
 * @param {Object} noteData - Dados da nota
 * @param {number} contactId - ID do contato
 * @param {number} companyId - ID da empresa
 * @param {number} userId - ID do usuário
 * @returns {Promise<Note>} - Nota criada
 */
const addNote = async (noteData, contactId, companyId, userId) => {
  try {
    // Verifica se o contato existe
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        companyId
      }
    });

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    // Cria a nota
    const note = await Note.create({
      ...noteData,
      contactId,
      companyId,
      userId
    });

    logger.info(`Nota ${note.id} adicionada ao contato ${contactId}`);
    return note;
  } catch (error) {
    logger.error(`Erro ao adicionar nota: ${error.message}`);
    throw error;
  }
};

/**
 * Atualiza uma nota existente
 * @param {number} noteId - ID da nota
 * @param {Object} noteData - Dados atualizados da nota
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Note>} - Nota atualizada
 */
const updateNote = async (noteId, noteData, companyId) => {
  try {
    // Busca a nota
    const note = await Note.findOne({
      where: {
        id: noteId,
        companyId
      }
    });

    if (!note) {
      throw new Error('Nota não encontrada');
    }

    // Atualiza a nota
    await note.update(noteData);

    logger.info(`Nota ${noteId} atualizada`);
    return note;
  } catch (error) {
    logger.error(`Erro ao atualizar nota ${noteId}: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém o histórico de atividades de um contato
 * @param {number} contactId - ID do contato
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Array>} - Histórico de atividades
 */
const getContactHistory = async (contactId, companyId) => {
  try {
    // Verifica se o contato existe
    const contact = await Contact.findOne({
      where: {
        id: contactId,
        companyId
      }
    });

    if (!contact) {
      throw new Error('Contato não encontrado');
    }

    // Busca atividades
    const activities = await Activity.findAll({
      where: {
        contactId,
        companyId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Busca tarefas
    const tasks = await Task.findAll({
      where: {
        contactId,
        companyId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Busca notas
    const notes = await Note.findAll({
      where: {
        contactId,
        companyId
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Combina e ordena todos os itens por data
    const history = [
      ...activities.map(item => ({
        ...item.toJSON(),
        type: 'activity'
      })),
      ...tasks.map(item => ({
        ...item.toJSON(),
        type: 'task'
      })),
      ...notes.map(item => ({
        ...item.toJSON(),
        type: 'note'
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    logger.info(`Histórico do contato ${contactId} obtido`);
    return history;
  } catch (error) {
    logger.error(`Erro ao obter histórico do contato ${contactId}: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém as tarefas pendentes de um usuário
 * @param {number} userId - ID do usuário
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Array>} - Tarefas pendentes
 */
const getPendingTasks = async (userId, companyId) => {
  try {
    // Busca as tarefas pendentes
    const pendingTasks = await Task.findAll({
      where: {
        userId,
        companyId,
        completed: false,
        dueDate: {
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: Contact,
          attributes: ['id', 'name', 'phone', 'email']
        }
      ],
      order: [['dueDate', 'ASC']]
    });

    logger.info(`Tarefas pendentes do usuário ${userId} obtidas`);
    return pendingTasks;
  } catch (error) {
    logger.error(`Erro ao obter tarefas pendentes do usuário ${userId}: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém as atividades pendentes de um usuário
 * @param {number} userId - ID do usuário
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Array>} - Atividades pendentes
 */
const getPendingActivities = async (userId, companyId) => {
  try {
    // Busca as atividades pendentes
    const pendingActivities = await Activity.findAll({
      where: {
        userId,
        companyId,
        completed: false,
        scheduledDate: {
          [Op.gte]: new Date()
        }
      },
      include: [
        {
          model: Contact,
          attributes: ['id', 'name', 'phone', 'email']
        }
      ],
      order: [['scheduledDate', 'ASC']]
    });

    logger.info(`Atividades pendentes do usuário ${userId} obtidas`);
    return pendingActivities;
  } catch (error) {
    logger.error(`Erro ao obter atividades pendentes do usuário ${userId}: ${error.message}`);
    throw error;
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


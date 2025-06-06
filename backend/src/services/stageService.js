/**
 * Serviço de Estágios do Funil de Vendas
 * 
 * Este serviço gerencia as operações relacionadas aos estágios do funil de vendas,
 * incluindo criação, atualização, reordenação e arquivamento.
 */

const { Stage, Contact } = require('../models');
const logger = require('../config/logger');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Cria um novo estágio
 * @param {Object} stageData - Dados do estágio
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Stage>} - Estágio criado
 */
const createStage = async (stageData, companyId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Verifica se já existe um estágio com o mesmo nome
    const existingStage = await Stage.findOne({
      where: {
        name: stageData.name,
        companyId,
        archived: false
      }
    });

    if (existingStage) {
      throw new Error('Já existe um estágio com este nome');
    }

    // Obtém a maior ordem atual
    const maxOrder = await Stage.max('order', {
      where: {
        companyId,
        archived: false
      }
    }) || 0;

    // Cria o estágio no banco de dados
    const stage = await Stage.create({
      ...stageData,
      companyId,
      order: maxOrder + 1,
      archived: false,
      isDefault: stageData.isDefault || false
    }, { transaction });

    // Se este estágio for definido como padrão, remove o padrão dos outros
    if (stageData.isDefault) {
      await Stage.update(
        { isDefault: false },
        {
          where: {
            companyId,
            id: { [Op.ne]: stage.id },
            isDefault: true
          },
          transaction
        }
      );
    }

    await transaction.commit();
    logger.info(`Estágio ${stage.id} criado para a empresa ${companyId}`);
    return stage;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao criar estágio: ${error.message}`);
    throw error;
  }
};

/**
 * Atualiza um estágio existente
 * @param {number} stageId - ID do estágio
 * @param {Object} stageData - Dados atualizados do estágio
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Stage>} - Estágio atualizado
 */
const updateStage = async (stageId, stageData, companyId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Busca o estágio
    const stage = await Stage.findOne({
      where: {
        id: stageId,
        companyId,
        archived: false
      }
    });

    if (!stage) {
      throw new Error('Estágio não encontrado');
    }

    // Verifica se já existe outro estágio com o mesmo nome
    if (stageData.name) {
      const existingStage = await Stage.findOne({
        where: {
          name: stageData.name,
          companyId,
          id: { [Op.ne]: stageId },
          archived: false
        }
      });

      if (existingStage) {
        throw new Error('Já existe outro estágio com este nome');
      }
    }

    // Atualiza o estágio
    await stage.update(stageData, { transaction });

    // Se este estágio for definido como padrão, remove o padrão dos outros
    if (stageData.isDefault) {
      await Stage.update(
        { isDefault: false },
        {
          where: {
            companyId,
            id: { [Op.ne]: stageId },
            isDefault: true
          },
          transaction
        }
      );
    }

    await transaction.commit();
    logger.info(`Estágio ${stageId} atualizado para a empresa ${companyId}`);
    return stage;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao atualizar estágio ${stageId}: ${error.message}`);
    throw error;
  }
};

/**
 * Reordena os estágios
 * @param {Array<number>} stageOrder - Array com os IDs dos estágios na ordem desejada
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Array<Stage>>} - Estágios reordenados
 */
const reorderStages = async (stageOrder, companyId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Verifica se todos os estágios existem
    const stages = await Stage.findAll({
      where: {
        id: { [Op.in]: stageOrder },
        companyId,
        archived: false
      }
    });

    if (stages.length !== stageOrder.length) {
      throw new Error('Um ou mais estágios não foram encontrados');
    }

    // Atualiza a ordem de cada estágio
    for (let i = 0; i < stageOrder.length; i++) {
      await Stage.update(
        { order: i + 1 },
        {
          where: {
            id: stageOrder[i],
            companyId
          },
          transaction
        }
      );
    }

    await transaction.commit();
    
    // Busca os estágios atualizados
    const updatedStages = await Stage.findAll({
      where: {
        companyId,
        archived: false
      },
      order: [['order', 'ASC']]
    });

    logger.info(`Estágios reordenados para a empresa ${companyId}`);
    return updatedStages;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao reordenar estágios: ${error.message}`);
    throw error;
  }
};

/**
 * Arquiva um estágio
 * @param {number} stageId - ID do estágio a ser arquivado
 * @param {number} targetStageId - ID do estágio para onde os contatos serão movidos
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Object>} - Resultado do arquivamento
 */
const archiveStage = async (stageId, targetStageId, companyId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Busca o estágio a ser arquivado
    const stage = await Stage.findOne({
      where: {
        id: stageId,
        companyId,
        archived: false
      }
    });

    if (!stage) {
      throw new Error('Estágio não encontrado');
    }

    // Verifica se o estágio é o padrão
    if (stage.isDefault) {
      throw new Error('O estágio padrão não pode ser arquivado');
    }

    // Busca o estágio de destino
    const targetStage = await Stage.findOne({
      where: {
        id: targetStageId,
        companyId,
        archived: false
      }
    });

    if (!targetStage) {
      throw new Error('Estágio de destino não encontrado');
    }

    // Move os contatos para o estágio de destino
    await Contact.update(
      { stageId: targetStageId },
      {
        where: {
          stageId,
          companyId
        },
        transaction
      }
    );

    // Arquiva o estágio
    await stage.update(
      { archived: true, isDefault: false },
      { transaction }
    );

    // Reordena os estágios restantes
    const activeStages = await Stage.findAll({
      where: {
        companyId,
        archived: false
      },
      order: [['order', 'ASC']]
    });

    for (let i = 0; i < activeStages.length; i++) {
      await activeStages[i].update(
        { order: i + 1 },
        { transaction }
      );
    }

    await transaction.commit();
    
    logger.info(`Estágio ${stageId} arquivado para a empresa ${companyId}`);
    return {
      archivedStage: stage,
      activeStages
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao arquivar estágio ${stageId}: ${error.message}`);
    throw error;
  }
};

/**
 * Restaura um estágio arquivado
 * @param {number} stageId - ID do estágio a ser restaurado
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Object>} - Resultado da restauração
 */
const restoreStage = async (stageId, companyId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Busca o estágio arquivado
    const stage = await Stage.findOne({
      where: {
        id: stageId,
        companyId,
        archived: true
      }
    });

    if (!stage) {
      throw new Error('Estágio arquivado não encontrado');
    }

    // Obtém a maior ordem atual
    const maxOrder = await Stage.max('order', {
      where: {
        companyId,
        archived: false
      }
    }) || 0;

    // Restaura o estágio
    await stage.update(
      { archived: false, order: maxOrder + 1 },
      { transaction }
    );

    // Busca os estágios ativos
    const activeStages = await Stage.findAll({
      where: {
        companyId,
        archived: false
      },
      order: [['order', 'ASC']]
    });

    await transaction.commit();
    
    logger.info(`Estágio ${stageId} restaurado para a empresa ${companyId}`);
    return {
      restoredStage: stage,
      activeStages
    };
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao restaurar estágio ${stageId}: ${error.message}`);
    throw error;
  }
};

/**
 * Exclui um estágio permanentemente
 * @param {number} stageId - ID do estágio a ser excluído
 * @param {number} companyId - ID da empresa
 * @returns {Promise<boolean>} - Resultado da exclusão
 */
const deleteStage = async (stageId, companyId) => {
  try {
    // Busca o estágio
    const stage = await Stage.findOne({
      where: {
        id: stageId,
        companyId,
        archived: true // Só permite excluir estágios arquivados
      }
    });

    if (!stage) {
      throw new Error('Estágio arquivado não encontrado');
    }

    // Exclui o estágio
    await stage.destroy();
    
    logger.info(`Estágio ${stageId} excluído permanentemente para a empresa ${companyId}`);
    return true;
  } catch (error) {
    logger.error(`Erro ao excluir estágio ${stageId}: ${error.message}`);
    throw error;
  }
};

/**
 * Cria os estágios padrão para uma nova empresa
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Array<Stage>>} - Estágios criados
 */
const createDefaultStages = async (companyId) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Define os estágios padrão
    const defaultStages = [
      { name: 'Novo Lead', color: '#3498db', isDefault: true, order: 1 },
      { name: 'Qualificado', color: '#2ecc71', isDefault: false, order: 2 },
      { name: 'Proposta Enviada', color: '#f39c12', isDefault: false, order: 3 },
      { name: 'Negociação', color: '#9b59b6', isDefault: false, order: 4 },
      { name: 'Fechado Ganho', color: '#27ae60', isDefault: false, order: 5 },
      { name: 'Fechado Perdido', color: '#e74c3c', isDefault: false, order: 6 }
    ];

    // Cria os estágios
    const stages = [];
    for (const stageData of defaultStages) {
      const stage = await Stage.create({
        ...stageData,
        companyId,
        archived: false
      }, { transaction });
      
      stages.push(stage);
    }

    await transaction.commit();
    
    logger.info(`Estágios padrão criados para a empresa ${companyId}`);
    return stages;
  } catch (error) {
    await transaction.rollback();
    logger.error(`Erro ao criar estágios padrão: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createStage,
  updateStage,
  reorderStages,
  archiveStage,
  restoreStage,
  deleteStage,
  createDefaultStages
};


/**
 * Controlador de Estágios do Funil de Vendas
 * 
 * Este controlador gerencia as operações relacionadas aos estágios do funil de vendas,
 * como listar, criar, atualizar e excluir estágios.
 */

const { Stage, Contact } = require('../models');
const logger = require('../config/logger');

/**
 * Listar todos os estágios da empresa
 * @route GET /api/stages
 */
const getAllStages = async (req, res, next) => {
  try {
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca todos os estágios da empresa, ordenados por posição
    const stages = await Stage.findAll({
      where: { companyId, isArchived: false },
      order: [['position', 'ASC']]
    });

    res.status(200).json({
      success: true,
      count: stages.length,
      data: stages
    });
  } catch (error) {
    logger.error(`Erro ao listar estágios: ${error.message}`);
    next(error);
  }
};

/**
 * Obter um estágio específico
 * @route GET /api/stages/:id
 */
const getStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o estágio pelo ID e companyId
    const stage = await Stage.findOne({
      where: { id, companyId }
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Estágio não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: stage
    });
  } catch (error) {
    logger.error(`Erro ao buscar estágio: ${error.message}`);
    next(error);
  }
};

/**
 * Criar um novo estágio
 * @route POST /api/stages
 */
const createStage = async (req, res, next) => {
  try {
    const { name, description, color, isDefault = false } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Verifica se os campos obrigatórios foram fornecidos
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Nome é obrigatório'
      });
    }

    // Busca a posição máxima atual para adicionar o novo estágio ao final
    const maxPositionStage = await Stage.findOne({
      where: { companyId },
      order: [['position', 'DESC']]
    });

    const position = maxPositionStage ? maxPositionStage.position + 1 : 0;

    // Se o novo estágio for definido como padrão, remove o padrão dos outros
    if (isDefault) {
      await Stage.update(
        { isDefault: false },
        { where: { companyId, isDefault: true } }
      );
    }

    // Cria o novo estágio
    const stage = await Stage.create({
      name,
      description,
      color: color || '#7F00FF', // Cor padrão: Purple Creativity
      position,
      isDefault,
      companyId
    });

    res.status(201).json({
      success: true,
      message: 'Estágio criado com sucesso',
      data: stage
    });
  } catch (error) {
    logger.error(`Erro ao criar estágio: ${error.message}`);
    next(error);
  }
};

/**
 * Atualizar um estágio
 * @route PUT /api/stages/:id
 */
const updateStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color, isDefault } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o estágio pelo ID e companyId
    const stage = await Stage.findOne({
      where: { id, companyId }
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Estágio não encontrado'
      });
    }

    // Se o estágio for definido como padrão, remove o padrão dos outros
    if (isDefault && !stage.isDefault) {
      await Stage.update(
        { isDefault: false },
        { where: { companyId, isDefault: true } }
      );
    }

    // Atualiza os campos do estágio
    if (name) stage.name = name;
    if (description !== undefined) stage.description = description;
    if (color) stage.color = color;
    if (isDefault !== undefined) stage.isDefault = isDefault;

    await stage.save();

    res.status(200).json({
      success: true,
      message: 'Estágio atualizado com sucesso',
      data: stage
    });
  } catch (error) {
    logger.error(`Erro ao atualizar estágio: ${error.message}`);
    next(error);
  }
};

/**
 * Reordenar estágios
 * @route PUT /api/stages/reorder
 */
const reorderStages = async (req, res, next) => {
  try {
    const { stageOrder } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Verifica se a ordem dos estágios foi fornecida
    if (!stageOrder || !Array.isArray(stageOrder)) {
      return res.status(400).json({
        success: false,
        message: 'Ordem dos estágios é obrigatória'
      });
    }

    // Atualiza a posição de cada estágio
    for (let i = 0; i < stageOrder.length; i++) {
      const stageId = stageOrder[i];
      
      // Busca o estágio pelo ID e companyId
      const stage = await Stage.findOne({
        where: { id: stageId, companyId }
      });

      if (stage) {
        stage.position = i;
        await stage.save();
      }
    }

    // Busca todos os estágios atualizados
    const stages = await Stage.findAll({
      where: { companyId, isArchived: false },
      order: [['position', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Estágios reordenados com sucesso',
      data: stages
    });
  } catch (error) {
    logger.error(`Erro ao reordenar estágios: ${error.message}`);
    next(error);
  }
};

/**
 * Arquivar um estágio
 * @route PUT /api/stages/:id/archive
 */
const archiveStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { targetStageId } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o estágio pelo ID e companyId
    const stage = await Stage.findOne({
      where: { id, companyId }
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Estágio não encontrado'
      });
    }

    // Verifica se é o único estágio não arquivado
    const activeStagesCount = await Stage.count({
      where: { companyId, isArchived: false }
    });

    if (activeStagesCount <= 1) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível arquivar o único estágio ativo'
      });
    }

    // Se for o estágio padrão, não pode ser arquivado
    if (stage.isDefault) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível arquivar o estágio padrão'
      });
    }

    // Verifica se o estágio de destino foi fornecido
    if (!targetStageId) {
      return res.status(400).json({
        success: false,
        message: 'É necessário fornecer um estágio de destino para os contatos'
      });
    }

    // Busca o estágio de destino
    const targetStage = await Stage.findOne({
      where: { id: targetStageId, companyId, isArchived: false }
    });

    if (!targetStage) {
      return res.status(404).json({
        success: false,
        message: 'Estágio de destino não encontrado'
      });
    }

    // Move os contatos do estágio arquivado para o estágio de destino
    await Contact.update(
      { stage: targetStage.name },
      { where: { companyId, stage: stage.name } }
    );

    // Arquiva o estágio
    stage.isArchived = true;
    await stage.save();

    // Reordena os estágios restantes
    const activeStages = await Stage.findAll({
      where: { companyId, isArchived: false },
      order: [['position', 'ASC']]
    });

    for (let i = 0; i < activeStages.length; i++) {
      activeStages[i].position = i;
      await activeStages[i].save();
    }

    res.status(200).json({
      success: true,
      message: 'Estágio arquivado com sucesso',
      data: {
        archivedStage: stage,
        activeStages
      }
    });
  } catch (error) {
    logger.error(`Erro ao arquivar estágio: ${error.message}`);
    next(error);
  }
};

/**
 * Restaurar um estágio arquivado
 * @route PUT /api/stages/:id/restore
 */
const restoreStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o estágio pelo ID e companyId
    const stage = await Stage.findOne({
      where: { id, companyId }
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Estágio não encontrado'
      });
    }

    // Verifica se o estágio está arquivado
    if (!stage.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'O estágio já está ativo'
      });
    }

    // Busca a posição máxima atual para adicionar o estágio restaurado ao final
    const maxPositionStage = await Stage.findOne({
      where: { companyId, isArchived: false },
      order: [['position', 'DESC']]
    });

    const position = maxPositionStage ? maxPositionStage.position + 1 : 0;

    // Restaura o estágio
    stage.isArchived = false;
    stage.position = position;
    await stage.save();

    // Busca todos os estágios ativos
    const activeStages = await Stage.findAll({
      where: { companyId, isArchived: false },
      order: [['position', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Estágio restaurado com sucesso',
      data: {
        restoredStage: stage,
        activeStages
      }
    });
  } catch (error) {
    logger.error(`Erro ao restaurar estágio: ${error.message}`);
    next(error);
  }
};

/**
 * Excluir um estágio permanentemente
 * @route DELETE /api/stages/:id
 */
const deleteStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o estágio pelo ID e companyId
    const stage = await Stage.findOne({
      where: { id, companyId }
    });

    if (!stage) {
      return res.status(404).json({
        success: false,
        message: 'Estágio não encontrado'
      });
    }

    // Verifica se o estágio está arquivado
    if (!stage.isArchived) {
      return res.status(400).json({
        success: false,
        message: 'Arquive o estágio antes de excluí-lo permanentemente'
      });
    }

    // Exclui o estágio
    await stage.destroy();

    res.status(200).json({
      success: true,
      message: 'Estágio excluído permanentemente'
    });
  } catch (error) {
    logger.error(`Erro ao excluir estágio: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllStages,
  getStage,
  createStage,
  updateStage,
  reorderStages,
  archiveStage,
  restoreStage,
  deleteStage
};


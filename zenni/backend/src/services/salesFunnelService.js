/**
 * Serviço de Funil de Vendas
 * 
 * Este serviço gerencia as operações relacionadas ao funil de vendas,
 * incluindo análise de conversão, acompanhamento de leads e relatórios.
 */

const { Contact, Stage, Campaign, Message, Response } = require('../models');
const logger = require('../config/logger');
const { Op, Sequelize } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Obtém estatísticas do funil de vendas
 * @param {number} companyId - ID da empresa
 * @param {Object} filters - Filtros para as estatísticas (período, tags, etc.)
 * @returns {Promise<Object>} - Estatísticas do funil de vendas
 */
const getFunnelStats = async (companyId, filters = {}) => {
  try {
    // Define o período para as estatísticas
    const period = filters.period || 'month';
    let startDate;
    
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Busca os estágios do funil
    const stages = await Stage.findAll({
      where: {
        companyId,
        archived: false
      },
      order: [['order', 'ASC']]
    });

    // Inicializa as estatísticas
    const funnelStats = {
      stages: [],
      totalContacts: 0,
      conversionRates: [],
      averageTimeInStage: []
    };

    // Para cada estágio, calcula as estatísticas
    for (const stage of stages) {
      // Conta os contatos no estágio
      const contactCount = await Contact.count({
        where: {
          companyId,
          stageId: stage.id,
          active: true,
          createdAt: { [Op.gte]: startDate }
        }
      });

      // Adiciona o estágio às estatísticas
      funnelStats.stages.push({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        count: contactCount
      });

      // Incrementa o total de contatos
      funnelStats.totalContacts += contactCount;
    }

    // Calcula as taxas de conversão entre estágios
    for (let i = 0; i < funnelStats.stages.length - 1; i++) {
      const currentStage = funnelStats.stages[i];
      const nextStage = funnelStats.stages[i + 1];
      
      const conversionRate = currentStage.count > 0 
        ? (nextStage.count / currentStage.count) * 100 
        : 0;
      
      funnelStats.conversionRates.push({
        fromStage: currentStage.name,
        toStage: nextStage.name,
        rate: parseFloat(conversionRate.toFixed(2))
      });
    }

    // Calcula o tempo médio em cada estágio
    // Isso requer um histórico de movimentação de estágios, que seria implementado em uma tabela separada
    // Por enquanto, usamos valores fictícios
    for (const stage of funnelStats.stages) {
      funnelStats.averageTimeInStage.push({
        stage: stage.name,
        days: Math.floor(Math.random() * 10) + 1 // Valor fictício entre 1 e 10 dias
      });
    }

    logger.info(`Estatísticas do funil de vendas obtidas para a empresa ${companyId}`);
    return funnelStats;
  } catch (error) {
    logger.error(`Erro ao obter estatísticas do funil de vendas: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém a distribuição de contatos por estágio
 * @param {number} companyId - ID da empresa
 * @returns {Promise<Array>} - Distribuição de contatos por estágio
 */
const getContactDistribution = async (companyId) => {
  try {
    // Busca os estágios
    const stages = await Stage.findAll({
      where: {
        companyId,
        archived: false
      },
      order: [['order', 'ASC']]
    });

    // Inicializa a distribuição
    const distribution = [];

    // Para cada estágio, conta os contatos
    for (const stage of stages) {
      const count = await Contact.count({
        where: {
          companyId,
          stageId: stage.id,
          active: true
        }
      });

      distribution.push({
        stage: stage.name,
        count,
        color: stage.color
      });
    }

    logger.info(`Distribuição de contatos por estágio obtida para a empresa ${companyId}`);
    return distribution;
  } catch (error) {
    logger.error(`Erro ao obter distribuição de contatos por estágio: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém a taxa de conversão por campanha
 * @param {number} companyId - ID da empresa
 * @param {Object} filters - Filtros para as estatísticas (período, tags, etc.)
 * @returns {Promise<Array>} - Taxa de conversão por campanha
 */
const getCampaignConversionRates = async (companyId, filters = {}) => {
  try {
    // Define o período para as estatísticas
    const period = filters.period || 'month';
    let startDate;
    
    const now = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // Busca as campanhas concluídas no período
    const campaigns = await Campaign.findAll({
      where: {
        companyId,
        status: 'completed',
        completedAt: { [Op.gte]: startDate }
      }
    });

    // Inicializa as taxas de conversão
    const conversionRates = [];

    // Para cada campanha, calcula a taxa de conversão
    for (const campaign of campaigns) {
      // Conta as mensagens enviadas
      const sentCount = await Message.count({
        where: {
          campaignId: campaign.id,
          status: 'sent'
        }
      });

      // Conta as respostas recebidas
      const responseCount = await Response.count({
        where: {
          campaignId: campaign.id
        }
      });

      // Calcula a taxa de conversão
      const conversionRate = sentCount > 0 
        ? (responseCount / sentCount) * 100 
        : 0;

      conversionRates.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        sentCount,
        responseCount,
        conversionRate: parseFloat(conversionRate.toFixed(2))
      });
    }

    logger.info(`Taxas de conversão por campanha obtidas para a empresa ${companyId}`);
    return conversionRates;
  } catch (error) {
    logger.error(`Erro ao obter taxas de conversão por campanha: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém a previsão de vendas com base no funil atual
 * @param {number} companyId - ID da empresa
 * @param {Object} filters - Filtros para a previsão (período, taxa de conversão, etc.)
 * @returns {Promise<Object>} - Previsão de vendas
 */
const getSalesForecast = async (companyId, filters = {}) => {
  try {
    // Define o período para a previsão
    const period = filters.period || 'month';
    let forecastPeriod;
    
    switch (period) {
      case 'week':
        forecastPeriod = 7; // 7 dias
        break;
      case 'month':
        forecastPeriod = 30; // 30 dias
        break;
      case 'quarter':
        forecastPeriod = 90; // 90 dias
        break;
      case 'year':
        forecastPeriod = 365; // 365 dias
        break;
      default:
        forecastPeriod = 30;
    }

    // Busca os estágios do funil
    const stages = await Stage.findAll({
      where: {
        companyId,
        archived: false
      },
      order: [['order', 'ASC']]
    });

    // Busca o último estágio (fechado ganho)
    const lastStage = stages[stages.length - 1];

    // Conta os contatos em cada estágio
    const contactsByStage = [];
    for (const stage of stages) {
      const count = await Contact.count({
        where: {
          companyId,
          stageId: stage.id,
          active: true
        }
      });

      contactsByStage.push({
        stageId: stage.id,
        stageName: stage.name,
        count
      });
    }

    // Define as taxas de conversão entre estágios (valores fictícios)
    const conversionRates = [];
    for (let i = 0; i < stages.length - 1; i++) {
      conversionRates.push({
        fromStage: stages[i].id,
        toStage: stages[i + 1].id,
        rate: filters.conversionRate || 0.2 // 20% de conversão por padrão
      });
    }

    // Define o tempo médio em cada estágio (valores fictícios)
    const averageTimeInStage = [];
    for (const stage of stages) {
      averageTimeInStage.push({
        stageId: stage.id,
        days: Math.floor(Math.random() * 10) + 1 // Valor fictício entre 1 e 10 dias
      });
    }

    // Calcula a previsão de vendas
    let expectedDeals = 0;
    let totalValue = 0;

    // Para cada estágio, calcula quantos contatos devem avançar até o final do funil
    for (let i = 0; i < contactsByStage.length - 1; i++) {
      const stageContacts = contactsByStage[i].count;
      let remainingContacts = stageContacts;
      
      // Aplica as taxas de conversão para cada estágio subsequente
      for (let j = i; j < conversionRates.length; j++) {
        remainingContacts *= conversionRates[j].rate;
      }
      
      // Adiciona os contatos que devem chegar ao último estágio
      expectedDeals += remainingContacts;
    }

    // Adiciona os contatos que já estão no último estágio
    expectedDeals += contactsByStage[contactsByStage.length - 1].count;

    // Arredonda para o número inteiro mais próximo
    expectedDeals = Math.round(expectedDeals);

    // Calcula o valor total com base no valor médio por negócio (valor fictício)
    const averageDealValue = filters.averageDealValue || 1000;
    totalValue = expectedDeals * averageDealValue;

    logger.info(`Previsão de vendas obtida para a empresa ${companyId}`);
    return {
      period: forecastPeriod,
      expectedDeals,
      totalValue,
      averageDealValue
    };
  } catch (error) {
    logger.error(`Erro ao obter previsão de vendas: ${error.message}`);
    throw error;
  }
};

/**
 * Obtém os contatos que estão parados em um estágio por muito tempo
 * @param {number} companyId - ID da empresa
 * @param {Object} filters - Filtros para os contatos (estágio, dias, etc.)
 * @returns {Promise<Array>} - Contatos parados
 */
const getStuckContacts = async (companyId, filters = {}) => {
  try {
    // Define o número de dias para considerar um contato como parado
    const stuckDays = filters.days || 30;
    const stuckDate = new Date();
    stuckDate.setDate(stuckDate.getDate() - stuckDays);

    // Define o estágio para filtrar (opcional)
    const stageFilter = filters.stageId ? { stageId: filters.stageId } : {};

    // Busca os contatos que não foram atualizados há mais de X dias
    const stuckContacts = await Contact.findAll({
      where: {
        companyId,
        active: true,
        updatedAt: { [Op.lt]: stuckDate },
        ...stageFilter
      },
      include: [
        {
          model: Stage,
          as: 'stage'
        }
      ],
      order: [['updatedAt', 'ASC']]
    });

    logger.info(`Contatos parados obtidos para a empresa ${companyId}`);
    return stuckContacts;
  } catch (error) {
    logger.error(`Erro ao obter contatos parados: ${error.message}`);
    throw error;
  }
};

module.exports = {
  getFunnelStats,
  getContactDistribution,
  getCampaignConversionRates,
  getSalesForecast,
  getStuckContacts
};


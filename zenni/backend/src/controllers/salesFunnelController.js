/**
 * Controlador de Funil de Vendas
 * 
 * Este controlador gerencia as operações relacionadas ao funil de vendas,
 * incluindo análise de conversão, acompanhamento de leads e relatórios.
 */

const salesFunnelService = require('../services/salesFunnelService');
const logger = require('../config/logger');

/**
 * Obtém estatísticas do funil de vendas
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getFunnelStats = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { period } = req.query;

    const filters = { period };
    const stats = await salesFunnelService.getFunnelStats(companyId, filters);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error(`Erro ao obter estatísticas do funil de vendas: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas do funil de vendas',
      error: error.message
    });
  }
};

/**
 * Obtém a distribuição de contatos por estágio
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getContactDistribution = async (req, res) => {
  try {
    const { companyId } = req.company;

    const distribution = await salesFunnelService.getContactDistribution(companyId);

    res.status(200).json({
      success: true,
      data: distribution
    });
  } catch (error) {
    logger.error(`Erro ao obter distribuição de contatos por estágio: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter distribuição de contatos por estágio',
      error: error.message
    });
  }
};

/**
 * Obtém a taxa de conversão por campanha
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getCampaignConversionRates = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { period } = req.query;

    const filters = { period };
    const conversionRates = await salesFunnelService.getCampaignConversionRates(companyId, filters);

    res.status(200).json({
      success: true,
      data: conversionRates
    });
  } catch (error) {
    logger.error(`Erro ao obter taxas de conversão por campanha: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter taxas de conversão por campanha',
      error: error.message
    });
  }
};

/**
 * Obtém a previsão de vendas com base no funil atual
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getSalesForecast = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { period, conversionRate, averageDealValue } = req.query;

    const filters = { 
      period,
      conversionRate: conversionRate ? parseFloat(conversionRate) : undefined,
      averageDealValue: averageDealValue ? parseFloat(averageDealValue) : undefined
    };
    
    const forecast = await salesFunnelService.getSalesForecast(companyId, filters);

    res.status(200).json({
      success: true,
      data: forecast
    });
  } catch (error) {
    logger.error(`Erro ao obter previsão de vendas: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter previsão de vendas',
      error: error.message
    });
  }
};

/**
 * Obtém os contatos que estão parados em um estágio por muito tempo
 * @param {Request} req - Objeto de requisição
 * @param {Response} res - Objeto de resposta
 */
const getStuckContacts = async (req, res) => {
  try {
    const { companyId } = req.company;
    const { stageId, days } = req.query;

    const filters = { 
      stageId,
      days: days ? parseInt(days) : undefined
    };
    
    const stuckContacts = await salesFunnelService.getStuckContacts(companyId, filters);

    res.status(200).json({
      success: true,
      data: stuckContacts
    });
  } catch (error) {
    logger.error(`Erro ao obter contatos parados: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter contatos parados',
      error: error.message
    });
  }
};

module.exports = {
  getFunnelStats,
  getContactDistribution,
  getCampaignConversionRates,
  getSalesForecast,
  getStuckContacts
};


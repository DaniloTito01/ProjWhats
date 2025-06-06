/**
 * Índice de Rotas
 * 
 * Este arquivo define todas as rotas da API.
 */

const express = require('express');
const router = express.Router();

// Importa as rotas
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const companyRoutes = require('./companyRoutes');
const contactRoutes = require('./contactRoutes');
const campaignRoutes = require('./campaignRoutes');
const stageRoutes = require('./stageRoutes');
const whatsappRoutes = require('./whatsappRoutes');
const salesFunnelRoutes = require('./salesFunnelRoutes');
const crmRoutes = require('./crmRoutes');

// Define as rotas
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/contacts', contactRoutes);
router.use('/campaigns', campaignRoutes);
router.use('/stages', stageRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/sales-funnel', salesFunnelRoutes);
router.use('/crm', crmRoutes);

// Rota de verificação de saúde da API
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API está funcionando corretamente',
    timestamp: new Date()
  });
});

module.exports = router;


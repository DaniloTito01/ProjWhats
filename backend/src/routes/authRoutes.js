/**
 * Rotas de Autenticação
 * 
 * Este arquivo define as rotas relacionadas à autenticação,
 * como login, registro e gerenciamento de tokens.
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// Rota de login
router.post('/login', authController.login);

// Rotas protegidas por autenticação
router.use(authenticate);

// Rota para obter informações do usuário atual
router.get('/me', authController.getMe);

// Rota para atualizar senha
router.put('/password', authController.updatePassword);

// Rota para registrar novos usuários (apenas para administradores)
router.post('/register', isAdmin, authController.register);

module.exports = router;


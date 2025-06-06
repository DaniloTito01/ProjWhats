/**
 * Rotas de Usuários
 * 
 * Este arquivo define as rotas relacionadas aos usuários,
 * como listar, criar, atualizar e excluir usuários.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// Todas as rotas de usuários requerem autenticação
router.use(authenticate);

// Todas as rotas de usuários requerem permissão de administrador
router.use(isAdmin);

// Rotas para gerenciamento de usuários
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.put('/:id/reset-password', userController.resetPassword);
router.delete('/:id', userController.deleteUser);

module.exports = router;


/**
 * Controlador de Usuários
 * 
 * Este controlador gerencia as operações relacionadas aos usuários,
 * como listar, criar, atualizar e excluir usuários.
 */

const { User } = require('../models');
const logger = require('../config/logger');

/**
 * Listar todos os usuários da empresa
 * @route GET /api/users
 */
const getAllUsers = async (req, res, next) => {
  try {
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca todos os usuários da empresa
    const users = await User.findAll({
      where: { companyId },
      attributes: ['id', 'name', 'email', 'role', 'active', 'lastLogin', 'createdAt', 'updatedAt']
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    logger.error(`Erro ao listar usuários: ${error.message}`);
    next(error);
  }
};

/**
 * Obter um usuário específico
 * @route GET /api/users/:id
 */
const getUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o usuário pelo ID e companyId
    const user = await User.findOne({
      where: { id, companyId },
      attributes: ['id', 'name', 'email', 'role', 'active', 'lastLogin', 'createdAt', 'updatedAt']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    logger.error(`Erro ao buscar usuário: ${error.message}`);
    next(error);
  }
};

/**
 * Criar um novo usuário
 * @route POST /api/users
 */
const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'operator' } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Verifica se os campos obrigatórios foram fornecidos
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já está em uso'
      });
    }

    // Cria o novo usuário
    const user = await User.create({
      name,
      email,
      password,
      role,
      companyId
    });

    // Retorna os dados do usuário criado (sem a senha)
    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        companyId: user.companyId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`Erro ao criar usuário: ${error.message}`);
    next(error);
  }
};

/**
 * Atualizar um usuário
 * @route PUT /api/users/:id
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role, active } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca o usuário pelo ID e companyId
    const user = await User.findOne({ where: { id, companyId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verifica se o email já está em uso por outro usuário
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Atualiza os campos do usuário
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (active !== undefined) user.active = active;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        companyId: user.companyId,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    logger.error(`Erro ao atualizar usuário: ${error.message}`);
    next(error);
  }
};

/**
 * Redefinir senha de um usuário
 * @route PUT /api/users/:id/reset-password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Verifica se a nova senha foi fornecida
    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha é obrigatória'
      });
    }

    // Busca o usuário pelo ID e companyId
    const user = await User.findOne({ where: { id, companyId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Atualiza a senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao redefinir senha: ${error.message}`);
    next(error);
  }
};

/**
 * Excluir um usuário
 * @route DELETE /api/users/:id
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.companyId; // Obtido do middleware de autenticação
    const currentUser = req.user; // Obtido do middleware de autenticação

    // Impede que o usuário exclua a si mesmo
    if (id === currentUser.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir o próprio usuário'
      });
    }

    // Busca o usuário pelo ID e companyId
    const user = await User.findOne({ where: { id, companyId } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Exclui o usuário
    await user.destroy();

    res.status(200).json({
      success: true,
      message: 'Usuário excluído com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao excluir usuário: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  resetPassword,
  deleteUser
};


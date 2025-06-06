/**
 * Controlador de Autenticação
 * 
 * Este controlador gerencia as operações relacionadas à autenticação,
 * como login, registro e gerenciamento de tokens.
 */

const jwt = require('jsonwebtoken');
const { User, Company } = require('../models');
const logger = require('../config/logger');

/**
 * Login de usuário
 * @route POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Verifica se email e senha foram fornecidos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Busca o usuário pelo email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verifica se o usuário está ativo
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário desativado'
      });
    }

    // Verifica a senha
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Busca informações da empresa
    const company = await Company.findByPk(user.companyId);
    if (!company || !company.active) {
      return res.status(401).json({
        success: false,
        message: 'Empresa desativada ou não encontrada'
      });
    }

    // Atualiza a data do último login
    user.lastLogin = new Date();
    await user.save();

    // Gera o token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    // Retorna o token e informações do usuário
    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId
        },
        company: {
          id: company.id,
          name: company.name,
          logo: company.logo,
          primaryColor: company.primaryColor,
          secondaryColor: company.secondaryColor
        }
      }
    });
  } catch (error) {
    logger.error(`Erro no login: ${error.message}`);
    next(error);
  }
};

/**
 * Registro de novo usuário (apenas para administradores)
 * @route POST /api/auth/register
 */
const register = async (req, res, next) => {
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
        companyId: user.companyId,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error(`Erro no registro: ${error.message}`);
    next(error);
  }
};

/**
 * Obter informações do usuário atual
 * @route GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = req.user; // Obtido do middleware de autenticação
    
    // Busca informações atualizadas da empresa
    const company = await Company.findByPk(user.companyId);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Retorna os dados do usuário e da empresa
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyId: user.companyId,
          lastLogin: user.lastLogin
        },
        company: {
          id: company.id,
          name: company.name,
          logo: company.logo,
          primaryColor: company.primaryColor,
          secondaryColor: company.secondaryColor
        }
      }
    });
  } catch (error) {
    logger.error(`Erro ao obter informações do usuário: ${error.message}`);
    next(error);
  }
};

/**
 * Atualizar senha do usuário
 * @route PUT /api/auth/password
 */
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user; // Obtido do middleware de autenticação

    // Verifica se as senhas foram fornecidas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual e nova senha são obrigatórias'
      });
    }

    // Verifica se a senha atual está correta
    const isPasswordValid = await user.checkPassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualiza a senha
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao atualizar senha: ${error.message}`);
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  updatePassword
};


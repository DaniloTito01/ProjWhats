/**
 * Serviço de Autenticação
 * 
 * Este serviço gerencia as operações relacionadas à autenticação,
 * incluindo login, registro, verificação de token e gerenciamento de senhas.
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User, Company } = require('../models');
const logger = require('../config/logger');
const stageService = require('./stageService');

/**
 * Registra uma nova empresa e usuário administrador
 * @param {Object} userData - Dados do usuário
 * @param {Object} companyData - Dados da empresa
 * @returns {Promise<Object>} - Usuário e empresa criados
 */
const register = async (userData, companyData) => {
  try {
    // Verifica se já existe um usuário com o mesmo email
    const existingUser = await User.findOne({
      where: {
        email: userData.email
      }
    });

    if (existingUser) {
      throw new Error('Email já está em uso');
    }

    // Cria a empresa
    const company = await Company.create({
      ...companyData,
      active: true
    });

    // Cria o usuário administrador
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      role: 'admin',
      companyId: company.id,
      active: true
    });

    // Cria os estágios padrão para a empresa
    await stageService.createDefaultStages(company.id);

    logger.info(`Empresa ${company.id} e usuário administrador ${user.id} criados`);
    
    // Remove a senha do objeto de retorno
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    return {
      user: userWithoutPassword,
      company
    };
  } catch (error) {
    logger.error(`Erro ao registrar: ${error.message}`);
    throw error;
  }
};

/**
 * Realiza o login de um usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<Object>} - Token JWT e dados do usuário
 */
const login = async (email, password) => {
  try {
    // Busca o usuário pelo email
    const user = await User.findOne({
      where: {
        email
      }
    });

    if (!user) {
      throw new Error('Credenciais inválidas');
    }

    // Verifica se o usuário está ativo
    if (!user.active) {
      throw new Error('Usuário desativado');
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Credenciais inválidas');
    }

    // Busca a empresa do usuário
    const company = await Company.findByPk(user.companyId);
    if (!company || !company.active) {
      throw new Error('Empresa desativada');
    }

    // Gera o token JWT
    const token = generateToken(user);

    logger.info(`Usuário ${user.id} realizou login`);
    
    // Remove a senha do objeto de retorno
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    return {
      token,
      user: userWithoutPassword,
      company
    };
  } catch (error) {
    logger.error(`Erro ao fazer login: ${error.message}`);
    throw error;
  }
};

/**
 * Verifica e decodifica um token JWT
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} - Dados do usuário e empresa
 */
const verifyToken = async (token) => {
  try {
    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário
    const user = await User.findByPk(decoded.id);
    if (!user || !user.active) {
      throw new Error('Usuário não encontrado ou desativado');
    }

    // Busca a empresa
    const company = await Company.findByPk(user.companyId);
    if (!company || !company.active) {
      throw new Error('Empresa não encontrada ou desativada');
    }

    // Remove a senha do objeto de retorno
    const userWithoutPassword = { ...user.toJSON() };
    delete userWithoutPassword.password;

    return {
      user: userWithoutPassword,
      company
    };
  } catch (error) {
    logger.error(`Erro ao verificar token: ${error.message}`);
    throw error;
  }
};

/**
 * Atualiza a senha de um usuário
 * @param {number} userId - ID do usuário
 * @param {string} currentPassword - Senha atual
 * @param {string} newPassword - Nova senha
 * @returns {Promise<boolean>} - Resultado da atualização
 */
const updatePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Busca o usuário
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Verifica a senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new Error('Senha atual incorreta');
    }

    // Atualiza a senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    logger.info(`Senha do usuário ${userId} atualizada`);
    return true;
  } catch (error) {
    logger.error(`Erro ao atualizar senha: ${error.message}`);
    throw error;
  }
};

/**
 * Redefine a senha de um usuário (por um administrador)
 * @param {number} userId - ID do usuário
 * @param {string} newPassword - Nova senha
 * @param {number} adminId - ID do administrador
 * @returns {Promise<boolean>} - Resultado da redefinição
 */
const resetPassword = async (userId, newPassword, adminId) => {
  try {
    // Busca o usuário
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Busca o administrador
    const admin = await User.findByPk(adminId);
    if (!admin || admin.role !== 'admin' || admin.companyId !== user.companyId) {
      throw new Error('Permissão negada');
    }

    // Atualiza a senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    logger.info(`Senha do usuário ${userId} redefinida pelo administrador ${adminId}`);
    return true;
  } catch (error) {
    logger.error(`Erro ao redefinir senha: ${error.message}`);
    throw error;
  }
};

/**
 * Gera um token JWT para um usuário
 * @param {User} user - Usuário
 * @returns {string} - Token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h'
    }
  );
};

module.exports = {
  register,
  login,
  verifyToken,
  updatePassword,
  resetPassword
};


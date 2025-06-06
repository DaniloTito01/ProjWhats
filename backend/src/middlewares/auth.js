/**
 * Middleware de Autenticação
 * 
 * Este middleware verifica se o usuário está autenticado
 * através do token JWT e adiciona o usuário à requisição.
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../config/logger');

/**
 * Middleware para verificar se o usuário está autenticado
 */
const authenticate = async (req, res, next) => {
  try {
    // Verifica se o token está presente no cabeçalho Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token de autenticação não fornecido' 
      });
    }

    // Extrai o token do cabeçalho
    const token = authHeader.split(' ')[1];

    // Verifica e decodifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco de dados
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado' 
      });
    }

    // Verifica se o usuário está ativo
    if (!user.active) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário desativado' 
      });
    }

    // Adiciona o usuário à requisição
    req.user = user;
    
    // Adiciona o ID da empresa à requisição para facilitar o acesso
    req.companyId = user.companyId;

    // Continua para o próximo middleware ou controlador
    next();
  } catch (error) {
    logger.error(`Erro de autenticação: ${error.message}`);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor durante autenticação' 
    });
  }
};

/**
 * Middleware para verificar se o usuário é um administrador
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false, 
      message: 'Usuário não autenticado' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso negado. Permissão de administrador necessária' 
    });
  }

  next();
};

module.exports = {
  authenticate,
  isAdmin,
};


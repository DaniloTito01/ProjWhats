/**
 * Middleware de Tratamento de Erros
 * 
 * Este middleware captura erros em toda a aplicação e
 * fornece respostas de erro padronizadas.
 */

const logger = require('../config/logger');

/**
 * Middleware para capturar e tratar erros
 */
const errorHandler = (err, req, res, next) => {
  // Registra o erro no sistema de logs
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);

  // Determina o código de status HTTP com base no tipo de erro
  let statusCode = 500;
  let errorMessage = 'Erro interno do servidor';

  // Erros de validação do Sequelize
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    const errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(statusCode).json({
      success: false,
      message: 'Erro de validação',
      errors
    });
  }

  // Erros personalizados com código de status definido
  if (err.statusCode) {
    statusCode = err.statusCode;
    errorMessage = err.message;
  }

  // Erros de sintaxe JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    errorMessage = 'JSON inválido na requisição';
  }

  // Resposta de erro padrão
  res.status(statusCode).json({
    success: false,
    message: errorMessage,
    // Inclui detalhes do erro apenas em ambiente de desenvolvimento
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      name: err.name
    })
  });
};

/**
 * Middleware para lidar com rotas não encontradas
 */
const notFoundHandler = (req, res) => {
  logger.warn(`Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};


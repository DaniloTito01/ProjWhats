/**
 * Configuração do sistema de logs usando Winston
 * 
 * Este arquivo configura o sistema de logs da aplicação,
 * permitindo diferentes níveis de log dependendo do ambiente.
 */

const winston = require('winston');
const path = require('path');

// Define os formatos de log
const formats = {
  // Formato para console com cores
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
  // Formato para arquivo sem cores
  file: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
};

// Cria o logger com as configurações apropriadas
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transports: [
    // Log para console
    new winston.transports.Console({
      format: formats.console,
    }),
    // Log para arquivo de erros
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/error.log'),
      level: 'error',
      format: formats.file,
    }),
    // Log para arquivo com todos os níveis
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/combined.log'),
      format: formats.file,
    }),
  ],
  // Não encerra o processo em caso de erro não tratado
  exitOnError: false,
});

// Exporta o logger para uso em toda a aplicação
module.exports = logger;


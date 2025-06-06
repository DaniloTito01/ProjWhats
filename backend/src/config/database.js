/**
 * Configuração do banco de dados
 * 
 * Este arquivo configura a conexão com o banco de dados PostgreSQL
 * usando o Sequelize ORM.
 */

const { Sequelize } = require('sequelize');
const logger = require('./logger');

// Carrega as variáveis de ambiente
require('dotenv').config();

// Cria uma nova instância do Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'zenni',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Testa a conexão com o banco de dados
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Conexão com o banco de dados estabelecida com sucesso.');
    return true;
  } catch (error) {
    logger.error(`Erro ao conectar ao banco de dados: ${error.message}`);
    return false;
  }
};

// Sincroniza os modelos com o banco de dados
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    logger.info('Modelos sincronizados com o banco de dados.');
    return true;
  } catch (error) {
    logger.error(`Erro ao sincronizar modelos: ${error.message}`);
    return false;
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
module.exports.syncModels = syncModels;


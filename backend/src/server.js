/**
 * Servidor principal da API
 * 
 * Este arquivo configura e inicia o servidor Express para a API.
 */

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");
const logger = require("./config/logger");
const database = require("./config/database");

// Carrega as variáveis de ambiente
require("dotenv").config();

// Cria a aplicação Express
const app = express();

// Configurações de middleware
app.use(helmet()); // Segurança

// Configuração explícita do CORS para permitir o frontend
app.use(cors({
  origin: "*", // Permite todas as origens
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Métodos permitidos
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));

app.use(express.json()); // Parse de JSON
app.use(express.urlencoded({ extended: true })); // Parse de URL encoded
app.use(morgan("combined", { stream: { write: message => logger.info(message.trim()) } })); // Logging

// Rotas
app.use("/api", routes);

// Middleware de tratamento de erros
app.use(errorHandler);

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Inicia o servidor
const startServer = async () => {
  try {
    // Testa a conexão com o banco de dados
    const dbConnected = await database.testConnection();
    
    if (!dbConnected) {
      logger.error("Não foi possível conectar ao banco de dados. Verifique as configurações.");
      process.exit(1);
    }

    // Sincroniza os modelos com o banco de dados
    await database.syncModels();

    // Inicia o servidor
    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    logger.error(`Erro ao iniciar o servidor: ${error.message}`);
    process.exit(1);
  }
};

// Inicia o servidor
startServer();

// Tratamento de erros não capturados
process.on("uncaughtException", (error) => {
  logger.error(`Erro não capturado: ${error.message}`);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Promessa rejeitada não tratada: ${reason}`);
  process.exit(1);
});

module.exports = app;



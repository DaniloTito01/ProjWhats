/**
 * Script para popular o banco de dados com dados iniciais
 * 
 * Este script cria dados de exemplo para testes e desenvolvimento.
 */

const bcrypt = require('bcrypt');
const { User, Company, Contact, Stage, Campaign } = require('../models');
const stageService = require('../services/stageService');
const logger = require('../config/logger');

/**
 * Cria dados de exemplo no banco de dados
 */
const seedDatabase = async () => {
  try {
    logger.info('Iniciando população do banco de dados...');

    // Cria uma empresa de exemplo
    const company = await Company.create({
      name: 'Empresa Exemplo',
      domain: 'exemplo.com',
      plan: 'basic',
      active: true
    });

    logger.info(`Empresa criada: ${company.id}`);

    // Cria um usuário administrador
    const hashedPassword = await bcrypt.hash('senha123', 10);
    const admin = await User.create({
      name: 'Administrador',
      email: 'admin@exemplo.com',
      password: hashedPassword,
      role: 'admin',
      companyId: company.id,
      active: true
    });

    logger.info(`Usuário administrador criado: ${admin.id}`);

    // Cria um usuário comum
    const user = await User.create({
      name: 'Usuário',
      email: 'usuario@exemplo.com',
      password: hashedPassword,
      role: 'user',
      companyId: company.id,
      active: true
    });

    logger.info(`Usuário comum criado: ${user.id}`);

    // Cria os estágios do funil de vendas
    const stages = await stageService.createDefaultStages(company.id);
    logger.info(`Estágios do funil de vendas criados: ${stages.length}`);

    // Cria contatos de exemplo
    const contacts = [];
    for (let i = 1; i <= 50; i++) {
      const contact = await Contact.create({
        name: `Contato ${i}`,
        phone: `5511999999${i.toString().padStart(2, '0')}`,
        email: `contato${i}@exemplo.com`,
        companyId: company.id,
        stageId: stages[Math.floor(Math.random() * stages.length)].id,
        tags: ['lead', 'website'],
        active: true
      });
      contacts.push(contact);
    }

    logger.info(`Contatos criados: ${contacts.length}`);

    // Cria uma campanha de exemplo
    const campaign = await Campaign.create({
      name: 'Campanha de Boas-vindas',
      description: 'Mensagem de boas-vindas para novos leads',
      message: 'Olá {nome}, seja bem-vindo! Estamos felizes em ter você como cliente.',
      status: 'draft',
      companyId: company.id,
      filters: {
        tags: ['lead']
      },
      totalContacts: 0,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      responseCount: 0
    });

    logger.info(`Campanha criada: ${campaign.id}`);

    logger.info('População do banco de dados concluída com sucesso!');
    return true;
  } catch (error) {
    logger.error(`Erro ao popular banco de dados: ${error.message}`);
    return false;
  }
};

// Executa o script se for chamado diretamente
if (require.main === module) {
  const database = require('../config/database');
  
  // Conecta ao banco de dados e executa o seed
  database.testConnection()
    .then(async (connected) => {
      if (connected) {
        await seedDatabase();
        process.exit(0);
      } else {
        logger.error('Não foi possível conectar ao banco de dados.');
        process.exit(1);
      }
    })
    .catch((error) => {
      logger.error(`Erro: ${error.message}`);
      process.exit(1);
    });
}

module.exports = seedDatabase;


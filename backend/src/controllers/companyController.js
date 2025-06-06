/**
 * Controlador de Empresas
 * 
 * Este controlador gerencia as operações relacionadas às empresas,
 * como obter, atualizar e gerenciar configurações da empresa.
 */

const fs = require('fs');
const path = require('path');
const { Company } = require('../models');
const logger = require('../config/logger');

/**
 * Obter informações da empresa atual
 * @route GET /api/company
 */
const getCompany = async (req, res, next) => {
  try {
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a empresa pelo ID
    const company = await Company.findByPk(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    logger.error(`Erro ao buscar empresa: ${error.message}`);
    next(error);
  }
};

/**
 * Atualizar informações da empresa
 * @route PUT /api/company
 */
const updateCompany = async (req, res, next) => {
  try {
    const companyId = req.companyId; // Obtido do middleware de autenticação
    const { 
      name, 
      primaryColor, 
      secondaryColor, 
      contactEmail, 
      contactPhone, 
      address 
    } = req.body;

    // Busca a empresa pelo ID
    const company = await Company.findByPk(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Atualiza os campos da empresa
    if (name) company.name = name;
    if (primaryColor) company.primaryColor = primaryColor;
    if (secondaryColor) company.secondaryColor = secondaryColor;
    if (contactEmail) company.contactEmail = contactEmail;
    if (contactPhone) company.contactPhone = contactPhone;
    if (address) company.address = address;

    await company.save();

    res.status(200).json({
      success: true,
      message: 'Empresa atualizada com sucesso',
      data: company
    });
  } catch (error) {
    logger.error(`Erro ao atualizar empresa: ${error.message}`);
    next(error);
  }
};

/**
 * Fazer upload do logo da empresa
 * @route POST /api/company/logo
 */
const uploadLogo = async (req, res, next) => {
  try {
    // Verifica se um arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum arquivo enviado'
      });
    }

    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a empresa pelo ID
    const company = await Company.findByPk(companyId);

    if (!company) {
      // Remove o arquivo enviado se a empresa não for encontrada
      fs.unlinkSync(req.file.path);
      
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Se já existir um logo, exclui o arquivo antigo
    if (company.logo) {
      const oldLogoPath = path.join(process.env.UPLOAD_DIR, company.logo);
      if (fs.existsSync(oldLogoPath)) {
        fs.unlinkSync(oldLogoPath);
      }
    }

    // Atualiza o caminho do logo no banco de dados
    company.logo = req.file.filename;
    await company.save();

    res.status(200).json({
      success: true,
      message: 'Logo atualizado com sucesso',
      data: {
        logo: company.logo
      }
    });
  } catch (error) {
    logger.error(`Erro ao fazer upload do logo: ${error.message}`);
    next(error);
  }
};

/**
 * Remover o logo da empresa
 * @route DELETE /api/company/logo
 */
const removeLogo = async (req, res, next) => {
  try {
    const companyId = req.companyId; // Obtido do middleware de autenticação

    // Busca a empresa pelo ID
    const company = await Company.findByPk(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada'
      });
    }

    // Se existir um logo, exclui o arquivo
    if (company.logo) {
      const logoPath = path.join(process.env.UPLOAD_DIR, company.logo);
      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }

      // Remove o caminho do logo no banco de dados
      company.logo = null;
      await company.save();
    }

    res.status(200).json({
      success: true,
      message: 'Logo removido com sucesso'
    });
  } catch (error) {
    logger.error(`Erro ao remover logo: ${error.message}`);
    next(error);
  }
};

module.exports = {
  getCompany,
  updateCompany,
  uploadLogo,
  removeLogo
};


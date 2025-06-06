/**
 * Modelo de Empresa
 * 
 * Este modelo representa as empresas que utilizam o sistema,
 * implementando a estrutura multi-tenant.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  logo: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  primaryColor: {
    type: DataTypes.STRING,
    defaultValue: '#7F00FF', // Cor padrão: Purple Creativity
  },
  secondaryColor: {
    type: DataTypes.STRING,
    defaultValue: '#0057FF', // Cor padrão: Blue Trust
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
  },
  contactEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  contactPhone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subscriptionPlan: {
    type: DataTypes.ENUM('basic', 'premium', 'enterprise'),
    defaultValue: 'basic',
  },
  subscriptionStatus: {
    type: DataTypes.ENUM('active', 'trial', 'expired', 'cancelled'),
    defaultValue: 'trial',
  },
  trialEndsAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'companies',
  timestamps: true,
});

module.exports = Company;


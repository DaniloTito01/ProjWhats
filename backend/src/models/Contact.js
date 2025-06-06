/**
 * Modelo de Contato
 * 
 * Este modelo representa os contatos que receberão mensagens,
 * associados a uma empresa específica.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Contact = sequelize.define('Contact', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  stage: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  lastInteraction: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  source: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  customFields: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  tableName: 'contacts',
  timestamps: true,
  indexes: [
    {
      fields: ['phone', 'companyId'],
      unique: true,
    },
    {
      fields: ['companyId'],
    },
    {
      fields: ['tags'],
      using: 'gin',
    },
  ],
});

module.exports = Contact;


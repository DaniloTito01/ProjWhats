/**
 * Modelo de Mensagem
 * 
 * Este modelo representa as mensagens enviadas para os contatos,
 * associadas a uma campanha e empresa específicas.
 */

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('pending', 'sent', 'delivered', 'read', 'failed'),
    defaultValue: 'pending',
  },
  mediaType: {
    type: DataTypes.ENUM('none', 'image', 'audio', 'video'),
    defaultValue: 'none',
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  campaignId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  contactId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  whatsappMessageId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    {
      fields: ['campaignId'],
    },
    {
      fields: ['contactId'],
    },
    {
      fields: ['companyId'],
    },
    {
      fields: ['status'],
    },
  ],
});

module.exports = Message;


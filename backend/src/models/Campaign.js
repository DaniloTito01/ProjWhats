/**
 * Modelo de Campanha
 * 
 * Este modelo representa as campanhas de envio de mensagens,
 * associadas a uma empresa específica.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Corrigido para importar a instância sequelize via desestruturação

const Campaign = sequelize.define("Campaign", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("draft", "scheduled", "in_progress", "completed", "cancelled"),
    defaultValue: "draft",
  },
  messageTemplate: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  mediaType: {
    type: DataTypes.ENUM("none", "image", "audio", "video"),
    defaultValue: "none",
  },
  mediaUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  targetTags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  minDelaySeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 5,
  },
  maxDelaySeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 15,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  totalContacts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  sentCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  deliveredCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  readCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  failedCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  responseCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: "campaigns",
  timestamps: true,
  indexes: [
    {
      fields: ["companyId"],
    },
    {
      fields: ["status"],
    },
    {
      fields: ["scheduledAt"],
    },
  ],
});

module.exports = Campaign;



/**
 * Modelo de Resposta
 * 
 * Este modelo representa as respostas recebidas dos contatos,
 * associadas a uma mensagem, contato e empresa específicos.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Corrigido para importar a instância sequelize via desestruturação

const Response = sequelize.define("Response", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content: {
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
  receivedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  readBy: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: true,
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
  tableName: "responses",
  timestamps: true,
  indexes: [
    {
      fields: ["messageId"],
    },
    {
      fields: ["contactId"],
    },
    {
      fields: ["companyId"],
    },
    {
      fields: ["isRead"],
    },
  ],
});

module.exports = Response;



/**
 * Modelo de Estágio do Funil de Vendas
 * 
 * Este modelo representa os estágios do funil de vendas,
 * associados a uma empresa específica.
 */

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database"); // Corrigido para importar a instância sequelize via desestruturação

const Stage = sequelize.define("Stage", {
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
  color: {
    type: DataTypes.STRING,
    defaultValue: "#7F00FF", // Cor padrão: Purple Creativity
  },
  position: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  isDefault: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  tableName: "stages",
  timestamps: true,
  indexes: [
    {
      fields: ["companyId"],
    },
    {
      fields: ["position"],
    },
  ],
});

module.exports = Stage;



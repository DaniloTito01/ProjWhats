/**
 * Modelo de Atividade
 * 
 * Este modelo representa uma atividade no CRM, como uma ligação, reunião ou email.
 */

const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Activity = sequelize.define("Activity", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  contactId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Contacts",
      key: "id"
    }
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Companies",
      key: "id"
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: "Users",
      key: "id"
    }
  },
  type: {
    type: DataTypes.ENUM("call", "meeting", "email", "whatsapp", "other"),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  duration: {
    type: DataTypes.INTEGER, // Duração em minutos
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  outcome: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "activities",
  timestamps: true
});

module.exports = Activity;



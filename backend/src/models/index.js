/**
 * Índice de Modelos
 * 
 * Este arquivo exporta todos os modelos e define as associações entre eles.
 */

const sequelize = require("../config/database");
const { DataTypes } = require("sequelize");

const User = require("./User");
const Company = require("./Company");
const Contact = require("./Contact");
const Campaign = require("./Campaign");
const Message = require("./Message");
const Response = require("./Response");
const Stage = require("./Stage");
const Activity = require("./Activity");
const Task = require("./Task");
const Note = require("./Note");

// Associações entre modelos

// User pertence a uma Company
User.belongsTo(Company, { foreignKey: "companyId" });
// Company tem muitos Users
Company.hasMany(User, { foreignKey: "companyId" });

// Contact pertence a uma Company
Contact.belongsTo(Company, { foreignKey: "companyId" });
// Company tem muitos Contacts
Company.hasMany(Contact, { foreignKey: "companyId" });

// Contact pertence a um Stage
Contact.belongsTo(Stage, { foreignKey: "stageId", as: "stage" });
// Stage tem muitos Contacts
Stage.hasMany(Contact, { foreignKey: "stageId" });

// Campaign pertence a uma Company
Campaign.belongsTo(Company, { foreignKey: "companyId" });
// Company tem muitas Campaigns
Company.hasMany(Campaign, { foreignKey: "companyId" });

// Message pertence a uma Campaign
Message.belongsTo(Campaign, { foreignKey: "campaignId" });
// Campaign tem muitas Messages
Campaign.hasMany(Message, { foreignKey: "campaignId" });

// Message pertence a um Contact
Message.belongsTo(Contact, { foreignKey: "contactId" });
// Contact tem muitas Messages
Contact.hasMany(Message, { foreignKey: "contactId" });

// Response pertence a uma Campaign
Response.belongsTo(Campaign, { foreignKey: "campaignId" });
// Campaign tem muitas Responses
Campaign.hasMany(Response, { foreignKey: "campaignId" });

// Response pertence a um Contact
Response.belongsTo(Contact, { foreignKey: "contactId" });
// Contact tem muitas Responses
Contact.hasMany(Response, { foreignKey: "contactId" });

// Stage pertence a uma Company
Stage.belongsTo(Company, { foreignKey: "companyId" });
// Company tem muitos Stages
Company.hasMany(Stage, { foreignKey: "companyId" });

// Activity pertence a um Contact
Activity.belongsTo(Contact, { foreignKey: "contactId" });
// Contact tem muitas Activities
Contact.hasMany(Activity, { foreignKey: "contactId" });

// Activity pertence a uma Company
Activity.belongsTo(Company, { foreignKey: "companyId" });
// Company tem muitas Activities
Company.hasMany(Activity, { foreignKey: "companyId" });

// Activity pertence a um User
Activity.belongsTo(User, { foreignKey: "userId" });
// User tem muitas Activities
User.hasMany(Activity, { foreignKey: "userId" });

// Task pertence a um Contact
Task.belongsTo(Contact, { foreignKey: "contactId" });
// Contact tem muitas Tasks
Contact.hasMany(Task, { foreignKey: "contactId" });

// Task pertence a uma Company
Task.belongsTo(Company, { foreignKey: "companyId" });
// Company tem muitas Tasks
Company.hasMany(Task, { foreignKey: "companyId" });

// Task pertence a um User
Task.belongsTo(User, { foreignKey: "userId" });
// User tem muitas Tasks
User.hasMany(Task, { foreignKey: "userId" });

// Note pertence a um Contact
Note.belongsTo(Contact, { foreignKey: "contactId" });
// Contact tem muitas Notes
Contact.hasMany(Note, { foreignKey: "contactId" });

// Note pertence a uma Company
Note.belongsTo(Company, { foreignKey: "companyId" });
// Company tem muitas Notes
Company.hasMany(Note, { foreignKey: "companyId" });

// Note pertence a um User
Note.belongsTo(User, { foreignKey: "userId" });
// User tem muitas Notes
User.hasMany(Note, { foreignKey: "userId" });

module.exports = {
  User,
  Company,
  Contact,
  Campaign,
  Message,
  Response,
  Stage,
  Activity,
  Task,
  Note
};



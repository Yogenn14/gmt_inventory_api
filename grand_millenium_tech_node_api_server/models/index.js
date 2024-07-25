const dbConfig = require("../config/dbConfig.js");

const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => {
    console.log("Error", err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./userModel.js")(sequelize, DataTypes);
db.inventory = require("./inventoryModel.js")(sequelize, DataTypes);
db.inventoryLog = require("./inventoryLog.js")(sequelize, DataTypes);
db.inventoryInOut = require("./inventoryInOutModel.js")(sequelize, DataTypes);
db.serializedItem = require("./serializedItem.js")(sequelize, DataTypes);
db.contactDatabase = require("./contactsDatabase.js")(sequelize, DataTypes);
db.unserializedIn = require("./unserializedInModel.js")(sequelize, DataTypes);
db.unserializedOut = require("./unserializedOutModel.js")(sequelize, DataTypes);
db.generalPO = require("./generalPOModel.js")(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize.sync({ force: false }).then(() => {
  console.log("Yes resync done");
});

module.exports = db;

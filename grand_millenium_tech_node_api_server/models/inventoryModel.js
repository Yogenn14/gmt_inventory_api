const { BOOLEAN } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    "Inventory",
    {
      partDescription: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      partNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      totalStock: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      manufactureroem: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      condition: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      outDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "email",
        },
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["partNumber", "partDescription"],
        },
      ],
    }
  );

  Inventory.associate = function (models) {
    Inventory.hasMany(models.serializedItem, {
      foreignKey: "inventoryId",
      as: "serializedItems",
    });
    Inventory.hasMany(models.unserializedIn, {
      foreignKey: "inventoryId",
      as: "unserializedIn",
    });
    Inventory.belongsTo(models.users, {
      foreignKey: "userEmail",
      targetKey: "email",
      as: "user",
    });
  };

  return Inventory;
};

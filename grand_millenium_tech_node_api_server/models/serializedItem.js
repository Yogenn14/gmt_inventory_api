const { BOOLEAN } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const SerializedItem = sequelize.define("SerializedItem", {
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Inventories",
        key: "id",
      },
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    condition: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    manufactureroem: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    outDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    warrantyEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    unitPrice: {
      type: DataTypes.DOUBLE,
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
    supplier: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    customer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  SerializedItem.associate = function (models) {
    SerializedItem.belongsTo(models.inventory, {
      foreignKey: "inventoryId",
      as: "inventory",
    });
    SerializedItem.belongsTo(models.users, {
      foreignKey: "userEmail",
      targetKey: "email",
      as: "user",
    });
  };

  return SerializedItem;
};

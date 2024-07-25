const { inventory } = require(".");

module.exports = (sequelize, DataTypes) => {
  const UnserializedIn = sequelize.define(
    "UnserializedIn",
    {
      inventoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Inventories",
          key: "id",
        },
      },
      totalPurchased: {
        type: DataTypes.INTEGER,
      },
      quantityChange: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      warrantyEndDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },
      supplier: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      manufactureroem: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      condition: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      unitPrice: {
        type: DataTypes.DOUBLE,
        allowNull: true,
      },
      totalPrice: {
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
    },
    {
      indexes: [
        {
          fields: ["inventoryId"],
        },
      ],
    }
  );

  UnserializedIn.associate = function (models) {
    UnserializedIn.belongsTo(models.inventory, {
      foreignKey: "inventoryId",
      as: "inventory",
    });
    UnserializedIn.hasMany(models.unserializedOut, {
      foreignKey: "unserializedInId",
      as: "unserializedOut",
    });
    UnserializedIn.belongsTo(models.users, {
      foreignKey: "userEmail",
      targetKey: "email",
      as: "user",
    });
  };

  return UnserializedIn;
};

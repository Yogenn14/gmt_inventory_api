const { unserializedIn } = require(".");

module.exports = (sequelize, DataTypes) => {
  const UnserializedOut = sequelize.define(
    "UnserializedOut",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      unserializedInId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "unserializedIns",
          key: "id",
        },
      },
      customer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "Users",
          key: "email",
        },
      },
      shipOutPrice: {
        type: DataTypes.DOUBLE,
      },
      profitPerUnit: {
        type: DataTypes.DOUBLE,
      },
      totalProfit: {
        type: DataTypes.DOUBLE,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          fields: ["unserializedInId"],
        },
      ],
    }
  );

  UnserializedOut.associate = function (models) {
    UnserializedOut.belongsTo(models.unserializedIn, {
      foreignKey: "unserializedInId",
      as: "unserializedOut",
    });
    UnserializedOut.belongsTo(models.users, {
      foreignKey: "userEmail",
      targetKey: "email",
      as: "user",
    });
  };

  return UnserializedOut;
};

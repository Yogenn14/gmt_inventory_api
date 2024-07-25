const { DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
        defaultValue: () => uuidv4(),
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      image: {
        type: DataTypes.STRING,
      },
      hashedPassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
      },

      refreshToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(
            user.hashedPassword,
            saltRounds
          );
          user.hashedPassword = hashedPassword;
        },
      },
    }
  );

  User.associate = function (models) {
    User.hasMany(models.inventory, {
      foreignKey: "userEmail",
      as: "inventories",
    });
  };

  return User;
};

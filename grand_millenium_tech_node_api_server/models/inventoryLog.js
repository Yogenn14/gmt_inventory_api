module.exports = (sequelize, DataTypes) => {
  const InventoryLog = sequelize.define("InventoryLog", {
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Inventories",
        key: "id",
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remark: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return InventoryLog;
};

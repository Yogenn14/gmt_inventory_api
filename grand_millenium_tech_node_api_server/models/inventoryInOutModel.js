module.exports = (sequelize, DataTypes) => {
  const InventoryInOut = sequelize.define("InventoryInOut", {
    inventoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Inventories",
        key: "id",
      },
    },
    prevQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    updatedQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    inDate: {
      type: DataTypes.DATE,
    },
    outDate: {
      type: DataTypes.DATE,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  });

  return InventoryInOut;
};

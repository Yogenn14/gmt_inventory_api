"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("SerializedItems", "supplier", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("SerializedItems", "customer", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("SerializedItems", "supplier");
    await queryInterface.removeColumn("SerializedItems", "customer");
  },
};

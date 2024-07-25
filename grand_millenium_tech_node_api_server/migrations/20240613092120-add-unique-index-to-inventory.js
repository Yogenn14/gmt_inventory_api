"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addIndex(
      "Inventories",
      ["partNumber", "partDescription"],
      {
        name: "unique_partNumber_partDescription",
        unique: true,
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      "Inventories",
      "unique_partNumber_partDescription"
    );
  },
};

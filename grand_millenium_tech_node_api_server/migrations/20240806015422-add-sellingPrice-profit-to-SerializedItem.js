'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SerializedItems', 'sellingPrice', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
    await queryInterface.addColumn('SerializedItems', 'profit', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SerializedItems', 'sellingPrice');
    await queryInterface.removeColumn('SerializedItems', 'profit');
  }
};

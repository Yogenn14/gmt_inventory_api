'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SerializedItems', 'currency', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('SerializedItems', 'conversionRate', {
      type: Sequelize.DOUBLE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SerializedItems', 'currency');
    await queryInterface.removeColumn('SerializedItems', 'conversionRate');
  }
};

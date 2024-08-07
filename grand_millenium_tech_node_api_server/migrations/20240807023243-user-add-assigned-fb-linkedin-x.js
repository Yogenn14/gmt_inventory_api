'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'assignedBy', {
      type: Sequelize.STRING,
    });
    await queryInterface.addColumn('Users', 'linkedIn', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'twitter', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Users', 'facebook', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'assignedBy');
    await queryInterface.removeColumn('Users', 'linkedIn');
    await queryInterface.removeColumn('Users', 'twitter');
    await queryInterface.removeColumn('Users', 'facebook');

  }
};

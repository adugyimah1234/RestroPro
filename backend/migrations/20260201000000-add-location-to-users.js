'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('users');
      if (!tableInfo.location) {
        await queryInterface.addColumn('users', 'location', {
          type: Sequelize.STRING,
          allowNull: true
        });
      }
    } catch (error) {
      console.log('Migration note: location column check/add:', error.message);
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      const tableInfo = await queryInterface.describeTable('users');
      if (tableInfo.location) {
        await queryInterface.removeColumn('users', 'location');
      }
    } catch (error) {
      console.log('Migration rollback note:', error.message);
    }
  }
};

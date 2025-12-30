'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('inventory_items', 'unit', {
      type: Sequelize.STRING(10),
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('inventory_items', 'unit', {
      type: Sequelize.ENUM('pc','kg','g','l','ml'),
      allowNull: false,
    });
  }
};
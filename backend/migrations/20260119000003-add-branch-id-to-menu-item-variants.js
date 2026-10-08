'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('menu_item_variants', 'branch_id', {
      type: Sequelize.INTEGER,
      references: {
        model: 'branches',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('menu_item_variants', 'branch_id');
  }
};

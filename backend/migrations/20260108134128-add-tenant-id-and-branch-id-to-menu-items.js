'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // tenant_id already added by previous migration
    await queryInterface.addColumn('menu_items', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Branches',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('menu_items', 'branch_id');
    // tenant_id not removed as it was added separately
  }
};

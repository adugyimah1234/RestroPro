'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('inventory_items', 'branch_id', {
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
    await queryInterface.removeColumn('inventory_items', 'branch_id');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('invoices', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // or false if every invoice must have a branch
      references: {
        model: 'Branches',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('invoices', 'branch_id');
  }
};
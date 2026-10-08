'use strict';

const tablesWithBranchScope = [
  'feedbacks',
  'inventory_logs',
  'menu_item_recipes',
  'inventory_vendors',
  'inventory_purchase_orders_drafts',
  'inventory_purchase_orders',
  'inventory_purchase_order_items',
];

module.exports = {
  async up(queryInterface, Sequelize) {
    for (const table of tablesWithBranchScope) {
      const columns = await queryInterface.describeTable(table);
      if (!columns.branch_id) {
        await queryInterface.addColumn(table, 'branch_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }
    }
  },

  async down(queryInterface) {
    for (const table of tablesWithBranchScope) {
      const columns = await queryInterface.describeTable(table);
      if (columns.branch_id) {
        await queryInterface.removeColumn(table, 'branch_id');
      }
    }
  },
};

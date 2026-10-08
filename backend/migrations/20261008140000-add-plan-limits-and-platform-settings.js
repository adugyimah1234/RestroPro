'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((table) =>
      typeof table === 'string' ? table : table.tableName
    );
    const planTable = tableNames.find((name) => name.toLowerCase() === 'subscription_plans');

    if (planTable) {
      const planColumns = await queryInterface.describeTable(planTable);
      if (!planColumns.max_users) {
        await queryInterface.addColumn(planTable, 'max_users', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }
      if (!planColumns.max_branches) {
        await queryInterface.addColumn(planTable, 'max_branches', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
      }

      const planNameColumn = planColumns.plan_code ? 'plan_code' : 'name';
      await queryInterface.sequelize.query(
        `UPDATE \`${planTable}\` SET max_users = 5, max_branches = 1 WHERE LOWER(\`${planNameColumn}\`) = 'basic'`
      );
      await queryInterface.sequelize.query(
        `UPDATE \`${planTable}\` SET max_users = 15, max_branches = 3 WHERE LOWER(\`${planNameColumn}\`) = 'premium'`
      );
      await queryInterface.sequelize.query(
        `UPDATE \`${planTable}\` SET max_users = NULL, max_branches = NULL WHERE LOWER(\`${planNameColumn}\`) IN ('advance', 'advanced')`
      );
    }

    const tenantColumns = await queryInterface.describeTable('tenants');
    if (!tenantColumns.subscription_plan_id) {
      await queryInterface.addColumn('tenants', 'subscription_plan_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }

    if (!tableNames.some((name) => name.toLowerCase() === 'platform_settings')) {
      await queryInterface.createTable('platform_settings', {
        setting_key: {
          type: Sequelize.STRING(100),
          primaryKey: true,
          allowNull: false,
        },
        encrypted_value: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
    }
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((table) =>
      typeof table === 'string' ? table : table.tableName
    );
    const planTable = tableNames.find((name) => name.toLowerCase() === 'subscription_plans');

    if (planTable) {
      const planColumns = await queryInterface.describeTable(planTable);
      if (planColumns.max_users) {
        await queryInterface.removeColumn(planTable, 'max_users');
      }
      if (planColumns.max_branches) {
        await queryInterface.removeColumn(planTable, 'max_branches');
      }
    }

    const tenantColumns = await queryInterface.describeTable('tenants');
    if (tenantColumns.subscription_plan_id) {
      await queryInterface.removeColumn('tenants', 'subscription_plan_id');
    }

    const settingsTable = tableNames.find((name) => name.toLowerCase() === 'platform_settings');
    if (settingsTable) {
      await queryInterface.dropTable(settingsTable);
    }
  },
};

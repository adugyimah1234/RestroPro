'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const addColumnIfMissing = async (table, column, definition) => {
      const columns = await queryInterface.describeTable(table);
      if (!columns[column]) {
        await queryInterface.addColumn(table, column, definition);
      }
    };

    const planTables = (await queryInterface.showAllTables()).map((table) =>
      typeof table === 'string' ? table : table.tableName
    );
    const planTable = planTables.find((table) => table.toLowerCase() === 'subscription_plans');
    if (planTable) {
      await addColumnIfMissing(planTable, 'advanced_reporting_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      await addColumnIfMissing(planTable, 'multi_branch_analytics_enabled', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
      await addColumnIfMissing(planTable, 'monthly_ai_queries', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      });
      const planCodeColumn = (await queryInterface.describeTable(planTable)).plan_code ? 'plan_code' : 'name';
      await queryInterface.sequelize.query(
        `UPDATE \`${planTable}\` SET max_users = 30, max_branches = 10, advanced_reporting_enabled = 1, multi_branch_analytics_enabled = 1, monthly_ai_queries = 100 WHERE LOWER(\`${planCodeColumn}\`) IN ('advance', 'advanced')`
      );
    }

    await addColumnIfMissing('payment_types', 'is_cash', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await addColumnIfMissing('invoices', 'branch_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing('invoices', 'created_by', {
      type: Sequelize.STRING(191),
      allowNull: true,
    });
    await addColumnIfMissing('invoices', 'cash_shift_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await addColumnIfMissing('invoices', 'cash_tender', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    const tablesNow = (await queryInterface.showAllTables()).map((table) =>
      typeof table === 'string' ? table : table.tableName
    );
    const createTableIfMissing = async (name, columns) => {
      if (!tablesNow.some((table) => table.toLowerCase() === name.toLowerCase())) {
        await queryInterface.createTable(name, columns);
      }
    };
    await createTableIfMissing('cash_shifts', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: { type: Sequelize.INTEGER, allowNull: false },
      branch_id: { type: Sequelize.INTEGER, allowNull: true },
      opened_by: { type: Sequelize.STRING(191), allowNull: false },
      opened_by_name: { type: Sequelize.STRING(191), allowNull: true },
      opened_at: { type: Sequelize.DATE, allowNull: false },
      opening_cash: { type: Sequelize.DECIMAL(12, 2), allowNull: false, defaultValue: 0 },
      closed_by: { type: Sequelize.STRING(191), allowNull: true },
      closed_by_name: { type: Sequelize.STRING(191), allowNull: true },
      closed_at: { type: Sequelize.DATE, allowNull: true },
      counted_cash: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      expected_cash: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      variance: { type: Sequelize.DECIMAL(12, 2), allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
    });

    await createTableIfMissing('accountability_expenses', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: { type: Sequelize.INTEGER, allowNull: false },
      branch_id: { type: Sequelize.INTEGER, allowNull: true },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      category: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.STRING(500), allowNull: false },
      spent_on: { type: Sequelize.DATEONLY, allowNull: false },
      created_by: { type: Sequelize.STRING(191), allowNull: false },
      created_by_name: { type: Sequelize.STRING(191), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await createTableIfMissing('accountability_targets', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: { type: Sequelize.INTEGER, allowNull: false },
      branch_id: { type: Sequelize.INTEGER, allowNull: true },
      target_type: { type: Sequelize.STRING(20), allowNull: false },
      amount: { type: Sequelize.DECIMAL(12, 2), allowNull: false },
      starts_on: { type: Sequelize.DATEONLY, allowNull: false },
      ends_on: { type: Sequelize.DATEONLY, allowNull: false },
      created_by: { type: Sequelize.STRING(191), allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
    });

    await createTableIfMissing('accountability_activity', {
      id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true, allowNull: false },
      tenant_id: { type: Sequelize.INTEGER, allowNull: false },
      branch_id: { type: Sequelize.INTEGER, allowNull: true },
      actor_username: { type: Sequelize.STRING(191), allowNull: true },
      actor_name: { type: Sequelize.STRING(191), allowNull: true },
      action: { type: Sequelize.STRING(80), allowNull: false },
      entity_type: { type: Sequelize.STRING(80), allowNull: false },
      entity_id: { type: Sequelize.STRING(191), allowNull: true },
      details: { type: Sequelize.JSON, allowNull: true },
      occurred_at: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface) {
    for (const table of [
      'accountability_activity',
      'accountability_targets',
      'accountability_expenses',
      'cash_shifts',
    ]) {
      await queryInterface.dropTable(table);
    }
    for (const column of ['cash_tender', 'cash_shift_id', 'created_by', 'branch_id']) {
      const invoiceColumns = await queryInterface.describeTable('invoices');
      if (invoiceColumns[column]) await queryInterface.removeColumn('invoices', column);
    }
    const paymentTypeColumns = await queryInterface.describeTable('payment_types');
    if (paymentTypeColumns.is_cash) await queryInterface.removeColumn('payment_types', 'is_cash');

    const tables = (await queryInterface.showAllTables()).map((table) =>
      typeof table === 'string' ? table : table.tableName
    );
    const planTable = tables.find((table) => table.toLowerCase() === 'subscription_plans');
    if (planTable) {
      for (const column of ['monthly_ai_queries', 'multi_branch_analytics_enabled', 'advanced_reporting_enabled']) {
        const planColumns = await queryInterface.describeTable(planTable);
        if (planColumns[column]) await queryInterface.removeColumn(planTable, column);
      }
    }
  },
};

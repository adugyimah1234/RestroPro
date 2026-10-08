'use strict';

const {
  AccountabilityActivity,
  AccountabilityExpense,
  AccountabilityTarget,
  Branch,
  CashShift,
  Invoice,
  PaymentType,
  Tenant,
  sequelize,
  Op,
} = require('../models');

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;
const { getEffectiveTenantPlan } = require('./tenantPlan.service');

async function writeActivity(values, transaction) {
  return AccountabilityActivity.create({
    ...values,
    occurred_at: new Date(),
  }, { transaction });
}

async function getPlanForTenant(tenantId) {
  const tenant = await Tenant.findByPk(tenantId, { attributes: ['subscription_plan_id'] });
  if (!tenant?.subscription_plan_id) return null;
  return getEffectiveTenantPlan(tenantId);
}

function createInvoiceFilter(tenantId, branchId, from, to) {
  const where = { tenant_id: tenantId };
  if (branchId !== undefined) where.branch_id = branchId;
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = new Date(`${from}T00:00:00`);
    if (to) where.created_at[Op.lt] = new Date(new Date(`${to}T00:00:00`).getTime() + 86400000);
  }
  return where;
}

async function getDashboard({ tenantId, branchId, from, to, user }) {
  const [revenue, expenseTotal, invoiceCount, targets, openShift, shifts, expenses, activity, plan] = await Promise.all([
    Invoice.sum('total', { where: createInvoiceFilter(tenantId, branchId, from, to) }),
    AccountabilityExpense.sum('amount', {
      where: {
        tenant_id: tenantId,
        ...(branchId !== undefined ? { [Op.or]: [{ branch_id: branchId }, { branch_id: null }] } : {}),
        ...(from || to ? { spent_on: { ...(from ? { [Op.gte]: from } : {}), ...(to ? { [Op.lte]: to } : {}) } } : {}),
      },
    }),
    Invoice.count({ where: createInvoiceFilter(tenantId, branchId, from, to) }),
    AccountabilityTarget.findAll({
      where: {
        tenant_id: tenantId,
        ...(branchId !== undefined ? { [Op.or]: [{ branch_id: branchId }, { branch_id: null }] } : { branch_id: null }),
        ...(from && to ? { starts_on: { [Op.lte]: to }, ends_on: { [Op.gte]: from } } : {}),
      },
      order: [['starts_on', 'DESC']],
    }),
    CashShift.findOne({
      where: {
        tenant_id: tenantId,
        ...(branchId !== undefined ? { branch_id: branchId } : {}),
        opened_by: user.username,
        closed_at: null,
      },
      order: [['opened_at', 'DESC']],
    }),
    CashShift.findAll({
      where: {
        tenant_id: tenantId,
        ...(branchId !== undefined ? { branch_id: branchId } : {}),
        ...(from ? { opened_at: { [Op.gte]: new Date(`${from}T00:00:00`) } } : {}),
        ...(to ? { opened_at: { [Op.lt]: new Date(new Date(`${to}T00:00:00`).getTime() + 86400000) } } : {}),
      },
      order: [['opened_at', 'DESC']],
      limit: 8,
    }),
    AccountabilityExpense.findAll({
      where: {
        tenant_id: tenantId,
        ...(branchId !== undefined ? { [Op.or]: [{ branch_id: branchId }, { branch_id: null }] } : {}),
        ...(from || to ? { spent_on: { ...(from ? { [Op.gte]: from } : {}), ...(to ? { [Op.lte]: to } : {}) } } : {}),
      },
      order: [['spent_on', 'DESC'], ['id', 'DESC']],
      limit: 8,
    }),
    AccountabilityActivity.findAll({
      where: {
        tenant_id: tenantId,
        ...(branchId !== undefined ? { branch_id: branchId } : {}),
      },
      order: [['occurred_at', 'DESC']],
      limit: 12,
    }),
    getPlanForTenant(tenantId),
  ]);

  const branches = plan?.multi_branch_analytics_enabled
    ? await Branch.findAll({
      where: { tenant_id: tenantId },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    })
    : [];
  if (openShift) {
    const cashSales = await Invoice.sum('total', {
      where: { tenant_id: tenantId, cash_shift_id: openShift.id, cash_tender: true },
    });
    openShift.setDataValue('cashSales', roundMoney(cashSales || 0));
    openShift.setDataValue('expectedCash', roundMoney(Number(openShift.opening_cash) + Number(cashSales || 0)));
  }

  return {
    revenue: roundMoney(revenue || 0),
    expenses: roundMoney(expenseTotal || 0),
    netAfterRecordedExpenses: roundMoney(Number(revenue || 0) - Number(expenseTotal || 0)),
    invoiceCount,
    targets,
    openShift,
    shifts,
    expensesRecent: expenses,
    activity,
    branches,
    capabilities: {
      advancedReporting: Boolean(plan?.advanced_reporting_enabled),
      multiBranchAnalytics: Boolean(plan?.multi_branch_analytics_enabled),
      monthlyAiQueries: Number(plan?.monthly_ai_queries || 0),
    },
  };
}

async function openCashShift({ tenantId, branchId, username, name, openingCash }) {
  if (!Number.isFinite(Number(openingCash)) || Number(openingCash) < 0) {
    throw Object.assign(new Error('Opening cash must be a non-negative amount.'), { status: 400 });
  }

  return sequelize.transaction(async (transaction) => {
    const tenant = await Tenant.findByPk(tenantId, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!tenant) throw Object.assign(new Error('Tenant account not found.'), { status: 404 });
    const openShift = await CashShift.findOne({
      where: { tenant_id: tenantId, branch_id: branchId ?? null, opened_by: username, closed_at: null },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (openShift) {
      throw Object.assign(new Error('You already have an open register session.'), { status: 409 });
    }

    const shift = await CashShift.create({
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      opened_by: username,
      opened_by_name: name || username,
      opened_at: new Date(),
      opening_cash: roundMoney(openingCash),
    }, { transaction });
    await writeActivity({
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      actor_username: username,
      actor_name: name || username,
      action: 'shift_opened',
      entity_type: 'cash_shift',
      entity_id: String(shift.id),
      details: { openingCash: roundMoney(openingCash) },
    }, transaction);
    return shift;
  });
}

async function closeCashShift({ tenantId, branchId, shiftId, username, name, role, countedCash, notes }) {
  if (!Number.isFinite(Number(countedCash)) || Number(countedCash) < 0) {
    throw Object.assign(new Error('Counted cash must be a non-negative amount.'), { status: 400 });
  }

  return sequelize.transaction(async (transaction) => {
    const shift = await CashShift.findOne({
      where: {
        id: shiftId,
        tenant_id: tenantId,
        branch_id: branchId ?? null,
        closed_at: null,
      },
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!shift) throw Object.assign(new Error('Open register session not found.'), { status: 404 });
    if (shift.opened_by !== username && role !== 'admin') {
      throw Object.assign(new Error('Only the session owner or an administrator can close this register.'), { status: 403 });
    }

    const cashSales = await Invoice.sum('total', {
      where: { tenant_id: tenantId, cash_shift_id: shift.id, cash_tender: true },
      transaction,
    });
    const expectedCash = roundMoney(Number(shift.opening_cash) + Number(cashSales || 0));
    const counted = roundMoney(countedCash);
    const variance = roundMoney(counted - expectedCash);
    await shift.update({
      closed_by: username,
      closed_by_name: name || username,
      closed_at: new Date(),
      counted_cash: counted,
      expected_cash: expectedCash,
      variance,
      notes: notes || null,
    }, { transaction });

    await writeActivity({
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      actor_username: username,
      actor_name: name || username,
      action: 'shift_closed',
      entity_type: 'cash_shift',
      entity_id: String(shift.id),
      details: { expectedCash, countedCash: counted, variance },
    }, transaction);
    return shift;
  });
}

async function createExpense({ tenantId, branchId, username, name, amount, category, description, spentOn }) {
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw Object.assign(new Error('Expense amount must be greater than zero.'), { status: 400 });
  }
  if (!String(category || '').trim() || !String(description || '').trim()) {
    throw Object.assign(new Error('Expense category and description are required.'), { status: 400 });
  }
  const expenseDate = new Date(`${spentOn}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(spentOn || '')) || Number.isNaN(expenseDate.getTime()) || expenseDate.toISOString().slice(0, 10) !== spentOn) {
    throw Object.assign(new Error('Enter a valid expense date.'), { status: 400 });
  }

  return sequelize.transaction(async (transaction) => {
    const expense = await AccountabilityExpense.create({
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      amount: roundMoney(amount),
      category: String(category).trim().slice(0, 100),
      description: String(description).trim().slice(0, 500),
      spent_on: spentOn,
      created_by: username,
      created_by_name: name || username,
      created_at: new Date(),
    }, { transaction });
    await writeActivity({
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      actor_username: username,
      actor_name: name || username,
      action: 'expense_recorded',
      entity_type: 'expense',
      entity_id: String(expense.id),
      details: { amount: roundMoney(amount), category: expense.category },
    }, transaction);
    return expense;
  });
}

async function saveTarget({ tenantId, branchId, username, targetType, amount, startsOn, endsOn }) {
  if (!['sales', 'expense'].includes(targetType)) {
    throw Object.assign(new Error('Target type must be sales or expense.'), { status: 400 });
  }
  if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
    throw Object.assign(new Error('Target amount must be greater than zero.'), { status: 400 });
  }
  const validDate = (value) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return false;
    const parsed = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  };
  if (!validDate(startsOn) || !validDate(endsOn) || startsOn > endsOn) {
    throw Object.assign(new Error('Enter a valid target date range.'), { status: 400 });
  }

  return sequelize.transaction(async (transaction) => {
    const targetWhere = {
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      target_type: targetType,
      starts_on: startsOn,
      ends_on: endsOn,
    };
    const existing = await AccountabilityTarget.findOne({
      where: targetWhere,
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const target = existing
      ? await existing.update({ amount: roundMoney(amount), created_by: username }, { transaction })
      : await AccountabilityTarget.create({
        ...targetWhere,
        amount: roundMoney(amount),
        created_by: username,
        created_at: new Date(),
      }, { transaction });
    await writeActivity({
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      actor_username: username,
      action: existing ? 'target_updated' : 'target_set',
      entity_type: 'accountability_target',
      entity_id: String(target.id),
      details: { targetType, amount: roundMoney(amount), startsOn, endsOn },
    }, transaction);
    return target;
  });
}

async function recordInvoice({ tenantId, branchId, username, name, invoiceId, paymentTypeId }, transaction) {
  const paymentType = paymentTypeId
    ? await PaymentType.findOne({
      where: { id: paymentTypeId, tenant_id: tenantId },
      attributes: ['is_cash'],
      transaction,
    })
    : null;
  const openShift = await CashShift.findOne({
    where: {
      tenant_id: tenantId,
      branch_id: branchId ?? null,
      opened_by: username,
      closed_at: null,
    },
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  const invoice = await Invoice.findOne({
    where: { id: invoiceId, tenant_id: tenantId, branch_id: branchId ?? null },
    attributes: ['id'],
    transaction,
    lock: transaction.LOCK.UPDATE,
  });
  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} was not found for tenant ${tenantId}.`);
  }
  await Invoice.update({
    branch_id: branchId ?? null,
    created_by: username,
    cash_shift_id: openShift?.id || null,
    cash_tender: Boolean(paymentType?.is_cash),
  }, {
    where: { id: invoiceId, tenant_id: tenantId, branch_id: branchId ?? null },
    transaction,
  });
  await writeActivity({
    tenant_id: tenantId,
    branch_id: branchId ?? null,
    actor_username: username,
    actor_name: name || username,
    action: 'sale_recorded',
    entity_type: 'invoice',
    entity_id: String(invoiceId),
    details: { paymentTypeId: paymentTypeId || null, cashTender: Boolean(paymentType?.is_cash) },
  }, transaction);
}

module.exports = {
  closeCashShift,
  createExpense,
  getDashboard,
  getPlanForTenant,
  openCashShift,
  recordInvoice,
  saveTarget,
  writeActivity,
};

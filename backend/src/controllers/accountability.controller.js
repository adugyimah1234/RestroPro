'use strict';

const { GoogleGenAI } = require('@google/genai');
const {
  AccountabilityActivity,
  AccountabilityExpense,
  Branch,
  CashShift,
  Invoice,
  PaymentType,
  Tenant,
  sequelize,
  Op,
} = require('../models');
const { getSuperAdminSettings } = require('../services/superadminSettings.service');
const { getCurrencyDB } = require('../services/settings.service');
const {
  closeCashShift,
  createExpense,
  getDashboard,
  getPlanForTenant,
  openCashShift,
  saveTarget,
} = require('../services/accountability.service');

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100;

function sendError(res, error) {
  const status = Number.isInteger(error.status) ? error.status : 500;
  if (status === 500) console.error('Accountability request failed:', error);
  return res.status(status).json({ success: false, message: status === 500 ? 'Unable to complete the accountability request.' : error.message });
}

function validateDate(value) {
  if (!datePattern.test(String(value || ''))) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function getDateRange(from, to) {
  const today = new Date();
  const todayText = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const startOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const start = from || startOfMonth;
  const end = to || todayText;
  if (!validateDate(start) || !validateDate(end) || start > end) {
    throw Object.assign(new Error('Choose a valid reporting date range.'), { status: 400 });
  }
  return { from: start, to: end };
}

async function resolveBranch(req, requestedBranchId) {
  const userBranchId = req.user.branch_id ?? null;
  if (userBranchId !== null) {
    if (requestedBranchId && Number(requestedBranchId) !== Number(userBranchId)) {
      throw Object.assign(new Error('You can only access your assigned branch.'), { status: 403 });
    }
    return userBranchId;
  }
  if (!requestedBranchId) return undefined;
  const branchId = Number(requestedBranchId);
  if (!Number.isInteger(branchId) || branchId < 1) {
    throw Object.assign(new Error('Choose a valid branch.'), { status: 400 });
  }
  const branch = await Branch.findOne({ where: { id: branchId, tenant_id: req.user.tenant_id } });
  if (!branch) throw Object.assign(new Error('Branch not found.'), { status: 404 });
  return branchId;
}

exports.getDashboard = async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query.from, req.query.to);
    const plan = await getPlanForTenant(req.user.tenant_id);
    const branches = await Branch.findAll({
      where: {
        tenant_id: req.user.tenant_id,
        ...(req.user.branch_id != null ? { id: req.user.branch_id } : {}),
      },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    const requestedBranch = req.query.branchId;
    if (!plan?.multi_branch_analytics_enabled && (req.user.branch_id ?? null) === null && branches.length > 1 && !requestedBranch) {
      return res.status(200).json({
        branchRequired: true,
        branches,
        currency: await getCurrencyDB(req.user.tenant_id),
        capabilities: {
          advancedReporting: Boolean(plan?.advanced_reporting_enabled),
          multiBranchAnalytics: false,
          monthlyAiQueries: Number(plan?.monthly_ai_queries || 0),
        },
      });
    }

    const branchId = await resolveBranch(req, requestedBranch);
    const dashboard = await getDashboard({
      tenantId: req.user.tenant_id,
      branchId,
      from,
      to,
      user: req.user,
    });
    dashboard.currency = await getCurrencyDB(req.user.tenant_id);
    dashboard.capabilities.aiQuota = await getMonthlyQuota(
      req.user.tenant_id,
      dashboard.capabilities.monthlyAiQueries
    );
    if (dashboard.capabilities.multiBranchAnalytics && branchId === undefined) {
      dashboard.branchComparisons = await getBranchComparisons(req.user.tenant_id, from, to);
    }
    return res.status(200).json({ ...dashboard, branches });
  } catch (error) {
    return sendError(res, error);
  }
};

async function getBranchComparisons(tenantId, from, to) {
  const [branches, branchRows, expenseRows] = await Promise.all([
    Branch.findAll({
      where: { tenant_id: tenantId },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    }),
    Invoice.findAll({
    attributes: [
      'branch_id',
      [sequelize.fn('SUM', sequelize.col('total')), 'revenue'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'invoices'],
    ],
    where: {
      ...invoicePeriodWhere(tenantId, from, to),
      branch_id: { [Op.ne]: null },
    },
    group: ['branch_id'],
    raw: true,
    }),
    AccountabilityExpense.findAll({
      attributes: ['branch_id', [sequelize.fn('SUM', sequelize.col('amount')), 'expenses']],
      where: {
        tenant_id: tenantId,
        spent_on: { [Op.gte]: from, [Op.lte]: to },
        branch_id: { [Op.ne]: null },
      },
      group: ['branch_id'],
      raw: true,
    }),
  ]);
  const sales = new Map(branchRows.map((row) => [Number(row.branch_id), row]));
  const expenses = new Map(expenseRows.map((row) => [Number(row.branch_id), Number(row.expenses || 0)]));
  return branches.map((branch) => {
    const row = sales.get(Number(branch.id));
    return {
      branchId: Number(branch.id),
      branchName: branch.name,
      revenue: roundMoney(row?.revenue || 0),
      expenses: roundMoney(expenses.get(Number(branch.id)) || 0),
      invoiceCount: Number(row?.invoices || 0),
    };
  });
}

function invoicePeriodWhere(tenantId, from, to) {
  return {
    tenant_id: tenantId,
    created_at: {
      [Op.gte]: new Date(`${from}T00:00:00`),
      [Op.lt]: new Date(new Date(`${to}T00:00:00`).getTime() + 86400000),
    },
  };
}

exports.openShift = async (req, res) => {
  try {
    const shift = await openCashShift({
      tenantId: req.user.tenant_id,
      branchId: await resolveBranch(req, req.body.branchId),
      username: req.user.username,
      name: req.user.name,
      openingCash: req.body.openingCash,
    });
    return res.status(201).json({ success: true, shift });
  } catch (error) {
    return sendError(res, error);
  }
};

exports.closeShift = async (req, res) => {
  try {
    const shiftReference = await CashShift.findOne({
      where: { id: Number(req.params.id), tenant_id: req.user.tenant_id },
      attributes: ['id', 'branch_id'],
    });
    if (!shiftReference) throw Object.assign(new Error('Open register session not found.'), { status: 404 });
    if (req.user.branch_id != null && Number(req.user.branch_id) !== Number(shiftReference.branch_id)) {
      throw Object.assign(new Error('You can only close a register in your assigned branch.'), { status: 403 });
    }
    const shift = await closeCashShift({
      tenantId: req.user.tenant_id,
      branchId: shiftReference.branch_id,
      shiftId: Number(req.params.id),
      username: req.user.username,
      name: req.user.name,
      role: req.user.role,
      countedCash: req.body.countedCash,
      notes: req.body.notes,
    });
    return res.status(200).json({ success: true, shift });
  } catch (error) {
    return sendError(res, error);
  }
};

exports.createExpense = async (req, res) => {
  try {
    const expense = await createExpense({
      tenantId: req.user.tenant_id,
      branchId: await resolveBranch(req, req.body.branchId),
      username: req.user.username,
      name: req.user.name,
      amount: req.body.amount,
      category: req.body.category,
      description: req.body.description,
      spentOn: req.body.spentOn,
    });
    return res.status(201).json({ success: true, expense });
  } catch (error) {
    return sendError(res, error);
  }
};

exports.saveTarget = async (req, res) => {
  try {
    const target = await saveTarget({
      tenantId: req.user.tenant_id,
      branchId: await resolveBranch(req, req.body.branchId),
      username: req.user.username,
      targetType: req.body.targetType,
      amount: req.body.amount,
      startsOn: req.body.startsOn,
      endsOn: req.body.endsOn,
    });
    return res.status(201).json({ success: true, target });
  } catch (error) {
    return sendError(res, error);
  }
};

exports.askBusinessQuestion = async (req, res) => {
  let reservation;
  try {
    const question = String(req.body.question || '').trim();
    if (question.length < 3 || question.length > 500) {
      return res.status(400).json({ success: false, message: 'Ask a question between 3 and 500 characters.' });
    }
    const plan = await getPlanForTenant(req.user.tenant_id);
    if (!plan?.advanced_reporting_enabled) {
      return res.status(403).json({ success: false, message: 'AI business reporting is available on the Advance plan.' });
    }
    const apiKeySettings = await getSuperAdminSettings();
    if (!apiKeySettings?.gemini_api_key) {
      return res.status(503).json({ success: false, message: 'AI reporting is not configured. Contact your platform administrator.' });
    }

    reservation = await reserveAiQuestion(req.user, plan.monthly_ai_queries);
    const ai = new GoogleGenAI({ apiKey: apiKeySettings.gemini_api_key });
    const intentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        'Convert the question into one safe report request. Return only JSON with metric, period, from, and to.',
        'Allowed metric values: revenue, expenses, net_after_expenses, invoice_count, sales_by_staff, sales_by_payment, branch_comparison.',
        'Allowed period values: today, yesterday, last_7_days, this_month, last_month, custom.',
        'For custom periods include from and to as YYYY-MM-DD. Otherwise set both to null.',
        'Never request raw customer records, secrets, or arbitrary database queries. Choose the closest supported metric.',
        `Question: ${question}`,
      ].join('\n'),
      config: { responseMimeType: 'application/json' },
    });
    const intent = parseReportIntent(intentResponse.text);
    if (intent.metric === 'branch_comparison' && !plan.multi_branch_analytics_enabled) {
      throw Object.assign(new Error('Multi-branch comparisons are available on the Advance plan.'), { status: 403 });
    }
    const { from, to } = resolveIntentRange(intent);
    const branchId = await resolveBranch(req, req.body.branchId);
    if (intent.metric === 'branch_comparison' && branchId !== undefined) {
      throw Object.assign(new Error('Branch comparisons require tenant-wide access.'), { status: 403 });
    }
    const branchCount = await Branch.count({ where: { tenant_id: req.user.tenant_id } });
    if (!plan.multi_branch_analytics_enabled && branchId === undefined && branchCount > 1) {
      throw Object.assign(new Error('Choose a branch to run this report on your current plan.'), { status: 403 });
    }

    const result = await executeReportIntent({
      metric: intent.metric,
      tenantId: req.user.tenant_id,
      branchId,
      from,
      to,
    });
    await completeAiQuestion(reservation.id, intent);
    return res.status(200).json({
      success: true,
      answer: formatReportAnswer(intent.metric, result, from, to, await getCurrencyDB(req.user.tenant_id)),
      result,
      period: { from, to },
      quota: await getMonthlyQuota(req.user.tenant_id, plan.monthly_ai_queries),
    });
  } catch (error) {
    if (reservation?.id) await failAiQuestion(reservation.id, error.message);
    return sendError(res, error);
  }
};

function parseReportIntent(text) {
  if (!text) throw new Error('The reporting assistant returned an empty response.');
  let intent;
  try {
    intent = JSON.parse(text);
  } catch {
    throw new Error('The reporting assistant returned an invalid request. Please rephrase your question.');
  }
  const metrics = ['revenue', 'expenses', 'net_after_expenses', 'invoice_count', 'sales_by_staff', 'sales_by_payment', 'branch_comparison'];
  const periods = ['today', 'yesterday', 'last_7_days', 'this_month', 'last_month', 'custom'];
  if (!metrics.includes(intent.metric) || !periods.includes(intent.period)) {
    throw Object.assign(new Error('That question is outside the supported business reporting topics.'), { status: 400 });
  }
  if (intent.period === 'custom' && (!validateDate(intent.from) || !validateDate(intent.to) || intent.from > intent.to)) {
    throw Object.assign(new Error('The requested reporting date range is invalid.'), { status: 400 });
  }
  return intent;
}

function resolveIntentRange(intent) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start;
  let end;
  if (intent.period === 'custom') return { from: intent.from, to: intent.to };
  if (intent.period === 'today') start = end = today;
  if (intent.period === 'yesterday') {
    start = new Date(today);
    start.setDate(start.getDate() - 1);
    end = start;
  }
  if (intent.period === 'last_7_days') {
    end = today;
    start = new Date(today);
    start.setDate(start.getDate() - 6);
  }
  if (intent.period === 'this_month') {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = today;
  }
  if (intent.period === 'last_month') {
    start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    end = new Date(today.getFullYear(), today.getMonth(), 0);
  }
  const toDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  return { from: toDate(start), to: toDate(end) };
}

async function executeReportIntent({ metric, tenantId, branchId, from, to }) {
  const invoiceWhere = invoicePeriodWhere(tenantId, from, to);
  const expenseWhere = {
    tenant_id: tenantId,
    spent_on: { [Op.gte]: from, [Op.lte]: to },
  };
  if (branchId !== undefined) {
    invoiceWhere.branch_id = branchId;
    expenseWhere[Op.or] = [{ branch_id: branchId }, { branch_id: null }];
  }
  if (metric === 'revenue') return { value: roundMoney(await Invoice.sum('total', { where: invoiceWhere }) || 0) };
  if (metric === 'expenses') return { value: roundMoney(await AccountabilityExpense.sum('amount', { where: expenseWhere }) || 0) };
  if (metric === 'net_after_expenses') {
    const [sales, expenses] = await Promise.all([
      Invoice.sum('total', { where: invoiceWhere }),
      AccountabilityExpense.sum('amount', { where: expenseWhere }),
    ]);
    return { revenue: roundMoney(sales || 0), expenses: roundMoney(expenses || 0), value: roundMoney(Number(sales || 0) - Number(expenses || 0)) };
  }
  if (metric === 'invoice_count') return { value: await Invoice.count({ where: invoiceWhere }) };
  if (metric === 'sales_by_staff') {
    return Invoice.findAll({
      attributes: ['created_by', [sequelize.fn('SUM', sequelize.col('total')), 'revenue'], [sequelize.fn('COUNT', sequelize.col('id')), 'invoiceCount']],
      where: { ...invoiceWhere, created_by: { [Op.ne]: null } },
      group: ['created_by'],
      order: [[sequelize.literal('revenue'), 'DESC']],
      raw: true,
    });
  }
  if (metric === 'sales_by_payment') {
    return Invoice.findAll({
      attributes: ['payment_type_id', [sequelize.col('PaymentType.title'), 'paymentType'], [sequelize.fn('SUM', sequelize.col('total')), 'revenue']],
      where: invoiceWhere,
      include: [{ model: PaymentType, as: 'PaymentType', attributes: [], required: false }],
      group: ['payment_type_id', 'PaymentType.title'],
      raw: true,
    });
  }
  if (metric === 'branch_comparison') {
    const [branches, invoices] = await Promise.all([Branch.findAll({
      where: { tenant_id: tenantId },
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    }), Invoice.findAll({
      attributes: ['branch_id', [sequelize.fn('SUM', sequelize.col('total')), 'revenue'], [sequelize.fn('COUNT', sequelize.col('id')), 'invoiceCount']],
      where: { ...invoiceWhere, branch_id: { [Op.ne]: null } },
      group: ['branch_id'],
      raw: true,
    })]);
    const sales = new Map(invoices.map((row) => [Number(row.branch_id), row]));
    return branches.map((branch) => {
      const row = sales.get(Number(branch.id));
      return {
        branch: branch.name,
        revenue: roundMoney(row?.revenue || 0),
        invoiceCount: Number(row?.invoiceCount || 0),
      };
    });
  }
  throw Object.assign(new Error('That report is not available.'), { status: 400 });
}

function formatReportAnswer(metric, result, from, to, currency) {
  const amount = (value) => `${currency || ''} ${Number(value || 0).toFixed(2)}`.trim();
  const period = from === to ? `on ${from}` : `from ${from} to ${to}`;
  if (metric === 'revenue') return `Sales revenue ${period} was ${amount(result.value)}.`;
  if (metric === 'expenses') return `Recorded expenses ${period} were ${amount(result.value)}.`;
  if (metric === 'net_after_expenses') return `Revenue was ${amount(result.revenue)} and recorded expenses were ${amount(result.expenses)}, leaving ${amount(result.value)} before other costs ${period}.`;
  if (metric === 'invoice_count') return `${result.value} paid invoices were recorded ${period}.`;
  if (metric === 'sales_by_staff') return result.length
    ? `Sales by staff ${period}: ${result.map((row) => `${row.created_by}: ${amount(row.revenue)} (${row.invoiceCount} invoices)`).join('; ')}.`
    : `No staff-attributed sales were recorded ${period}.`;
  if (metric === 'sales_by_payment') return result.length
    ? `Sales by payment method ${period}: ${result.map((row) => `${row.paymentType || 'Unspecified'}: ${amount(row.revenue)}`).join('; ')}.`
    : `No sales were recorded ${period}.`;
  return result.length
    ? `Branch sales ${period}: ${result.map((row) => `${row.branch}: ${amount(row.revenue)} (${row.invoiceCount} invoices)`).join('; ')}.`
    : `No branch-attributed sales were recorded ${period}.`;
}

async function reserveAiQuestion(user, limit) {
  if (Number(limit) <= 0) throw Object.assign(new Error('No monthly AI reporting questions are included in this plan.'), { status: 403 });
  return sequelize.transaction(async (transaction) => {
    const tenant = await Tenant.findByPk(user.tenant_id, {
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    if (!tenant) throw Object.assign(new Error('Tenant account not found.'), { status: 404 });
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const used = await AccountabilityActivity.count({
      where: {
        tenant_id: user.tenant_id,
        action: { [Op.in]: ['ai_report_reserved', 'ai_report'] },
        occurred_at: { [Op.gte]: monthStart, [Op.lt]: monthEnd },
      },
      transaction,
    });
    if (used >= Number(limit)) {
      throw Object.assign(new Error(`This tenant has used all ${limit} AI reporting questions for this month.`), { status: 429 });
    }
    return AccountabilityActivity.create({
      tenant_id: user.tenant_id,
      branch_id: user.branch_id ?? null,
      actor_username: user.username,
      actor_name: user.name || user.username,
      action: 'ai_report_reserved',
      entity_type: 'ai_report',
      details: {},
      occurred_at: now,
    }, { transaction });
  });
}

async function completeAiQuestion(id, intent) {
  await AccountabilityActivity.update({
    action: 'ai_report',
    details: { metric: intent.metric, period: intent.period },
  }, { where: { id } });
}

async function failAiQuestion(id, reason) {
  await AccountabilityActivity.update({
    action: 'ai_report_failed',
    details: { reason: String(reason).slice(0, 200) },
  }, { where: { id } });
}

async function getMonthlyQuota(tenantId, limit) {
  const now = new Date();
  const used = await AccountabilityActivity.count({
    where: {
      tenant_id: tenantId,
      action: 'ai_report',
      occurred_at: {
        [Op.gte]: new Date(now.getFullYear(), now.getMonth(), 1),
        [Op.lt]: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      },
    },
  });
  return { used, limit: Number(limit), remaining: Math.max(0, Number(limit) - used) };
}

exports.getActivity = async (req, res) => {
  try {
    const branchId = await resolveBranch(req, req.query.branchId);
    const activity = await AccountabilityActivity.findAll({
      where: {
        tenant_id: req.user.tenant_id,
        ...(branchId !== undefined ? { branch_id: branchId } : {}),
      },
      order: [['occurred_at', 'DESC']],
      limit: Math.min(Math.max(Number(req.query.limit) || 30, 1), 100),
    });
    return res.status(200).json(activity);
  } catch (error) {
    return sendError(res, error);
  }
};

exports.listExpenses = async (req, res) => {
  try {
    const { from, to } = getDateRange(req.query.from, req.query.to);
    const branchId = await resolveBranch(req, req.query.branchId);
    const expenses = await AccountabilityExpense.findAll({
      where: {
        tenant_id: req.user.tenant_id,
        ...(branchId !== undefined ? { [Op.or]: [{ branch_id: branchId }, { branch_id: null }] } : {}),
        spent_on: { [Op.gte]: from, [Op.lte]: to },
      },
      order: [['spent_on', 'DESC'], ['id', 'DESC']],
    });
    return res.status(200).json(expenses);
  } catch (error) {
    return sendError(res, error);
  }
};

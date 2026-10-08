'use strict';

const { SubscriptionPlan, Tenant } = require('../models');

const OVERRIDE_FIELDS = [
  'max_users_override',
  'max_branches_override',
  'advanced_reporting_enabled_override',
  'multi_branch_analytics_enabled_override',
  'monthly_ai_queries_override',
];

async function getEffectiveTenantPlan(tenantId, options = {}) {
  const tenant = await Tenant.findByPk(tenantId, {
    attributes: ['subscription_plan_id', ...OVERRIDE_FIELDS],
    transaction: options.transaction,
    lock: options.transaction ? options.transaction.LOCK.UPDATE : undefined,
  });
  if (!tenant) throw new Error(`Tenant ${tenantId} was not found while resolving plan settings.`);
  if (tenant.subscription_plan_id == null) return null;

  const plan = await SubscriptionPlan.findByPk(tenant.subscription_plan_id, {
    transaction: options.transaction,
  });
  if (!plan) {
    throw new Error(`Subscription plan ${tenant.subscription_plan_id} for tenant ${tenantId} was not found.`);
  }

  const effective = plan.get({ plain: true });
  for (const field of OVERRIDE_FIELDS) {
    const planField = field.slice(0, -'_override'.length);
    if (tenant[field] !== null && tenant[field] !== undefined) {
      effective[planField] = planField.startsWith('max_') && Number(tenant[field]) === 0
        ? null
        : tenant[field];
    }
  }
  return effective;
}

module.exports = { getEffectiveTenantPlan, OVERRIDE_FIELDS };

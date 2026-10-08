'use strict';

const { Branch, Tenant, User } = require('../models');
const { getEffectiveTenantPlan } = require('./tenantPlan.service');

class PlanLimitReachedError extends Error {
  constructor(resource, limit, current) {
    super(`Your plan allows up to ${limit} ${resource}. You currently have ${current}.`);
    this.name = 'PlanLimitReachedError';
    this.code = 'PLAN_LIMIT_REACHED';
    this.limit = limit;
    this.current = current;
    this.resource = resource;
  }
}

async function assertTenantCanCreate(tenantId, resource, transaction) {
  const tenant = await Tenant.findByPk(tenantId, {
    transaction,
    lock: transaction ? transaction.LOCK.UPDATE : undefined,
  });

  if (!tenant) {
    throw new Error(`Tenant ${tenantId} was not found while checking plan limits.`);
  }

  if (tenant.subscription_plan_id == null) {
    return;
  }

  const plan = await getEffectiveTenantPlan(tenantId, { transaction });

  const limit = resource === 'users' ? plan.max_users : plan.max_branches;
  if (limit == null) {
    return;
  }

  const Model = resource === 'users' ? User : Branch;
  const current = await Model.count({ where: { tenant_id: tenantId }, transaction });
  if (current >= limit) {
    throw new PlanLimitReachedError(resource, limit, current);
  }
}

module.exports = { assertTenantCanCreate, PlanLimitReachedError };

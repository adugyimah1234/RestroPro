const SubscriptionPlan = require('../models/SubscriptionPlan');
const Tenant = require('../models/Tenant');
const paystack = require('../config/paystack.config');
const { Op } = require('sequelize');

const DEFAULT_PLANS = [
  {
    name: 'Basic',
    plan_code: 'basic',
    price: 30.00,
    amount: 30.00,
    currency: 'GH₵',
    frequency: 'monthly',
    duration_days: 30,
    duration_unit: 'month',
    duration_value: 1,
    max_users: 5,
    max_branches: 1,
    advanced_reporting_enabled: false,
    multi_branch_analytics_enabled: false,
    monthly_ai_queries: 0,
    description: 'Essential tools and accountability for a single-location restaurant.',
    badge: 'Starter',
    features: [
      'Up to 5 Users',
      '1 Branch',
      'Standard POS & Kitchen Display',
      'Daily Accountability & Cash Closeout',
      'Sales and Expense Targets',
      'Email Support'
    ],
    paystack_plan_id: '',
    is_active: true,
  },
  {
    name: 'Premium',
    plan_code: 'premium',
    price: 50.00,
    amount: 50.00,
    currency: 'GH₵',
    frequency: 'monthly',
    duration_days: 30,
    duration_unit: 'month',
    duration_value: 1,
    max_users: 15,
    max_branches: 3,
    advanced_reporting_enabled: false,
    multi_branch_analytics_enabled: false,
    monthly_ai_queries: 0,
    description: 'All-in-one solution for growing restaurant businesses.',
    badge: 'Most Popular',
    features: [
      'Up to 15 Users',
      'Up to 3 Branches',
      'Live Kitchen & Order Display',
      'Inventory & Stock Management',
      'QR Code Digital Menu',
      'Detailed Staff Activity History',
      'Branch-by-Branch Standard Reports',
      'Priority Email & Chat Support'
    ],
    paystack_plan_id: '',
    is_active: true,
  },
  {
    name: 'Advance',
    plan_code: 'advance',
    price: 90.00,
    amount: 90.00,
    currency: 'GH₵',
    frequency: 'monthly',
    duration_days: 30,
    duration_unit: 'month',
    duration_value: 1,
    max_users: 30,
    max_branches: 10,
    advanced_reporting_enabled: true,
    multi_branch_analytics_enabled: true,
    monthly_ai_queries: 100,
    description: 'Advanced intelligence and consolidated analytics for multi-location businesses.',
    badge: 'Best Value',
    features: [
      'Up to 30 Users',
      'Up to 10 Branches',
      'AI Business Reporting (100 questions/month)',
      'Consolidated Multi-Branch Analytics',
      'Full Inventory & Purchase Orders',
      'SuperAdmin & Multi-Branch Management',
      'Custom Domain & Branding',
      '24/7 Dedicated Support'
    ],
    paystack_plan_id: '',
    is_active: true,
  }
];

exports.seedDefaultPlansIfEmpty = async () => {
  try {
    await SubscriptionPlan.sync({ alter: true });
    const count = await SubscriptionPlan.count();
    if (count === 0) {
      for (const p of DEFAULT_PLANS) {
        await SubscriptionPlan.create(p);
      }
      console.log('Successfully seeded 3 default subscription plans (Basic, Premium, Advance)');
    }
  } catch (error) {
    console.error('Error seeding default subscription plans:', error.message);
  }
};

exports.getAllSubscriptionPlans = async () => {
  try {
    await exports.seedDefaultPlansIfEmpty();
    const plans = await SubscriptionPlan.findAll({
      order: [['id', 'ASC']]
    });
    return plans;
  } catch (error) {
    console.error('Error getting all subscription plans:', error);
    throw error;
  }
};

exports.getPublicSubscriptionPlans = async () => {
  try {
    await exports.seedDefaultPlansIfEmpty();
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      order: [['id', 'ASC']]
    });
    return plans;
  } catch (error) {
    console.error('Error getting public subscription plans:', error);
    throw error;
  }
};

exports.getSubscriptionPlanById = async (id) => {
  try {
    const plan = await SubscriptionPlan.findByPk(id);
    return plan;
  } catch (error) {
    console.error('Error getting subscription plan by ID:', error);
    throw error;
  }
};

exports.createSubscriptionPlan = async (data) => {
  try {
    const priceVal = data.price !== undefined ? data.price : (data.amount !== undefined ? data.amount : 0);
    const plan = await SubscriptionPlan.create({
      name: data.name,
      plan_code: data.plan_code || data.name?.toLowerCase() || 'plan',
      price: priceVal,
      amount: priceVal,
      currency: data.currency || 'GH₵',
      frequency: data.frequency || 'monthly',
      duration_days: data.duration_days || 30,
      duration_unit: data.duration_unit || 'month',
      duration_value: data.duration_value || 1,
      max_users: data.max_users ?? null,
      max_branches: data.max_branches ?? null,
      advanced_reporting_enabled: data.advanced_reporting_enabled ?? false,
      multi_branch_analytics_enabled: data.multi_branch_analytics_enabled ?? false,
      monthly_ai_queries: data.monthly_ai_queries ?? 0,
      features: data.features || [],
      paystack_plan_id: data.paystack_plan_id || '',
      description: data.description || '',
      badge: data.badge || '',
      is_active: data.is_active !== undefined ? data.is_active : true,
    });
    return plan;
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw error;
  }
};

exports.updateSubscriptionPlan = async (id, data) => {
  try {
    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      throw new Error('Subscription plan not found.');
    }
    const priceVal = data.price !== undefined ? data.price : (data.amount !== undefined ? data.amount : plan.price);

    plan.name = data.name !== undefined ? data.name : plan.name;
    plan.plan_code = data.plan_code !== undefined ? data.plan_code : plan.plan_code;
    plan.price = priceVal;
    plan.amount = priceVal;
    plan.currency = data.currency !== undefined ? data.currency : plan.currency;
    plan.frequency = data.frequency !== undefined ? data.frequency : plan.frequency;
    plan.duration_days = data.duration_days !== undefined ? data.duration_days : plan.duration_days;
    plan.duration_unit = data.duration_unit !== undefined ? data.duration_unit : plan.duration_unit;
    plan.duration_value = data.duration_value !== undefined ? data.duration_value : plan.duration_value;
    plan.max_users = data.max_users !== undefined ? data.max_users : plan.max_users;
    plan.max_branches = data.max_branches !== undefined ? data.max_branches : plan.max_branches;
    plan.advanced_reporting_enabled = data.advanced_reporting_enabled !== undefined ? data.advanced_reporting_enabled : plan.advanced_reporting_enabled;
    plan.multi_branch_analytics_enabled = data.multi_branch_analytics_enabled !== undefined ? data.multi_branch_analytics_enabled : plan.multi_branch_analytics_enabled;
    plan.monthly_ai_queries = data.monthly_ai_queries !== undefined ? data.monthly_ai_queries : plan.monthly_ai_queries;
    plan.features = data.features !== undefined ? data.features : plan.features;
    plan.paystack_plan_id = data.paystack_plan_id !== undefined ? data.paystack_plan_id : plan.paystack_plan_id;
    plan.description = data.description !== undefined ? data.description : plan.description;
    plan.badge = data.badge !== undefined ? data.badge : plan.badge;
    plan.is_active = data.is_active !== undefined ? data.is_active : plan.is_active;

    await plan.save();
    return plan;
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    throw error;
  }
};

exports.resetToDefaultPlans = async () => {
  try {
    await SubscriptionPlan.sync({ alter: true });
    return await SubscriptionPlan.sequelize.transaction(async (transaction) => {
      const existingPlans = await SubscriptionPlan.findAll({
        transaction,
        lock: transaction.LOCK.UPDATE,
      });
      const retainedPlanIds = [];

      for (const defaultPlan of DEFAULT_PLANS) {
        const matchingPlan = existingPlans.find((plan) =>
          (plan.plan_code || plan.name || '').toLowerCase() === defaultPlan.plan_code
        );
        if (matchingPlan) {
          await matchingPlan.update(defaultPlan, { transaction });
          retainedPlanIds.push(matchingPlan.id);
        } else {
          const createdPlan = await SubscriptionPlan.create(defaultPlan, { transaction });
          retainedPlanIds.push(createdPlan.id);
        }
      }

      const assignedCustomPlans = await Tenant.count({
        where: {
          subscription_plan_id: {
            [Op.notIn]: retainedPlanIds,
          },
        },
        transaction,
      });
      if (assignedCustomPlans > 0) {
        throw new Error('Cannot reset plans while tenants are assigned to custom plans. Reassign those tenants first.');
      }

      await SubscriptionPlan.destroy({
        where: { id: { [Op.notIn]: retainedPlanIds } },
        transaction,
      });
      return SubscriptionPlan.findAll({ order: [['id', 'ASC']], transaction });
    });
  } catch (error) {
    console.error('Error resetting default plans:', error);
    throw error;
  }
};

exports.deleteSubscriptionPlan = async (id) => {
  try {
    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      throw new Error('Subscription plan not found.');
    }
    const assignedTenants = await Tenant.count({ where: { subscription_plan_id: id } });
    if (assignedTenants > 0) {
      throw new Error('Cannot delete a plan assigned to tenants. Assign them to another plan first.');
    }
    await plan.destroy();
    return { message: 'Subscription plan deleted successfully.' };
  } catch (error) {
    console.error('Error deleting subscription plan:', error);
    throw error;
  }
};

exports.initiatePaystackTransaction = async (amount, email, reference, metadata, callback_url) => {
  try {
    const response = await paystack.transaction.initialize({
      amount: Math.round(Number(amount) * 100),
      email,
      reference,
      metadata,
      callback_url,
    });
    return response.data.authorization_url;
  } catch (error) {
    console.error('Error initiating Paystack transaction:', error);
    throw error;
  }
};

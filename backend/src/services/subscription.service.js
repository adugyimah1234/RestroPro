const SubscriptionPlan = require('../models/SubscriptionPlan');
const paystack = require('../config/paystack.config');

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
    description: 'Essential features for single-location starter restaurants.',
    badge: 'Starter',
    features: [
      'Up to 500 orders/mo',
      'Single Branch Access',
      'Standard POS & Kitchen Display',
      'Basic Financial Reports',
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
    description: 'All-in-one solution for growing restaurant businesses.',
    badge: 'Most Popular',
    features: [
      'Unlimited Orders',
      'Up to 3 Branches',
      'Live Kitchen & Order Display',
      'Inventory & Stock Management',
      'QR Code Digital Menu',
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
    description: 'Full enterprise suite with advanced analytics & multi-branch operations.',
    badge: 'Best Value',
    features: [
      'Unlimited Orders & Unlimited Branches',
      'Advanced Analytics & PDF Reports',
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
    await SubscriptionPlan.destroy({ where: {} });
    for (const p of DEFAULT_PLANS) {
      await SubscriptionPlan.create(p);
    }
    return await SubscriptionPlan.findAll({ order: [['id', 'ASC']] });
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

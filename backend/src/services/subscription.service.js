const SubscriptionPlan = require('../models/SubscriptionPlan');
const paystack = require('../config/paystack.config'); // Import Paystack config

exports.createSubscriptionPlan = async (name, amount, currency, duration_unit, duration_value, features, paystack_plan_id) => {
  try {
    const plan = await SubscriptionPlan.create({
      name,
      amount,
      currency,
      duration_unit,
      duration_value,
      features,
      paystack_plan_id,
    });
    return plan;
  } catch (error) {
    console.error('Error creating subscription plan:', error);
    throw error;
  }
};

exports.getAllSubscriptionPlans = async () => {
  try {
    const plans = await SubscriptionPlan.findAll();
    return plans;
  } catch (error) {
    console.error('Error getting all subscription plans:', error);
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

exports.updateSubscriptionPlan = async (id, name, amount, currency, duration_unit, duration_value, features, paystack_plan_id) => {
  try {
    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      throw new Error('Subscription plan not found.');
    }
    plan.name = name;
    plan.amount = amount;
    plan.currency = currency;
    plan.duration_unit = duration_unit;
    plan.duration_value = duration_value;
    plan.features = features;
    plan.paystack_plan_id = paystack_plan_id;
    await plan.save();
    return plan;
  } catch (error) {
    console.error('Error updating subscription plan:', error);
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
      amount: amount * 100, // Paystack expects amount in kobo (cents)
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
const subscriptionService = require('../services/subscription.service');
const { v4: uuidv4 } = require('uuid'); // For generating unique references

exports.createPlan = async (req, res) => {
  try {
    const { name, amount, currency, duration_unit, duration_value, features, paystack_plan_id } = req.body;
    const plan = await subscriptionService.createSubscriptionPlan(name, amount, currency, duration_unit, duration_value, features, paystack_plan_id);
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlans = async (req, res) => {
  try {
    const plans = await subscriptionService.getAllSubscriptionPlans();
    res.status(200).json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await subscriptionService.getSubscriptionPlanById(id);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found.' });
    }
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, amount, currency, duration_unit, duration_value, features, paystack_plan_id } = req.body;
    const plan = await subscriptionService.updateSubscriptionPlan(id, name, amount, currency, duration_unit, duration_value, features, paystack_plan_id);
    res.status(200).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await subscriptionService.deleteSubscriptionPlan(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.initiatePayment = async (req, res) => {
  try {
    const { planId, email, callback_url, tenantId } = req.body;

    if (!planId || !email || !callback_url || !tenantId) {
      return res.status(400).json({ message: 'Missing required fields: planId, email, callback_url, tenantId' });
    }

    const plan = await subscriptionService.getSubscriptionPlanById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found.' });
    }

    const reference = `sub_${uuidv4()}`; // Generate a unique reference
    const metadata = {
      tenant_id: tenantId,
      subscription_plan_id: planId,
      plan_name: plan.name,
    };

    const authorization_url = await subscriptionService.initiatePaystackTransaction(
      plan.amount,
      email,
      reference,
      metadata,
      callback_url
    );

    res.status(200).json({ authorization_url, reference });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
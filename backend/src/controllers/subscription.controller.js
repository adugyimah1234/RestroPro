const subscriptionService = require('../services/subscription.service');

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

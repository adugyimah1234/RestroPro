const crypto = require('crypto');
const TenantSubscription = require('../models/TenantSubscription');
const Tenant = require('../models/Tenant');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const paystack = require('../config/paystack.config'); // Paystack API client

exports.handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ message: 'Webhook signature verification failed.' });
    }

    const event = req.body;

    switch (event.event) {
      case 'charge.success':
        const { reference, metadata, customer, plan } = event.data;
        const { tenant_id, subscription_plan_id } = metadata;
        const paystack_customer_code = customer.customer_code; // Paystack customer code

        // Verify the transaction with Paystack (optional but recommended)
        const transactionVerification = await paystack.transaction.verify(reference);
        if (transactionVerification.data.status !== 'success') {
          console.error('Paystack transaction verification failed for reference:', reference);
          return res.status(400).json({ message: 'Transaction verification failed.' });
        }

        // Calculate subscription dates
        const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan_id);
        if (!subscriptionPlan) {
          console.error('Subscription plan not found for ID:', subscription_plan_id);
          return res.status(404).json({ message: 'Subscription plan not found.' });
        }

        const startDate = new Date();
        let endDate = new Date(startDate);

        if (subscriptionPlan.duration_unit === 'month') {
          endDate.setMonth(startDate.getMonth() + subscriptionPlan.duration_value);
        } else if (subscriptionPlan.duration_unit === 'year') {
          endDate.setFullYear(startDate.getFullYear() + subscriptionPlan.duration_value);
        } else {
          console.error('Unsupported duration unit:', subscriptionPlan.duration_unit);
          return res.status(400).json({ message: 'Unsupported subscription duration unit.' });
        }

        // Find or create TenantSubscription
        let tenantSubscription = await TenantSubscription.findOne({ where: { tenant_id } });

        if (tenantSubscription) {
          // Update existing subscription
          tenantSubscription.subscription_plan_id = subscription_plan_id;
          tenantSubscription.start_date = startDate;
          tenantSubscription.end_date = endDate;
          tenantSubscription.status = 'active';
          tenantSubscription.paystack_subscription_id = plan ? plan.plan_code : null; // Paystack plan code if recurring
          tenantSubscription.paystack_customer_id = paystack_customer_code;
          await tenantSubscription.save();
        } else {
          // Create new subscription
          tenantSubscription = await TenantSubscription.create({
            tenant_id,
            subscription_plan_id,
            start_date: startDate,
            end_date: endDate,
            status: 'active',
            paystack_subscription_id: plan ? plan.plan_code : null,
            paystack_customer_id: paystack_customer_code,
          });
        }

        // Update Tenant's is_active status
        const tenant = await Tenant.findByPk(tenant_id);
        if (tenant) {
          tenant.is_active = true;
          await tenant.save();
        }

        console.log('Subscription activated/updated for tenant:', tenant_id);
        break;

      case 'subscription.create':
      case 'subscription.not_renew':
      case 'subscription.disable':
      case 'subscription.enable':
      case 'invoice.create':
      case 'invoice.update':
      case 'invoice.payment_failed':
        // Handle other relevant Paystack events
        console.log(`Unhandled Paystack event: ${event.event}`, event.data);
        break;

      default:
        console.log(`Unhandled Paystack event: ${event.event}`, event.data);
        break;
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const crypto = require('crypto');
const TenantSubscription = require('../models/TenantSubscription');
const Tenant = require('../models/Tenant');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const paystack = require('../config/paystack.config');

async function activateTenantSubscription(tenantId, reference, customerCode, durationDays = 30) {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const tenant = await Tenant.findByPk(tenantId);
  if (tenant) {
    tenant.is_active = 1;
    tenant.subscription_id = reference;
    tenant.payment_customer_id = customerCode || tenant.payment_customer_id;
    tenant.subscription_start = startDate;
    tenant.subscription_end = endDate;
    await tenant.save();
  }

  try {
    const { updateSubscriptionHistory } = require('../services/auth.service');
    await updateSubscriptionHistory(tenantId, startDate, endDate, 'created');
  } catch (historyErr) {
    console.error('Error recording subscription history:', historyErr);
  }

  return { startDate, endDate };
}

exports.verifyTransaction = async (req, res) => {
  try {
    const { reference } = req.params;
    if (!reference) {
      return res.status(400).json({ success: false, message: 'Missing transaction reference.' });
    }

    const verification = await paystack.transaction.verify(reference);
    if (!verification || !verification.data || verification.data.status !== 'success') {
      return res.status(400).json({ success: false, message: 'Transaction verification failed or unpaid.' });
    }

    const { metadata, customer } = verification.data;
    const tenantId = metadata?.tenant_id;
    const customerCode = customer?.customer_code;

    if (tenantId) {
      await activateTenantSubscription(tenantId, reference, customerCode);
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction verified and subscription activated successfully.',
      data: verification.data
    });
  } catch (error) {
    console.error('Error verifying Paystack transaction:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error verifying transaction.' });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (secret) {
      const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      if (hash !== req.headers['x-paystack-signature']) {
        return res.status(400).json({ message: 'Webhook signature verification failed.' });
      }
    }

    const event = req.body;

    switch (event.event) {
      case 'charge.success': {
        const { reference, metadata, customer, plan } = event.data;
        const tenant_id = metadata?.tenant_id;
        const subscription_plan_id = metadata?.subscription_plan_id;
        const paystack_customer_code = customer?.customer_code;

        if (tenant_id) {
          let durationDays = 30;
          if (subscription_plan_id) {
            const subscriptionPlan = await SubscriptionPlan.findByPk(subscription_plan_id);
            if (subscriptionPlan) {
              if (subscriptionPlan.duration_unit === 'month') {
                durationDays = 30 * subscriptionPlan.duration_value;
              } else if (subscriptionPlan.duration_unit === 'year') {
                durationDays = 365 * subscriptionPlan.duration_value;
              }
            }
          }

          await activateTenantSubscription(tenant_id, reference, paystack_customer_code, durationDays);
          console.log(`Subscription activated via Paystack webhook for tenant ${tenant_id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled Paystack event: ${event.event}`);
        break;
    }

    res.status(200).json({ status: 'success' });
  } catch (error) {
    console.error('Error processing Paystack webhook:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

const express = require('express');
const router = express.Router();
const paystackController = require('../controllers/paystack.controller');

// Webhook route for Paystack
router.post('/paystack/webhook', express.json({type: 'application/json'}), paystackController.handleWebhook);

module.exports = router;

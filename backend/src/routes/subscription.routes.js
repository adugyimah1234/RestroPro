const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { isLoggedIn, isAuthenticated, isSuperAdmin } = require('../middlewares/auth.middleware');

// Public route for fetching active plans (Landing page / Subscription options)
router.get('/public/subscription-plans', subscriptionController.getPublicPlans);

// Routes for Subscription Plans (SuperAdmin)
router.get('/superadmin/subscription-plans', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.getPlans);
router.post('/superadmin/subscription-plans', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.createPlan);
router.post('/superadmin/subscription-plans/reset', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.resetPlans);
router.get('/superadmin/subscription-plans/:id', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.getPlanById);
router.put('/superadmin/subscription-plans/:id', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.updatePlan);
router.delete('/superadmin/subscription-plans/:id', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.deletePlan);

// Route for initiating Paystack payment
router.post('/superadmin/subscription-plans/initiate-payment', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.initiatePayment);

module.exports = router;

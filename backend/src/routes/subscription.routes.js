const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { isLoggedIn, isAuthenticated, isSuperAdmin } = require('../middlewares/auth.middleware'); // Assuming these middlewares exist

// Routes for Subscription Plans
router.post('/superadmin/subscription-plans', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.createPlan);
router.get('/superadmin/subscription-plans', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.getPlans);
router.get('/superadmin/subscription-plans/:id', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.getPlanById);
router.put('/superadmin/subscription-plans/:id', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.updatePlan);
router.delete('/superadmin/subscription-plans/:id', isLoggedIn, isAuthenticated, isSuperAdmin, subscriptionController.deletePlan);

module.exports = router;

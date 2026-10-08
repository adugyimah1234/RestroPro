'use strict';

const { Router } = require('express');
const {
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize,
} = require('../middlewares/auth.middleware');
const { SCOPES } = require('../config/user.config');
const {
  askBusinessQuestion,
  closeShift,
  createExpense,
  getActivity,
  getDashboard,
  listExpenses,
  openShift,
  saveTarget,
} = require('../controllers/accountability.controller');

const router = Router();
const authenticate = [isLoggedIn, isAuthenticated, isSubscriptionActive];
const reportsAccess = [...authenticate, authorize([SCOPES.REPORTS])];
const shiftAccess = [...authenticate, authorize([SCOPES.POS, SCOPES.REPORTS])];

router.get('/dashboard', ...reportsAccess, getDashboard);
router.get('/activity', ...reportsAccess, getActivity);
router.get('/expenses', ...reportsAccess, listExpenses);
router.post('/expenses', ...reportsAccess, createExpense);
router.post('/targets', ...reportsAccess, saveTarget);
router.post('/shifts/open', ...shiftAccess, openShift);
router.post('/shifts/:id/close', ...shiftAccess, closeShift);
router.post('/ai-question', ...reportsAccess, askBusinessQuestion);

module.exports = router;

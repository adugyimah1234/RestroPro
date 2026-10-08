const express = require('express');
const router = express.Router();
const {
  isLoggedIn,
  isAuthenticated,
  authorize,
  isSubscriptionActive,
} = require('../middlewares/auth.middleware');
const { SCOPES } = require('../config/user.config');
const {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch
} = require('../controllers/branch.controller');

router.get('/', 
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  getBranches
);
router.post('/', 
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  createBranch
);
router.put('/:id', 
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  updateBranch
);
router.delete('/:id', 
  isLoggedIn,
  isAuthenticated,
  isSubscriptionActive,
  authorize([SCOPES.SETTINGS]),
  deleteBranch
);

module.exports = router;
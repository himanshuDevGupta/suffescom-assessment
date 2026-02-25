const express = require('express');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const {
  withdrawalValidationRules,
  handleCreateWithdrawal
} = require('../controllers/withdrawalController');

const router = express.Router();

router.post(
  '/',
  auth,
  withdrawalValidationRules,
  validateRequest,
  handleCreateWithdrawal
);

module.exports = router;


const express = require('express');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const {
  depositValidationRules,
  deposit,
  getBalance
} = require('../controllers/walletController');

const router = express.Router();

router.get('/', auth, getBalance);

router.post('/deposit', auth, depositValidationRules, validateRequest, deposit);

module.exports = router;


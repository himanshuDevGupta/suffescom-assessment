const express = require('express');
const validateRequest = require('../middleware/validateRequest');
const {
  registerValidationRules,
  loginValidationRules,
  register,
  login
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidationRules, validateRequest, register);
router.post('/login', loginValidationRules, validateRequest, login);

module.exports = router;


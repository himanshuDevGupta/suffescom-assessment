const { body } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/jwt');
const { MESSAGES } = require('../config/messages');

const registerValidationRules = [
  body('firstName').isString().isLength({ min: 1 }).withMessage('firstName is required'),
  body('lastName').isString().isLength({ min: 1 }).withMessage('lastName is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long')
];

const loginValidationRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isString().notEmpty().withMessage('password is required')
];

async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: hashedPassword,
      isActive: true
    });

    return res.status(201).json({
      message: MESSAGES.AUTH.REGISTRATION_SUCCESS,
      userId: user._id
    });
  } catch (err) {
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .exec();

    if (!user) {
      return res.status(401).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: MESSAGES.AUTH.USER_INACTIVE });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: MESSAGES.AUTH.INVALID_CREDENTIALS });
    }

    const token = signToken({
      sub: user._id.toString(),
      email: user.email
    });

    return res.json({
      
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isActive: user.isActive,
      token,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registerValidationRules,
  loginValidationRules,
  register,
  login
};


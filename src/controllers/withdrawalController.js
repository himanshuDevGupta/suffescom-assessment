const { body } = require('express-validator');
const mongoose = require('mongoose');
const { createWithdrawal } = require('../services/withdrawalService');
const { MESSAGES } = require('../config/messages');

const withdrawalValidationRules = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('amount must be a positive number'),
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('currency must be a 3-letter code'),
  body('destination')
    .isString()
    .isLength({ min: 3, max: 255 })
    .withMessage('destination is required and must be a string')
];

async function handleCreateWithdrawal(req, res, next) {
  try {
    const userId = req.user.id;

    if (!mongoose.isValidObjectId(userId)) {
      const error = new Error(MESSAGES.COMMON.INVALID_AUTHENTICATED_USER);
      error.statusCode = 401;
      throw error;
    }

    const { amount, currency = 'INR', destination } = req.body;
    const idempotencyKey = req.header('Idempotency-Key');

    const withdrawal = await createWithdrawal({
      userId,
      amountDecimal: Number(amount),
      currency,
      destination,
      idempotencyKey
    });

    return res.status(201).json({
      message: MESSAGES.WITHDRAWAL.SUCCESS,
      id: withdrawal._id,
      status: withdrawal.status,
      amountCents: withdrawal.amountCents,
      currency: withdrawal.currency,
      destination: withdrawal.destination,
      createdAt: withdrawal.createdAt
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  withdrawalValidationRules,
  handleCreateWithdrawal
};


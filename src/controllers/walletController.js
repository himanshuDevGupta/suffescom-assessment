const { body } = require('express-validator');
const Wallet = require('../models/Wallet');
const { MESSAGES } = require('../config/messages');
const depositValidationRules = [
  body('amount')
    .isFloat({ gt: 0 })
    .withMessage('amount must be a positive number'),
  body('currency')
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage('currency must be a 3-letter code')
];

async function deposit(req, res, next) {
  try {
    const userId = req.user.id;
    const { amount, currency = 'INR' } = req.body;

    const amountNumber = Number(amount);
    const amountCents = amountNumber;
    if (amountCents <= 0) {
      return res.status(400).json({ message: MESSAGES.WALLET.AMOUNT_MUST_BE_POSITIVE });
    }

    // Atomic increment of balance; safe under concurrency.
    const wallet = await Wallet.findOneAndUpdate(
      { user: userId },
      {
        $inc: { balanceCents: amountCents },
        $setOnInsert: { currency }
      },
      {
        new: true,
        upsert: true
      }
    );

    return res.status(200).json({
      message: MESSAGES.WALLET.DEPOSIT_SUCCESS,
      balanceCents: wallet.balanceCents,
      currency: wallet.currency
    });
  } catch (err) {
    return next(err);
  }
}

async function getBalance(req, res, next) {
  try {
    const userId = req.user.id;
    const wallet = await Wallet.findOne({ user: userId }).exec();

    if (!wallet) {
      return res.status(404).json({ message: MESSAGES.WALLET.WALLET_NOT_FOUND });
    }

    return res.json({
      balanceCents: wallet.balanceCents,
      currency: wallet.currency
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  depositValidationRules,
  deposit,
  getBalance
};


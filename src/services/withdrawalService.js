const Wallet = require('../models/Wallet');
const { Withdrawal, WITHDRAWAL_STATUS } = require('../models/Withdrawal');
const { MESSAGES } = require('../config/messages');

/**
 * Perform a withdrawal in a concurrency-safe way.
 * - Validates amount
 * - Ensures idempotency (optional idempotencyKey)
 * - Status flow: pending -> processing -> success / failed
 * - Uses a conditional atomic wallet update to prevent double spending
 */
function toCents(amount) {
  return Math.round(Number(amount) * 100);
}

async function createWithdrawal({
  userId,
  amountDecimal,
  currency,
  destination,
  idempotencyKey
}) {
  const amountCents = toCents(amountDecimal);
  if (amountCents <= 0) {
    const error = new Error(MESSAGES.WALLET.AMOUNT_MUST_BE_POSITIVE);
    error.statusCode = 400;
    throw error;
  }

  // Idempotency: if an operation with the same key already exists, return it.
  if (idempotencyKey) {
    const existing = await Withdrawal.findOne({ user: userId, idempotencyKey });
    if (existing) {
      return existing;
    }
  }

  // 1) Create withdrawal in pending state (transaction record)
  const withdrawal = await Withdrawal.create({
    user: userId,
    amountCents,
    currency,
    destination,
    status: WITHDRAWAL_STATUS.PENDING,
    idempotencyKey
  });

  // 2) Mark as processing
  await Withdrawal.updateOne(
    { _id: withdrawal._id, status: WITHDRAWAL_STATUS.PENDING },
    { status: WITHDRAWAL_STATUS.PROCESSING }
  );

  // 3) Atomically decrement wallet balance if sufficient funds exist
  const wallet = await Wallet.findOneAndUpdate(
    {
      user: userId,
      balanceCents: { $gte: amountCents }
    },
    {
      $inc: { balanceCents: -amountCents }
    },
    {
      new: true
    }
  );

  // 4) If insufficient balance, mark withdrawal as failed
  if (!wallet) {
    await Withdrawal.updateOne(
      { _id: withdrawal._id },
      {
        status: WITHDRAWAL_STATUS.FAILED,
        failureReason: MESSAGES.WITHDRAWAL.INSUFFICIENT_BALANCE
      }
    );
    const error = new Error(MESSAGES.WITHDRAWAL.INSUFFICIENT_BALANCE);
    error.statusCode = 400;
    throw error;
  }

  // 5) Mark withdrawal as success
  await Withdrawal.updateOne(
    { _id: withdrawal._id },
    { status: WITHDRAWAL_STATUS.SUCCESS }
  );

  // Return the final state of the withdrawal
  const finalWithdrawal = await Withdrawal.findById(withdrawal._id);
  return finalWithdrawal;
}

module.exports = {
  createWithdrawal
};


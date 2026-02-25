const mongoose = require('mongoose');

const WITHDRAWAL_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  FAILED: 'failed'
};

const withdrawalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    amountCents: {
      type: Number,
      required: true,
      min: 1
    },
    currency: {
      type: String,
      required: true,
      default: 'INR'
    },
    destination: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: Object.values(WITHDRAWAL_STATUS),
      default: WITHDRAWAL_STATUS.PENDING,
      index: true
    },
    failureReason: {
      type: String
    },
    idempotencyKey: {
      type: String,
      index: true
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

withdrawalSchema.index(
  { user: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $exists: true, $ne: null } }
  }
);

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = {
  Withdrawal,
  WITHDRAWAL_STATUS
};


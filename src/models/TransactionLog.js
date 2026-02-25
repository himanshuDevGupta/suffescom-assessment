const mongoose = require('mongoose');

const TRANSACTION_TYPE = {
  DEBIT: 'debit',
  CREDIT: 'credit'
};

const TRANSACTION_CONTEXT = {
  WITHDRAWAL: 'withdrawal',
  DEPOSIT: 'deposit'
};

const transactionLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: true
    },
    context: {
      type: String,
      enum: Object.values(TRANSACTION_CONTEXT),
      required: true
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    amountCents: {
      type: Number,
      required: true,
      min: 1
    },
    beforeBalanceCents: {
      type: Number,
      required: true,
      min: 0
    },
    afterBalanceCents: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      required: true,
      default: 'committed'
    },
    metadata: {
      type: Object
    }
  },
  {
    timestamps: true
  }
);

// Immutable / insert-only logs: prevent updates and deletes at the model level.
transactionLogSchema.pre('updateOne', function next() {
  next(new Error('TransactionLog documents are immutable and cannot be updated'));
});

transactionLogSchema.pre('findOneAndUpdate', function next() {
  next(new Error('TransactionLog documents are immutable and cannot be updated'));
});

transactionLogSchema.pre('deleteOne', function next() {
  next(new Error('TransactionLog documents are immutable and cannot be deleted'));
});

const TransactionLog = mongoose.model('TransactionLog', transactionLogSchema);

module.exports = {
  TransactionLog,
  TRANSACTION_TYPE,
  TRANSACTION_CONTEXT
};


const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    balanceCents: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      required: true,
      default: 'INR'
    }
  },
  {
    timestamps: true
  }
);

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;


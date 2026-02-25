const MESSAGES = {
  AUTH: {
    EMAIL_ALREADY_REGISTERED: 'Email is already registered',
    REGISTRATION_SUCCESS: 'Registration Successful',
    INVALID_CREDENTIALS: 'Invalid credentials',
    USER_INACTIVE: 'User account is inactive',
    UNAUTHORIZED: 'Unauthorized'
  },
  WALLET: {
    AMOUNT_MUST_BE_POSITIVE: 'Amount must be greater than zero',
    DEPOSIT_SUCCESS: 'Deposit successful',
    WALLET_NOT_FOUND: 'Wallet not found'
  },
  WITHDRAWAL: {
    INSUFFICIENT_BALANCE: 'Insufficient balance or wallet not found',
    SUCCESS: 'Withdrawal successful'
  },
  COMMON: {
    INTERNAL_SERVER_ERROR: 'Internal server error',
    VALIDATION_FAILED: 'Validation failed',
    INVALID_AUTHENTICATED_USER: 'Invalid authenticated user',
    MONGO_URI_REQUIRED: 'MONGO_URI is required to connect to MongoDB',
    DB_CONNECTION_FAILED: 'Failed to connect to the database'
  }
};

module.exports = {
  MESSAGES
};


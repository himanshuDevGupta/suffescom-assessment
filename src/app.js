const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const errorHandler = require('./middleware/errorHandler');
const authRouter = require('./routes/auth');
const withdrawalsRouter = require('./routes/withdrawals');
const walletsRouter = require('./routes/wallets');

const app = express();

app.use(express.json());
// Security and CORS
app.use(helmet());
app.use(cors());

// Rate limiting (in-memory)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});

// Stricter limiter for withdrawal endpoints (per-user when authenticated)
const withdrawalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit to 10 withdrawal requests per minute per user/IP
  keyGenerator: (req) => (req.user && req.user.id) || ipKeyGenerator(req),
  standardHeaders: true,
  legacyHeaders: false
});

app.use(generalLimiter);

app.use(
  morgan('combined', {
    skip: () => process.env.NODE_ENV === 'test'
  })
);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Auth routes
app.use('/auth', authRouter);

// Withdrawal routes (apply stricter rate limit)
app.use('/withdrawals', withdrawalLimiter, withdrawalsRouter);

// Wallet routes
app.use('/wallets', walletsRouter);

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;


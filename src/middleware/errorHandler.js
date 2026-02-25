const { MESSAGES } = require('../config/messages');

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || 500;
  const message = status === 500 ? MESSAGES.COMMON.INTERNAL_SERVER_ERROR : err.message;

  return res.status(status).json({ message });
}

module.exports = errorHandler;


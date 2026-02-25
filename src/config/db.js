const mongoose = require('mongoose');
const { MESSAGES } = require('./messages');

async function connectDB(mongoUri) {
  if (!mongoUri) {
    const err = new Error(MESSAGES.COMMON.MONGO_URI_REQUIRED);
    err.statusCode = 500;
    throw err;
  }

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true,
      maxPoolSize: 20
    });
    return mongoose;
  } catch (error) {
    const err = new Error(MESSAGES.COMMON.DB_CONNECTION_FAILED);
    err.cause = error;
    err.statusCode = 500;
    throw err;
  }
}

module.exports = {
  connectDB
};


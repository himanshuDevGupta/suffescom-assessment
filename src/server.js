require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/withdrawals_db';

async function start() {
  try {
    await connectDB(MONGO_URI);

    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server listening on port : ${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();


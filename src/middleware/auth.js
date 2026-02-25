const mongoose = require('mongoose');
const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const { MESSAGES } = require('../config/messages');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.header('Authorization');
    let userId = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const decoded = verifyToken(token);
      userId = decoded.sub;
    } else {
      // Fallback for existing clients using x-user-id header.
      userId = req.header('x-user-id');
    }

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: MESSAGES.AUTH.UNAUTHORIZED });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(401).json({ message: MESSAGES.AUTH.UNAUTHORIZED });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: MESSAGES.AUTH.USER_INACTIVE });
    }

    req.user = { id: user._id.toString(), email: user.email };
    return next();
  } catch (err) {
    return res.status(401).json({ message: MESSAGES.AUTH.UNAUTHORIZED });
  }
}

module.exports = authMiddleware;


const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ── protect ───────────────────────────────────────────────────────────────────
// Blocks the request with 401 if no valid token is present.
// Written as plain async function — no asyncHandler wrapper needed because
// Express 5 natively handles rejected async middleware promises.
const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};

// ── optionalProtect ───────────────────────────────────────────────────────────
// Attaches req.user if a valid token is present, but NEVER blocks.
// Used on public routes (GET /books, GET /books/:id) so logged-in users get
// personalised data (isLiked, isCommentLiked) while guests still see content.
const optionalProtect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch {
    // Invalid / expired token → treat as unauthenticated, never block
    req.user = null;
  }

  next(); // always continue
};

module.exports = { protect, optionalProtect };
const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// Public routes — no middleware, functions passed by reference (not called)
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// Private route — requires valid JWT
router.get('/me', protect, getMe);

module.exports = router;
const express = require('express');
const router = express.Router();

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

// ── Public routes ─────────────────────────────────────────────────────────────
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:token', resetPassword);

// ── Private routes ────────────────────────────────────────────────────────────
router.get('/me', protect, getMe);

// Profile update: sends JSON { username, profilePic (base64) }
// No multer — image is stored as base64 in MongoDB, not on disk
router.put('/profile', protect, updateProfile);

module.exports = router;
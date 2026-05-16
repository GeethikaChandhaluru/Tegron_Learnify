const express = require('express');
const router = express.Router();

const {
  getAllBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  likeBook,
  addComment,
  toggleWishlist,
  getWishlist,
  uploadFields,
} = require('../controllers/bookController');

const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// IMPORTANT:
// wishlist route must come BEFORE /:id route
// otherwise Express treats "wishlist" as :id

// User feature routes

// GET wishlist
router.get('/wishlist/my', protect, getWishlist);

// Public routes
router.get('/', getAllBooks);
router.get('/:id', getBook);

// LIKE
router.post('/:id/like', protect, likeBook);

// COMMENT
router.post('/:id/comment', protect, addComment);

// WISHLIST toggle
router.post('/:id/wishlist', protect, toggleWishlist);

// Admin routes
router.post(
  '/',
  protect,
  adminOnly,
  uploadFields,
  addBook
);

router.put(
  '/:id',
  protect,
  adminOnly,
  uploadFields,
  updateBook
);

router.delete(
  '/:id',
  protect,
  adminOnly,
  deleteBook
);

module.exports = router;
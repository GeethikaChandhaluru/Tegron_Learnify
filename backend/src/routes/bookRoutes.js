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
  deleteComment,
  likeComment,
  addReply,
  deleteReply,
  likeReply,
  uploadFields,
} = require('../controllers/bookController');

const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// ── Public (optional auth so isLiked / isCommentLiked / isReplyLiked work) ──
router.get('/', optionalProtect, getAllBooks);
router.get('/:id', optionalProtect, getBook);

// ── Book Like ────────────────────────────────────────────────────────────────
router.post('/:id/like', protect, likeBook);

// ── Comments ─────────────────────────────────────────────────────────────────
router.post('/:id/comment', protect, addComment);
router.delete('/:id/comment/:commentId', protect, deleteComment);

// ── Comment Like ─────────────────────────────────────────────────────────────
router.post('/:id/comment/:commentId/like', protect, likeComment);

// ── Replies ──────────────────────────────────────────────────────────────────
// addReply accepts optional body.parentReplyId for nested replies
router.post('/:id/comment/:commentId/reply', protect, addReply);
router.delete('/:id/comment/:commentId/reply/:replyId', protect, deleteReply);

// ── Reply Like ───────────────────────────────────────────────────────────────
router.post('/:id/comment/:commentId/reply/:replyId/like', protect, likeReply);

// ── Admin ────────────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, uploadFields, addBook);
router.put('/:id', protect, adminOnly, uploadFields, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
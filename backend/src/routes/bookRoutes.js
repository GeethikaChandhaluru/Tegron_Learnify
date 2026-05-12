const express = require('express');
const router = express.Router();
const {
  getAllBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  uploadFields,
} = require('../controllers/bookController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getAllBooks);
router.get('/:id', getBook);
router.post('/', protect, adminOnly, uploadFields, addBook);
router.put('/:id', protect, adminOnly, uploadFields, updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;

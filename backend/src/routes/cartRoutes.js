const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getCart);
router.post('/:bookId', addToCart);
router.delete('/clear', clearCart);
router.delete('/:bookId', removeFromCart);

module.exports = router;

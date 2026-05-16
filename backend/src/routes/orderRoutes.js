const express = require('express');
const router = express.Router();
const {
  buyNow,
  checkoutCart,
  getMyOrders,
  getPurchasedBooks,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/buy-now/:bookId', buyNow);
router.post('/checkout', checkoutCart);
router.get('/', getMyOrders);
router.get('/purchased', getPurchasedBooks);

module.exports = router;

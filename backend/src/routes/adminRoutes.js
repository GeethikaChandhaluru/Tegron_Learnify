const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getAllOrders,
  getPurchaseHistory,
  getDashboardStats,
  getPaymentAnalytics,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.use(protect, adminOnly);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/orders', getAllOrders);
router.get('/purchased', getPurchaseHistory);

router.get('/payments', getPaymentAnalytics);

module.exports = router;
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const PurchasedBook = require('../models/PurchasedBook');
const Book = require('../models/Book');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate('user', 'username email')
    .populate('books.book', 'title price')
    .sort({ createdAt: -1 });

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({ success: true, count: orders.length, totalRevenue, data: orders });
});

// @desc    Get purchase history
// @route   GET /api/admin/purchased
// @access  Admin
const getPurchaseHistory = asyncHandler(async (req, res) => {
  const history = await PurchasedBook.find()
    .populate('user', 'username email')
    .populate('book', 'title price')
    .sort({ purchasedAt: -1 });

  res.json({ success: true, count: history.length, data: history });
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalBooks, totalOrders, revenue] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Book.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: '$totalAmount' } } }]),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalBooks,
      totalOrders,
      totalRevenue: revenue[0]?.total || 0,
    },
  });
});



// @desc    Get payment analytics (units sold + revenue per book)
// @route   GET /api/admin/payments
// @access  Admin
const getPaymentAnalytics = asyncHandler(async (req, res) => {
  const analytics = await PurchasedBook.aggregate([
    {
      $group: {
        _id: '$book',
        unitsSold: { $sum: 1 },
        amountCollected: { $sum: '$pricePaid' },
      },
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookDetails',
      },
    },
    { $unwind: '$bookDetails' },
    {
      $project: {
        _id: 1,
        title: '$bookDetails.title',
        price: '$bookDetails.price',
        unitsSold: 1,
        amountCollected: 1,
      },
    },
    { $sort: { amountCollected: -1 } },
  ]);

  const totalRevenue = analytics.reduce((sum, b) => sum + b.amountCollected, 0);

  res.json({ success: true, totalRevenue, data: analytics });
});

module.exports = { getAllUsers, getAllOrders, getPurchaseHistory, getDashboardStats, getPaymentAnalytics };
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const PurchasedBook = require('../models/PurchasedBook');

// Helper: create purchased book records
const createPurchasedBooks = async (userId, books, orderId) => {
  const ops = books.map(({ book, price }) => ({
    updateOne: {
      filter: { user: userId, book: book._id || book },
      update: { $setOnInsert: { user: userId, book: book._id || book, order: orderId, pricePaid: price } },
      upsert: true,
    },
  }));
  if (ops.length) await PurchasedBook.bulkWrite(ops);
};

// @desc    Buy Now (single book)
// @route   POST /api/orders/buy-now/:bookId
// @access  Private
const buyNow = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check if already purchased
  const alreadyPurchased = await PurchasedBook.findOne({
    user: req.user._id,
    book: book._id,
  });
  if (alreadyPurchased) {
    res.status(400);
    throw new Error('You have already purchased this book');
  }

  const order = await Order.create({
    user: req.user._id,
    books: [{ book: book._id, price: book.price }],
    totalAmount: book.price,
    status: 'completed',
  });

  await createPurchasedBooks(req.user._id, [{ book: book._id, price: book.price }], order._id);

  res.status(201).json({
    success: true,
    message: 'Purchase successful!',
    data: order,
  });
});

// @desc    Checkout cart
// @route   POST /api/orders/checkout
// @access  Private
const checkoutCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Filter out already-purchased books
  const existingPurchases = await PurchasedBook.find({
    user: req.user._id,
    book: { $in: cart.items.map((i) => i.book._id) },
  });
  const purchasedIds = existingPurchases.map((p) => p.book.toString());

  const newItems = cart.items.filter(
    (item) => !purchasedIds.includes(item.book._id.toString())
  );

  if (newItems.length === 0) {
    res.status(400);
    throw new Error('All books in cart are already purchased');
  }

  const orderBooks = newItems.map((item) => ({
    book: item.book._id,
    price: item.book.price,
  }));

  const totalAmount = orderBooks.reduce((sum, item) => sum + item.price, 0);

  const order = await Order.create({
    user: req.user._id,
    books: orderBooks,
    totalAmount,
    status: 'completed',
  });

  await createPurchasedBooks(req.user._id, orderBooks, order._id);

  // Clear cart
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Checkout successful!',
    data: order,
  });
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('books.book', 'title thumbnail author price')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Get purchased books
// @route   GET /api/orders/purchased
// @access  Private
const getPurchasedBooks = asyncHandler(async (req, res) => {
  const purchased = await PurchasedBook.find({ user: req.user._id })
    .populate('book', 'title description thumbnail author category pdfFile bookUrl price')
    .sort({ purchasedAt: -1 });

  const totalSpent = purchased.reduce((sum, p) => sum + p.pricePaid, 0);

  res.json({
    success: true,
    count: purchased.length,
    totalSpent,
    data: purchased,
  });
});

module.exports = { buyNow, checkoutCart, getMyOrders, getPurchasedBooks };

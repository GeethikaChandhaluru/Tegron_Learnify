const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');
const PurchasedBook = require('../models/PurchasedBook');
const User = require('../models/User');

// Helper: create purchased book records
const createPurchasedBooks = async (userId, books, orderId) => {
  const ops = books.map(({ book, price }) => ({
    updateOne: {
      filter: { user: userId, book: book._id || book },
      update: {
        $setOnInsert: {
          user: userId,
          book: book._id || book,
          order: orderId,
          pricePaid: price,
        },
      },
      upsert: true,
    },
  }));
  if (ops.length) await PurchasedBook.bulkWrite(ops);
};

// Helper: get io instance from req.app
const getIO = (req) => req.app.get('io');

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

  // ── Wallet: check balance ─────────────────────────────
  const buyer = await User.findById(req.user._id);
  if (buyer.balance < book.price) {
    res.status(402);
    throw new Error('Insufficient balance. Please top up your wallet.');
  }

  // ── Deduct balance ────────────────────────────────────
  buyer.balance = parseFloat((buyer.balance - book.price).toFixed(2));
  await buyer.save({ validateBeforeSave: false });

  const order = await Order.create({
    user: req.user._id,
    books: [{ book: book._id, price: book.price }],
    totalAmount: book.price,
    status: 'completed',
  });

  await createPurchasedBooks(
    req.user._id,
    [{ book: book._id, price: book.price }],
    order._id
  );

  const io = getIO(req);
  if (io) {
    // ── Notify the purchasing user's private room ─────────
    io.to(`user:${buyer._id}`).emit('balanceUpdated', {
      newBalance: buyer.balance,
      reason: 'purchase',
      bookTitle: book.title,
      amount: book.price,
    });

    // ── Broadcast new order to admin room ─────────────────
    io.to('room:admin').emit('newOrder', {
      orderId: order._id,
      user: { _id: buyer._id, username: buyer.username, email: buyer.email },
      book: { _id: book._id, title: book.title, price: book.price },
      totalAmount: book.price,
      createdAt: order.createdAt,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Purchase successful!',
    data: order,
    newBalance: buyer.balance,
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

  // ── Wallet: check balance ─────────────────────────────
  const buyer = await User.findById(req.user._id);
  if (buyer.balance < totalAmount) {
    res.status(402);
    throw new Error(`Insufficient balance. You need ₹${totalAmount} but have ₹${buyer.balance.toFixed(2)}.`);
  }

  // ── Deduct balance ────────────────────────────────────
  buyer.balance = parseFloat((buyer.balance - totalAmount).toFixed(2));
  await buyer.save({ validateBeforeSave: false });

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

  const io = getIO(req);
  if (io) {
    // ── Notify the purchasing user's private room ─────────
    io.to(`user:${buyer._id}`).emit('balanceUpdated', {
      newBalance: buyer.balance,
      reason: 'purchase',
      booksCount: orderBooks.length,
      amount: totalAmount,
    });

    // ── Broadcast new order to admin room ─────────────────
    io.to('room:admin').emit('newOrder', {
      orderId: order._id,
      user: { _id: buyer._id, username: buyer.username, email: buyer.email },
      booksCount: orderBooks.length,
      totalAmount,
      createdAt: order.createdAt,
    });
  }

  res.status(201).json({
    success: true,
    message: 'Checkout successful!',
    data: order,
    newBalance: buyer.balance,
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

// @desc    Get current wallet balance
// @route   GET /api/orders/wallet
// @access  Private
const getWalletBalance = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('balance');
  res.json({ success: true, balance: user.balance });
});

module.exports = { buyNow, checkoutCart, getMyOrders, getPurchasedBooks, getWalletBalance };
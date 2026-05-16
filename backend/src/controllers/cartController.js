const asyncHandler = require('express-async-handler');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.book',
    'title description price thumbnail author'
  );

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.json({ success: true, data: cart });
});

// @desc    Add item to cart
// @route   POST /api/cart/:bookId
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Check if already in cart
  const alreadyIn = cart.items.some(
    (item) => item.book.toString() === req.params.bookId
  );

  if (alreadyIn) {
    res.status(400);
    throw new Error('Book already in cart');
  }

  cart.items.push({ book: req.params.bookId });
  await cart.save();

  await cart.populate('items.book', 'title description price thumbnail author');

  res.json({ success: true, message: 'Book added to cart', data: cart });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:bookId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  cart.items = cart.items.filter(
    (item) => item.book.toString() !== req.params.bookId
  );

  await cart.save();
  await cart.populate('items.book', 'title description price thumbnail author');

  res.json({ success: true, message: 'Book removed from cart', data: cart });
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  res.json({ success: true, message: 'Cart cleared' });
});

module.exports = { getCart, addToCart, removeFromCart, clearCart };

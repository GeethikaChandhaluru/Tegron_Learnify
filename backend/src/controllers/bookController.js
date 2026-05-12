const asyncHandler = require('express-async-handler');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Book = require('../models/Book');
const PurchasedBook = require('../models/PurchasedBook');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder =
      file.fieldname === 'pdfFile'
        ? 'uploads/pdfs'
        : 'uploads/thumbnails';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdfFile') {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files allowed'), false);
  } else {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });
const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

// @desc    Get all books
// @route   GET /api/books
// @access  Public
const getAllBooks = asyncHandler(async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json({ success: true, count: books.length, data: books });
});

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }
  res.json({ success: true, data: book });
});

// @desc    Add new book (Admin)
// @route   POST /api/books
// @access  Admin
const addBook = asyncHandler(async (req, res) => {
  const { title, description, price, author, category, bookUrl } = req.body;

  if (!title || !description || !price) {
    res.status(400);
    throw new Error('Please fill all required fields (title, description, price)');
  }

  const thumbnail = req.files?.thumbnail
    ? `/${req.files.thumbnail[0].path}`
    : '';
  const pdfFile = req.files?.pdfFile ? `/${req.files.pdfFile[0].path}` : '';

  // Must have either a PDF file or a URL
  if (!pdfFile && !bookUrl) {
    res.status(400);
    throw new Error('Please provide either a PDF file or an external URL');
  }

  const book = await Book.create({
    title,
    description,
    price: Number(price),
    author: req.body.author || '-',
    category: req.body.category || 'General',
    bookUrl,
    thumbnail,
    pdfFile,
    addedBy: req.user._id,
  });

  res.status(201).json({ success: true, data: book });
});

// @desc    Update book (Admin)
// @route   PUT /api/books/:id
// @access  Admin
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const { title, description, price, author, category, bookUrl } = req.body;

  const thumbnail = req.files?.thumbnail
    ? `/${req.files.thumbnail[0].path}`
    : book.thumbnail;
  const pdfFile = req.files?.pdfFile
    ? `/${req.files.pdfFile[0].path}`
    : book.pdfFile;

  const updated = await Book.findByIdAndUpdate(
    req.params.id,
    {
      title: title || book.title,
      description: description || book.description,
      price: price ? Number(price) : book.price,
      author: author || book.author,
      category: category || book.category,
      bookUrl: bookUrl || book.bookUrl,
      thumbnail,
      pdfFile,
    },
    { new: true, runValidators: true }
  );

  res.json({ success: true, data: updated });
});

// @desc    Delete book (Admin)
// @route   DELETE /api/books/:id
// @access  Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  await book.deleteOne();
  res.json({ success: true, message: 'Book deleted successfully' });
});

module.exports = {
  getAllBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  uploadFields,
};

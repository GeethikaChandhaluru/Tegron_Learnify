const asyncHandler = require('express-async-handler');
const multer = require('multer');
const fs = require('fs');

const Book = require('../models/Book');
const User = require('../models/User');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder =
      file.fieldname === 'pdfFile'
        ? 'uploads/pdfs'
        : 'uploads/thumbnails';

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: (req, file, cb) => {
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdfFile') {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files allowed'), false);
    }
  } else {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
});

const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

// helper function
const addBookStatuses = (books, wishlist, userId) => {
  return books.map((book) => ({
    ...book._doc,

    isWishlisted: wishlist.some(
      (id) => id.toString() === book._id.toString()
    ),

    isLiked: book.likedBy.some(
      (id) => id.toString() === userId.toString()
    ),
  }));
};

// GET all books
const getAllBooks = asyncHandler(async (req, res) => {
  const books = await Book.find().sort({
    createdAt: -1,
  });

  let finalBooks = books;

  if (req.user) {
    const user = await User.findById(req.user._id);

    finalBooks = addBookStatuses(
      books,
      user.wishlist,
      req.user._id
    );
  }

  res.json({
    success: true,
    count: finalBooks.length,
    data: finalBooks,
  });
});

// GET single book
const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  let finalBook = book.toObject();

  if (req.user) {
    const user = await User.findById(req.user._id);

    finalBook.isWishlisted = user.wishlist.some(
      (id) => id.toString() === book._id.toString()
    );

    finalBook.isLiked = book.likedBy.some(
      (id) => id.toString() === req.user._id.toString()
    );
  } else {
    finalBook.isWishlisted = false;
    finalBook.isLiked = false;
  }

  res.json({
    success: true,
    data: finalBook,
  });
});

// ADD book
const addBook = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    author,
    category,
    bookUrl,
  } = req.body;

  if (!title || !description || !price) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const thumbnail = req.files?.thumbnail
    ? `/${req.files.thumbnail[0].path}`
    : '';

  const pdfFile = req.files?.pdfFile
    ? `/${req.files.pdfFile[0].path}`
    : '';

  if (!pdfFile && !bookUrl) {
    res.status(400);
    throw new Error(
      'Please provide PDF file or external URL'
    );
  }

  const book = await Book.create({
    title,
    description,
    price: Number(price),
    author: author || '-',
    category: category || 'General',
    thumbnail,
    pdfFile,
    bookUrl,
    addedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    data: book,
  });
});

// UPDATE book
const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const thumbnail = req.files?.thumbnail
    ? `/${req.files.thumbnail[0].path}`
    : book.thumbnail;

  const pdfFile = req.files?.pdfFile
    ? `/${req.files.pdfFile[0].path}`
    : book.pdfFile;

  const updated = await Book.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title || book.title,
      description:
        req.body.description || book.description,
      price: req.body.price
        ? Number(req.body.price)
        : book.price,
      author: req.body.author || book.author,
      category: req.body.category || book.category,
      bookUrl: req.body.bookUrl || book.bookUrl,
      thumbnail,
      pdfFile,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    success: true,
    data: updated,
  });
});

// DELETE book
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  await book.deleteOne();

  res.json({
    success: true,
    message: 'Book deleted successfully',
  });
});

// TOGGLE LIKE
const likeBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const userId = req.user._id;

  const alreadyLiked = book.likedBy.some(
    (id) => id.toString() === userId.toString()
  );

  if (alreadyLiked) {
    book.likedBy = book.likedBy.filter(
      (id) => id.toString() !== userId.toString()
    );

    book.likes = Math.max(0, book.likes - 1);
  } else {
    book.likedBy.push(userId);
    book.likes += 1;
  }

  await book.save();

  res.json({
    success: true,
    likes: book.likes,
    isLiked: !alreadyLiked,
    message: alreadyLiked
      ? 'Like removed'
      : 'Liked successfully',
  });
});

// COMMENT
const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    res.status(400);
    throw new Error('Comment text is required');
  }

  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  book.comments.push({
    user: req.user._id,
    username: req.user.username,
    text,
  });

  await book.save();

  res.json({
    success: true,
    comments: book.comments,
  });
});

// TOGGLE wishlist
const toggleWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const bookId = req.params.id;

  const alreadyExists = user.wishlist.some(
    (id) => id.toString() === bookId.toString()
  );

  if (alreadyExists) {
    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== bookId.toString()
    );
  } else {
    user.wishlist.push(bookId);
  }

  await user.save();

  res.json({
    success: true,
    isWishlisted: !alreadyExists,
    message: alreadyExists
      ? 'Removed from wishlist'
      : 'Added to wishlist',
  });
});

// GET wishlist
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.user._id
  ).populate('wishlist');

  res.json({
    success: true,
    data: user.wishlist,
  });
});

module.exports = {
  getAllBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  likeBook,
  addComment,
  toggleWishlist,
  getWishlist,
  uploadFields,
};
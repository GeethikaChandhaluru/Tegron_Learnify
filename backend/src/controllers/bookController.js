const asyncHandler = require('express-async-handler');
const multer = require('multer');
const fs = require('fs');
const Book = require('../models/Book');

// ─── Multer ───────────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder =
      file.fieldname === 'pdfFile' ? 'uploads/pdfs' : 'uploads/thumbnails';
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdfFile') {
    file.mimetype === 'application/pdf'
      ? cb(null, true)
      : cb(new Error('Only PDF files allowed'), false);
  } else {
    file.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('Only image files allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });
const uploadFields = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'pdfFile', maxCount: 1 },
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Null-safe toString for ObjectIds and plain strings */
const safeStr = (val) => (val ? val.toString() : '');

const addBookStatuses = (books, userId) =>
  books.map((book) => ({
    ...book._doc,
    isLiked: book.likedBy.some((id) => safeStr(id) === safeStr(userId)),
  }));

// ─── BOOK CRUD ────────────────────────────────────────────────────────────────

const getAllBooks = asyncHandler(async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  const finalBooks = req.user
    ? addBookStatuses(books, req.user._id)
    : books.map((b) => b.toObject());
  res.json({ success: true, count: finalBooks.length, data: finalBooks });
});

const getBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const finalBook = book.toObject();

  if (req.user) {
    const uid = safeStr(req.user._id);
    finalBook.isLiked = book.likedBy.some((id) => safeStr(id) === uid);

    // Attach per-comment + per-reply like status for the logged-in user
    finalBook.comments = finalBook.comments.map((c) => ({
      ...c,
      isCommentLiked: (c.commentLikes || []).some(
        (id) => safeStr(id) === uid
      ),
      replies: (c.replies || []).map((r) => ({
        ...r,
        isReplyLiked: (r.replyLikes || []).some(
          (id) => safeStr(id) === uid
        ),
      })),
    }));
  } else {
    finalBook.isLiked = false;
  }

  res.json({ success: true, data: finalBook });
});

const addBook = asyncHandler(async (req, res) => {
  const { title, description, price, author, category, bookUrl } = req.body;
  if (!title || !description || !price) {
    res.status(400); throw new Error('Please fill all required fields');
  }
  const thumbnail = req.files?.thumbnail ? `/${req.files.thumbnail[0].path}` : '';
  const pdfFile = req.files?.pdfFile ? `/${req.files.pdfFile[0].path}` : '';
  if (!pdfFile && !bookUrl) {
    res.status(400); throw new Error('Please provide PDF file or external URL');
  }
  const book = await Book.create({
    title, description, price: Number(price),
    author: author || '-', category: category || 'General',
    thumbnail, pdfFile, bookUrl, addedBy: req.user._id,
  });
  res.status(201).json({ success: true, data: book });
});

const updateBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const thumbnail = req.files?.thumbnail ? `/${req.files.thumbnail[0].path}` : book.thumbnail;
  const pdfFile = req.files?.pdfFile ? `/${req.files.pdfFile[0].path}` : book.pdfFile;

  const updated = await Book.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title || book.title,
      description: req.body.description || book.description,
      price: req.body.price ? Number(req.body.price) : book.price,
      author: req.body.author || book.author,
      category: req.body.category || book.category,
      bookUrl: req.body.bookUrl || book.bookUrl,
      thumbnail, pdfFile,
    },
    { new: true, runValidators: true }
  );
  res.json({ success: true, data: updated });
});

const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }
  await book.deleteOne();
  res.json({ success: true, message: 'Book deleted successfully' });
});

// ─── BOOK LIKE ────────────────────────────────────────────────────────────────

const likeBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const uid = safeStr(req.user._id);
  const alreadyLiked = book.likedBy.some((id) => safeStr(id) === uid);

  if (alreadyLiked) {
    book.likedBy = book.likedBy.filter((id) => safeStr(id) !== uid);
    book.likes = Math.max(0, book.likes - 1);
  } else {
    book.likedBy.push(req.user._id);
    book.likes += 1;
  }

  await book.save();
  res.json({
    success: true,
    likes: book.likes,
    isLiked: !alreadyLiked,
    message: alreadyLiked ? 'Like removed' : 'Liked successfully',
  });
});

// ─── COMMENTS ─────────────────────────────────────────────────────────────────

const addComment = asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    res.status(400); throw new Error('Comment text is required');
  }

  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  // ✅ Set isAdmin=true when the commenter is an admin
  book.comments.push({
    user: req.user._id,
    username: req.user.username,
    text: text.trim(),
    replies: [],
    commentLikes: [],
    isAdmin: req.user.role === 'admin',
  });

  await book.save();
  res.json({ success: true, comments: book.comments });
});

const deleteComment = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const comment = book.comments.id(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  const uid = safeStr(req.user._id);
  const commentOwner = safeStr(comment.user);
  const isOwner = !commentOwner || commentOwner === uid;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403); throw new Error('Not authorized to delete this comment');
  }

  book.comments.pull({ _id: req.params.commentId });
  await book.save();
  res.json({ success: true, comments: book.comments });
});

// ─── COMMENT LIKES ────────────────────────────────────────────────────────────

const likeComment = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const comment = book.comments.id(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  const uid = safeStr(req.user._id);
  if (!comment.commentLikes) comment.commentLikes = [];

  const alreadyLiked = comment.commentLikes.some((id) => safeStr(id) === uid);

  if (alreadyLiked) {
    comment.commentLikes = comment.commentLikes.filter((id) => safeStr(id) !== uid);
  } else {
    comment.commentLikes.push(req.user._id);
  }

  await book.save();
  res.json({
    success: true,
    commentId: comment._id,
    likes: comment.commentLikes.length,
    isCommentLiked: !alreadyLiked,
    comments: book.comments,
  });
});

// ─── REPLIES ──────────────────────────────────────────────────────────────────

/**
 * Add a reply to a comment.
 * Body: { text, parentReplyId? }
 *   parentReplyId = null/omitted → direct reply to comment
 *   parentReplyId = <id>          → nested reply (reply to another reply)
 * All replies are stored flat in comment.replies; the frontend builds the tree.
 */
const addReply = asyncHandler(async (req, res) => {
  const { text, parentReplyId } = req.body;
  if (!text || !text.trim()) {
    res.status(400); throw new Error('Reply text is required');
  }

  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const comment = book.comments.id(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  if (!Array.isArray(comment.replies)) comment.replies = [];

  // If this is a nested reply, verify the parent reply actually exists
  if (parentReplyId) {
    const parentReply = comment.replies.id(parentReplyId);
    if (!parentReply) {
      res.status(404); throw new Error('Parent reply not found');
    }
  }

  // ✅ Set isAdmin=true when the replier is an admin
  comment.replies.push({
    user: req.user._id,
    username: req.user.username,
    text: text.trim(),
    parentReplyId: parentReplyId || null,
    replyLikes: [],
    isAdmin: req.user.role === 'admin',
  });

  await book.save();
  res.json({ success: true, comments: book.comments });
});

const deleteReply = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const comment = book.comments.id(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  const reply = comment.replies.id(req.params.replyId);
  if (!reply) { res.status(404); throw new Error('Reply not found'); }

  const uid = safeStr(req.user._id);
  const replyOwner = safeStr(reply.user);
  const isOwner = !replyOwner || replyOwner === uid;
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403); throw new Error('Not authorized to delete this reply');
  }

  // Remove the reply AND all of its descendants (orphan prevention)
  const replyIdStr = req.params.replyId;
  const toRemove = new Set([replyIdStr]);

  // BFS to find all descendant reply ids
  let changed = true;
  while (changed) {
    changed = false;
    for (const r of comment.replies) {
      if (!toRemove.has(r._id.toString()) && toRemove.has(safeStr(r.parentReplyId))) {
        toRemove.add(r._id.toString());
        changed = true;
      }
    }
  }

  comment.replies = comment.replies.filter(
    (r) => !toRemove.has(r._id.toString())
  );

  await book.save();
  res.json({ success: true, comments: book.comments });
});

// ─── REPLY LIKES ─────────────────────────────────────────────────────────────

const likeReply = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) { res.status(404); throw new Error('Book not found'); }

  const comment = book.comments.id(req.params.commentId);
  if (!comment) { res.status(404); throw new Error('Comment not found'); }

  const reply = comment.replies.id(req.params.replyId);
  if (!reply) { res.status(404); throw new Error('Reply not found'); }

  const uid = safeStr(req.user._id);
  if (!reply.replyLikes) reply.replyLikes = [];

  const alreadyLiked = reply.replyLikes.some((id) => safeStr(id) === uid);

  if (alreadyLiked) {
    reply.replyLikes = reply.replyLikes.filter((id) => safeStr(id) !== uid);
  } else {
    reply.replyLikes.push(req.user._id);
  }

  await book.save();
  res.json({
    success: true,
    replyId: reply._id,
    likes: reply.replyLikes.length,
    isReplyLiked: !alreadyLiked,
    comments: book.comments,
  });
});

// ─── Exports ─────────────────────────────────────────────────────────────────

module.exports = {
  getAllBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  likeBook,
  addComment,
  deleteComment,
  likeComment,
  addReply,
  deleteReply,
  likeReply,
  uploadFields,
};
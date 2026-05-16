const mongoose = require('mongoose');

// ── Reply schema ──────────────────────────────────────────────────────────────
// Flat list stored per comment.  parentReplyId links nested replies to their
// parent without recursive schema definitions (which Mongoose doesn't support).
const replySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  username: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // null  → direct reply to the comment
  // <id>  → reply to another reply (nested)
  parentReplyId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  // Users who liked this reply
  replyLikes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  // ✅ NEW: Flag to mark this reply as posted by admin
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// ── Comment schema ────────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  username: {
    type: String,
    default: '',
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies: {
    type: [replySchema],
    default: [],
  },
  commentLikes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    default: [],
  },
  // ✅ NEW: Flag to mark this comment as posted by admin
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

// ── Book schema ───────────────────────────────────────────────────────────────
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    author: {
      type: String,
      default: '-',
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
      trim: true,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    pdfFile: {
      type: String,
      default: '',
    },
    bookUrl: {
      type: String,
      default: '',
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
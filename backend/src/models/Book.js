const mongoose = require('mongoose');

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
});

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

    // LIKE FEATURE
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

    // COMMENTS FEATURE
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'Book',
  bookSchema
);
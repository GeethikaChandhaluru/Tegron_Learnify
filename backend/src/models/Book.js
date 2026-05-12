const mongoose = require('mongoose');

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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);

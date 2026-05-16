const mongoose = require('mongoose');

const purchasedBookSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    pricePaid: {
      type: Number,
      required: true,
    },
    purchasedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Prevent duplicate purchases
purchasedBookSchema.index({ user: 1, book: 1 }, { unique: true });

module.exports = mongoose.model('PurchasedBook', purchasedBookSchema);

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

import {
  buyNow,
  likeBook
} from '../services/api';

import toast from 'react-hot-toast';

export default function BookCard({
  book,
  delay = 0
}) {
  const navigate = useNavigate();

  const { addToCart } = useCart();

  const {
    toggleWishlist,
    isWishlisted
  } = useWishlist();

  const [isLiked, setIsLiked] = useState(
    book.isLiked || false
  );

  const [likesCount, setLikesCount] = useState(
    book.likes || 0
  );

  const handleBuyNow = async (e) => {
    e.stopPropagation();

    try {
      await buyNow(book._id);

      toast.success(
        'Purchase successful! Check My Books.'
      );

      navigate('/purchased');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        'Purchase failed'
      );
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addToCart(book._id);
  };

  const handleWishlist = async (e) => {
    e.stopPropagation();

    await toggleWishlist(book._id);
  };

  const handleLike = async (e) => {
    e.stopPropagation();

    try {
      const { data } = await likeBook(book._id);

      setIsLiked(data.isLiked);
      setLikesCount(data.likes);

      toast.success(data.message);
    } catch (err) {
      toast.error('Like failed');
    }
  };

  return (
    <div
      className="book-card"
      style={{
        animationDelay: `${delay}ms`,
        cursor: 'pointer'
      }}
      onClick={() =>
        navigate(`/books/${book._id}`)
      }
    >
      <div
        style={{
          position: 'relative'
        }}
      >
        {book.thumbnail ? (
          <img
            src={book.thumbnail}
            alt={book.title}
            className="book-card-img"
            onError={(e) => {
              e.target.style.display =
                'none';
            }}
          />
        ) : (
          <div className="book-card-img-placeholder">
            <div className="book-icon">
              📖
            </div>
            <span>BOOK</span>
          </div>
        )}

        {book.category && (
          <span className="book-card-category">
            {book.category}
          </span>
        )}

        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              fontSize: '20px',
              boxShadow:
                '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            {isWishlisted(book._id)
              ? '❤️'
              : '🤍'}
          </button>

          {/* Like */}
          <button
            onClick={handleLike}
            style={{
              background: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              cursor: 'pointer',
              fontSize: '18px',
              boxShadow:
                '0 4px 12px rgba(0,0,0,0.08)'
            }}
          >
            {isLiked ? '👍' : '👍🏻'}
          </button>
        </div>
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title">
          {book.title}
        </h3>

        <p className="book-card-author">
          by {book.author}
        </p>

        <p className="book-card-desc">
          {book.description}
        </p>

        <div className="book-card-price">
          {book.price === 0 ? (
            <span className="free">
              FREE
            </span>
          ) : (
            `₹${book.price.toFixed(2)}`
          )}
        </div>

        <div
          style={{
            marginBottom: '14px',
            fontWeight: 600,
            fontSize: '14px'
          }}
        >
          👍 {likesCount} Like
          {likesCount !== 1 ? 's' : ''}
        </div>

        <div className="book-card-actions">
          <button
            className="btn btn-outline"
            style={{
              fontSize: '0.8rem',
              padding: '10px 12px'
            }}
            onClick={handleAddToCart}
          >
            🛒 Cart
          </button>

          <button
            className="btn btn-primary"
            style={{
              fontSize: '0.8rem',
              padding: '10px 12px'
            }}
            onClick={handleBuyNow}
          >
            ⚡ Buy
          </button>
        </div>
      </div>
    </div>
  );
}
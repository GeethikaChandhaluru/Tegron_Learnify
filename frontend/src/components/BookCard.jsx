import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getFileUrl, buyNow, likeBook } from '../services/api';
import toast from 'react-hot-toast';

export default function BookCard({ book, delay = 0 }) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(book.likes || 0);

  // Sync with backend value on mount / book change
  useEffect(() => {
    setIsLiked(book.isLiked || false);
    setLikesCount(book.likes || 0);
  }, [book]);

  const handleBuyNow = async (e) => {
    e.stopPropagation();
    try {
      await buyNow(book._id);
      toast.success('Purchase successful! Check My Books.');
      navigate('/purchased');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Purchase failed');
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    await addToCart(book._id);
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const { data } = await likeBook(book._id);
      setIsLiked(data.isLiked);
      setLikesCount(data.likes);
      toast.success(data.message);
    } catch {
      toast.error('Like failed');
    }
  };

  return (
    <div
      className="book-card"
      style={{ animationDelay: `${delay}ms`, cursor: 'pointer' }}
      onClick={() => navigate(`/books/${book._id}`)}
    >
      <div style={{ position: 'relative' }}>
        {book.thumbnail ? (
          <img
            src={getFileUrl(book.thumbnail)}
            alt={book.title}
            className="book-card-img"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="book-card-img-placeholder">
            <div className="book-icon">📖</div>
            <span>BOOK</span>
          </div>
        )}

        {book.category && (
          <span className="book-card-category">{book.category}</span>
        )}

        {/* Like button — top right */}
        <button
          onClick={handleLike}
          title={isLiked ? 'Unlike' : 'Like'}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            cursor: 'pointer',
            fontSize: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {isLiked ? '❤️' : '🤍'}
        </button>
      </div>

      <div className="book-card-body">
        <h3 className="book-card-title">{book.title}</h3>

        <p className="book-card-author">by {book.author}</p>

        <p className="book-card-desc">{book.description}</p>

        <div className="book-card-price">
          {book.price === 0 ? (
            <span className="free">FREE</span>
          ) : (
            `₹${book.price.toFixed(2)}`
          )}
        </div>

        <div style={{ marginBottom: '14px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>
          {isLiked ? '❤️' : '🤍'} {likesCount} Like{likesCount !== 1 ? 's' : ''}
        </div>

        <div className="book-card-actions">
          <button
            className="btn btn-outline"
            style={{ fontSize: '0.8rem', padding: '10px 12px' }}
            onClick={handleAddToCart}
          >
            🛒 Cart
          </button>

          <button
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '10px 12px' }}
            onClick={handleBuyNow}
          >
            ⚡ Buy
          </button>
        </div>
      </div>
    </div>
  );
}
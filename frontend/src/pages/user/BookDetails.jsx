import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

import {
    getBook,
    buyNow,
    likeBook,
    addComment
} from '../../services/api';

import toast from 'react-hot-toast';

export default function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { addToCart } = useCart();

    const {
        toggleWishlist,
        isWishlisted
    } = useWishlist();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const [commentText, setCommentText] = useState('');
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        fetchBook();
    }, [id]);

    const fetchBook = async () => {
        try {
            const { data } = await getBook(id);
            setBook(data.data);
        } catch (err) {
            toast.error('Book not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleBuyNow = async () => {
        setBuying(true);

        try {
            await buyNow(book._id);
            setShowSuccess(true);
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                'Purchase failed'
            );
        } finally {
            setBuying(false);
        }
    };

    const handleWishlist = async () => {
        await toggleWishlist(book._id);
    };

    const handleLike = async () => {
        try {
            const { data } = await likeBook(book._id);

            setBook((prev) => ({
                ...prev,
                likes: data.likes
            }));

            setLiked(data.isLiked);
            toast.success(data.message);
        } catch (err) {
            toast.error('Like update failed');
        }
    };

    const handleComment = async () => {
        if (!commentText.trim()) {
            return toast.error(
                'Please enter a comment'
            );
        }

        try {
            const { data } = await addComment(
                book._id,
                commentText
            );

            setBook((prev) => ({
                ...prev,
                comments: data.comments
            }));

            setCommentText('');
            toast.success('Comment added');
        } catch (err) {
            toast.error('Comment failed');
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <Loader />
            </>
        );
    }

    if (!book) return null;

    return (
        <>
            <Navbar />

            {showSuccess && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-icon">
                            🎉
                        </div>

                        <h3>Order Confirmed!</h3>

                        <p>
                            <strong>{book.title}</strong>{' '}
                            has been added to your
                            library. Head to <em>My Books</em>{' '}
                            to start reading.
                        </p>

                        <div className="modal-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() => navigate('/')}
                            >
                                Browse More
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={() =>
                                    navigate('/purchased')
                                }
                            >
                                📚 Go to My Books
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-wrap section">
                <div
                    style={{
                        marginBottom: '24px',
                        fontSize: '0.85rem',
                        color:
                            'var(--text-secondary)'
                    }}
                >
                    <span
                        style={{
                            cursor: 'pointer',
                            color: 'var(--cyan)',
                            fontWeight: 500
                        }}
                        onClick={() => navigate('/')}
                    >
                        Home
                    </span>

                    {' / '}
                    {book.title}
                </div>

                <div className="book-detail-layout animate-fade-up">
                    <div>
                        {book.thumbnail ? (
                            <img
                                src={book.thumbnail}
                                alt={book.title}
                                className="book-detail-img"
                            />
                        ) : (
                            <div className="book-detail-img">
                                📖
                            </div>
                        )}
                    </div>

                    <div className="book-detail-info">
                        {book.category &&
                            book.category !==
                            'General' && (
                                <span className="book-detail-category">
                                    {book.category}
                                </span>
                            )}

                        <h1 className="book-detail-title">
                            {book.title}
                        </h1>

                        <div className="book-detail-price">
                            {book.price === 0
                                ? 'FREE'
                                : `₹${book.price.toFixed(
                                    2
                                )}`}
                        </div>

                        <p className="book-detail-desc">
                            {book.description}
                        </p>

                        <div
                            style={{
                                display: 'flex',
                                gap: '20px',
                                marginBottom: '24px',
                                fontSize: '18px',
                                fontWeight: 600
                            }}
                        >
                            <button
                                className="btn btn-outline"
                                onClick={handleWishlist}
                            >
                                {isWishlisted(book._id)
                                    ? '❤️ Wishlisted'
                                    : '🤍 Wishlist'}
                            </button>

                            <button
                                className="btn btn-outline"
                                onClick={handleLike}
                            >
                                {liked
                                    ? `👍 Liked (${book.likes || 0})`
                                    : `👍 Like (${book.likes || 0})`}
                            </button>
                        </div>

                        <div className="book-detail-actions">
                            <button
                                className="btn btn-outline"
                                onClick={() =>
                                    addToCart(book._id)
                                }
                            >
                                🛒 Add to Cart
                            </button>

                            <button
                                className="btn btn-primary"
                                onClick={handleBuyNow}
                                disabled={buying}
                            >
                                {buying
                                    ? 'Processing…'
                                    : '⚡ Buy Now'}
                            </button>
                        </div>

                        <div
                            style={{
                                marginTop: '40px'
                            }}
                        >
                            <h3
                                style={{
                                    marginBottom: '16px'
                                }}
                            >
                                💬 Comments
                            </h3>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '12px',
                                    marginBottom: '20px'
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Write your comment..."
                                    value={commentText}
                                    onChange={(e) =>
                                        setCommentText(
                                            e.target.value
                                        )
                                    }
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        borderRadius: '8px',
                                        border:
                                            '1px solid #ddd'
                                    }}
                                />

                                <button
                                    className="btn btn-primary"
                                    onClick={handleComment}
                                >
                                    Post
                                </button>
                            </div>

                            {book.comments?.length > 0 ? (
                                book.comments.map(
                                    (comment, index) => (
                                        <div
                                            key={index}
                                            style={{
                                                padding: '14px',
                                                border:
                                                    '1px solid #eee',
                                                borderRadius:
                                                    '10px',
                                                marginBottom:
                                                    '12px'
                                            }}
                                        >
                                            <strong>
                                                {comment.username ||
                                                    'User'}
                                            </strong>

                                            <p
                                                style={{
                                                    marginTop: '6px'
                                                }}
                                            >
                                                {comment.text}
                                            </p>
                                        </div>
                                    )
                                )
                            ) : (
                                <p>
                                    No comments yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
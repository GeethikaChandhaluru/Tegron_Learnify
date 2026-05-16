import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import CommentSection from '../../components/CommentSection';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getFileUrl, getBook, buyNow, likeBook } from '../../services/api';
import toast from 'react-hot-toast';

export default function BookDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { addToCart } = useCart();
    const { user } = useAuth();

    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [liked, setLiked] = useState(false);

    useEffect(() => { fetchBook(); }, [id]);

    useEffect(() => {
        if (book) setLiked(book.isLiked || false);
    }, [book]);

    const fetchBook = async () => {
        try {
            const { data } = await getBook(id);
            setBook(data.data);
        } catch {
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
            toast.error(err.response?.data?.message || 'Purchase failed');
        } finally {
            setBuying(false);
        }
    };

    const handleLike = async () => {
        try {
            const { data } = await likeBook(book._id);
            setBook((prev) => ({ ...prev, likes: data.likes, isLiked: data.isLiked }));
            setLiked(data.isLiked);
            toast.success(data.message);
        } catch {
            toast.error('Like update failed');
        }
    };

    const handleCommentsUpdate = (updatedComments) => {
        setBook((prev) => ({ ...prev, comments: updatedComments }));
    };

    if (loading) return <><Navbar /><Loader /></>;
    if (!book) return null;

    return (
        <>
            <Navbar />

            {/* Purchase success modal */}
            {showSuccess && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-icon">🎉</div>
                        <h3>Order Confirmed!</h3>
                        <p>
                            <strong>{book.title}</strong>{' '}has been added to your
                            library. Head to <em>My Books</em> to start reading.
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-outline" onClick={() => navigate('/')}>
                                Browse More
                            </button>
                            <button className="btn btn-primary" onClick={() => navigate('/purchased')}>
                                📚 Go to My Books
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-wrapper">
                <div className="page-wrap section">

                    {/* ── Back button (replaces breadcrumb) ── */}
                    <button
                        className="btn btn-outline"
                        onClick={() => navigate('/')}
                        style={{
                            borderRadius: '99px',
                            padding: '9px 20px',
                            fontSize: '0.85rem',
                            marginBottom: '28px',
                            gap: '6px',
                        }}
                    >
                        ← Back to Books
                    </button>

                    {/* ── Book info grid ── */}
                    <div className="book-detail-layout animate-fade-up">

                        {/* Left: thumbnail */}
                        <div>
                            {book.thumbnail ? (
                                <img
                                    src={getFileUrl(book.thumbnail)}
                                    alt={book.title}
                                    className="book-detail-img"
                                />
                            ) : (
                                <div className="book-detail-img"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', background: 'var(--light-gray)' }}>
                                    📖
                                </div>
                            )}
                        </div>

                        {/* Right: details */}
                        <div className="book-detail-info">
                            {book.category && book.category !== 'General' && (
                                <span className="book-detail-category">{book.category}</span>
                            )}

                            <h1 className="book-detail-title">{book.title}</h1>

                            <div className="book-detail-price">
                                {book.price === 0 ? 'FREE' : `₹${book.price.toFixed(2)}`}
                            </div>

                            <p className="book-detail-desc">{book.description}</p>

                            {/* Like button */}
                            <div style={{ marginBottom: '24px' }}>
                                <button
                                    className="btn btn-outline"
                                    onClick={handleLike}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        fontWeight: 600,
                                        borderColor: liked ? '#e53e3e' : undefined,
                                        color: liked ? '#e53e3e' : undefined,
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {liked ? '❤️' : '🤍'}
                                    {liked ? 'Liked' : 'Like'}
                                    <span style={{
                                        background: liked ? '#e53e3e' : 'rgba(0,0,0,0.07)',
                                        color: liked ? '#fff' : 'inherit',
                                        borderRadius: '99px',
                                        padding: '1px 8px',
                                        fontSize: '0.8rem',
                                    }}>
                                        {book.likes || 0}
                                    </span>
                                </button>
                            </div>

                            {/* Cart / Buy */}
                            <div className="book-detail-actions">
                                <button className="btn btn-outline" onClick={() => addToCart(book._id)}>
                                    🛒 Add to Cart
                                </button>
                                <button className="btn btn-primary" onClick={handleBuyNow} disabled={buying}>
                                    {buying ? 'Processing…' : '⚡ Buy Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* ── END book info grid ── */}

                    {/* ── Comments — full width below grid ── */}
                    <CommentSection
                        bookId={book._id}
                        comments={book.comments || []}
                        currentUserId={user?._id}
                        onCommentsUpdate={handleCommentsUpdate}
                    />

                </div>
            </div>
        </>
    );
}
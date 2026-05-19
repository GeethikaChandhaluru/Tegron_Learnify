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
    const { user, updateBalance } = useAuth();   // ← updateBalance added

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
            const { data } = await buyNow(book._id);
            // Update balance instantly without page reload
            if (data.newBalance !== undefined) {
                updateBalance(data.newBalance);
            }
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
            toast.error('Could not update like');
        }
    };

    if (loading) return <><Navbar /><Loader /></>;

    const isPurchased = book?.isPurchased;
    const BASE = 'https://tegron-learnify.onrender.com';

    return (
        <>
            <Navbar />
            <div className="app-container" style={{ paddingTop: 32, paddingBottom: 60 }}>

                {showSuccess && (
                    <div style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    }}>
                        <div style={{
                            background: '#fff', borderRadius: 'var(--radius-lg)', padding: 40,
                            textAlign: 'center', maxWidth: 400, width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                        }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
                            <h2 style={{ fontFamily: 'Syne,sans-serif', color: 'var(--navy)', marginBottom: 8 }}>
                                Purchase Successful!
                            </h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                                You now have access to <strong>{book.title}</strong>. Your wallet has been updated.
                            </p>
                            <button className="btn btn-primary" onClick={() => navigate('/purchased')}>
                                Go to My Books
                            </button>
                        </div>
                    </div>
                )}

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    ← Back
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 40, alignItems: 'start' }}>
                    {/* Cover */}
                    <div>
                        <img
                            src={book.thumbnail ? `${BASE}/${book.thumbnail}` : '/placeholder.png'}
                            alt={book.title}
                            style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}
                            onError={(e) => { e.target.src = '/placeholder.png'; }}
                        />
                    </div>

                    {/* Info */}
                    <div>
                        <div style={{ marginBottom: 6 }}>
                            <span style={{ background: 'var(--cyan)', color: '#fff', padding: '3px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600 }}>
                                {book.category}
                            </span>
                        </div>
                        <h1 style={{ fontFamily: 'Syne,sans-serif', color: 'var(--navy)', fontSize: '1.9rem', margin: '12px 0 6px' }}>
                            {book.title}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>by {book.author}</p>

                        <p style={{ color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 24 }}>
                            {book.description}
                        </p>

                        {/* Price + wallet info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--navy)' }}>
                                ₹{book.price}
                            </span>
                            {!isPurchased && user && (
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', background: '#f1f5f9', padding: '4px 12px', borderRadius: 100 }}>
                                    Your balance: ₹{(user.balance ?? 0).toFixed(2)}
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
                            {isPurchased ? (
                                <button className="btn btn-primary" onClick={() => navigate('/purchased')}>
                                    📖 Read Now
                                </button>
                            ) : (
                                <>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleBuyNow}
                                        disabled={buying}
                                    >
                                        {buying ? 'Processing…' : '⚡ Buy Now'}
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => addToCart(book._id)}
                                    >
                                        🛒 Add to Cart
                                    </button>
                                </>
                            )}

                            {/* Like */}
                            <button
                                onClick={handleLike}
                                style={{
                                    background: liked ? 'rgba(239,68,68,0.1)' : 'transparent',
                                    border: `1.5px solid ${liked ? '#ef4444' : 'var(--border-gray)'}`,
                                    borderRadius: 'var(--radius-md)', padding: '10px 18px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                                    color: liked ? '#ef4444' : 'var(--text-secondary)',
                                    fontSize: '0.9rem', transition: 'all 0.2s',
                                }}
                            >
                                {liked ? '❤️' : '🤍'} {book.likes || 0}
                            </button>
                        </div>

                        {/* Insufficient balance warning */}
                        {!isPurchased && user && user.balance < book.price && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: 16, color: '#dc2626', fontSize: '0.85rem' }}>
                                ⚠️ Insufficient balance. You need ₹{book.price} but have ₹{(user.balance ?? 0).toFixed(2)}.
                            </div>
                        )}
                    </div>
                </div>

                {/* Comments */}
                <div style={{ marginTop: 48 }}>
                    <CommentSection
                        bookId={book._id}
                        comments={book.comments || []}
                        currentUserId={user?._id}
                        onCommentsUpdate={(updatedComments) =>
                            setBook((prev) => ({ ...prev, comments: updatedComments }))
                        }
                    />
                </div>
            </div>
        </>
    );
}
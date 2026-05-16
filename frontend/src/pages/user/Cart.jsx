import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import ConfirmModal from '../../components/ConfirmModal';
import { useCart } from '../../context/CartContext';
import { checkoutCart } from '../../services/api';
import toast from 'react-hot-toast';

export default function CartPage() {
    const navigate = useNavigate();
    const { cart, removeFromCart, clearCartLocal } = useCart();
    const [checkingOut, setCheckingOut] = useState(false);
    const [toRemove, setToRemove] = useState(null); // { bookId, title }
    const [showCheckout, setShowCheckout] = useState(false);

    const items = cart?.items || [];
    const totalAmt = items.reduce((s, i) => s + (i.book?.price || 0), 0);

    const handleCheckout = async () => {
        setShowCheckout(false);
        if (items.length === 0) { toast.error('Your cart is empty'); return; }
        setCheckingOut(true);
        try {
            await checkoutCart();
            clearCartLocal();
            toast.success('Order placed successfully! 🎉');
            navigate('/purchased');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Checkout failed');
        } finally {
            setCheckingOut(false);
        }
    };

    const doRemove = () => {
        if (toRemove) { removeFromCart(toRemove.bookId); setToRemove(null); }
    };

    if (!cart) return <><Navbar /><Loader /></>;

    return (
        <>
            <Navbar />

            <div className="page-hero">
                <div className="page-hero-inner">
                    <h1>Your <span>Cart</span></h1>
                    <p>{items.length} item{items.length !== 1 ? 's' : ''} ready for checkout</p>
                </div>
            </div>

            <div className="page-wrap section">
                {items.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🛒</div>
                        <h3>Your cart is empty</h3>
                        <p>Browse our collection and add books you love</p>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>Browse Books</button>
                    </div>
                ) : (
                    <div className="cart-layout">
                        {/* Items */}
                        <div className="cart-items">
                            {items.map((item) => (
                                <div key={item._id} className="cart-item">
                                    {item.book?.thumbnail ? (
                                        <img src={item.book.thumbnail} alt={item.book.title} className="cart-item-img" />
                                    ) : (
                                        <div className="cart-item-img-placeholder">📖</div>
                                    )}
                                    <div className="cart-item-info">
                                        <h4 className="cart-item-title">{item.book?.title}</h4>
                                        <p className="cart-item-price">
                                            {item.book?.price === 0 ? 'FREE' : `₹${item.book?.price?.toFixed(2)}`}
                                        </p>
                                    </div>
                                    <button className="btn btn-danger btn-sm"
                                        style={{ flexShrink: 0 }}
                                        onClick={() => setToRemove({ bookId: item.book._id, title: item.book.title })}>
                                        🗑️ Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Summary */}
                        <div className="cart-summary">
                            <h3>Order Summary</h3>
                            {items.map((item) => (
                                <div key={item._id} className="cart-summary-row">
                                    <span style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                                        {item.book?.title?.slice(0, 22)}{item.book?.title?.length > 22 ? '…' : ''}
                                    </span>
                                    <span style={{ fontWeight: 600 }}>
                                        {item.book?.price === 0 ? 'FREE' : `₹${item.book?.price?.toFixed(2)}`}
                                    </span>
                                </div>
                            ))}
                            <div className="cart-summary-row total">
                                <span>Total</span>
                                <span style={{ color: 'var(--orange-red)' }}>₹{totalAmt.toFixed(2)}</span>
                            </div>
                            <button className="btn btn-primary btn-full" style={{ marginTop: '20px' }}
                                onClick={() => setShowCheckout(true)} disabled={checkingOut}>
                                {checkingOut ? 'Processing…' : '🚀 Checkout'}
                            </button>
                            <button className="btn btn-outline btn-full" style={{ marginTop: '10px', fontSize: '0.875rem' }}
                                onClick={() => navigate('/')}>
                                Continue Browsing
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Remove confirmation */}
            {toRemove && (
                <ConfirmModal
                    icon="🗑️"
                    title="Remove Item?"
                    message={`Remove "${toRemove.title}" from your cart?`}
                    confirmText="Remove"
                    cancelText="Keep"
                    danger={true}
                    onConfirm={doRemove}
                    onCancel={() => setToRemove(null)}
                />
            )}

            {/* Checkout confirmation */}
            {showCheckout && (
                <ConfirmModal
                    icon="🚀"
                    title="Confirm Order?"
                    message={`Place order for ${items.length} book${items.length > 1 ? 's' : ''} totalling ₹${totalAmt.toFixed(2)}?`}
                    confirmText="Yes, Place Order"
                    cancelText="Review Cart"
                    danger={false}
                    onConfirm={handleCheckout}
                    onCancel={() => setShowCheckout(false)}
                />
            )}
        </>
    );
}

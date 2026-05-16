import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { useWishlist } from '../../context/WishlistContext';

export default function Wishlist() {
    const navigate = useNavigate();

    const {
        wishlist,
        toggleWishlist
    } = useWishlist();

    const wishlistBooks = wishlist || [];

    const handleRemove = async (e, bookId) => {
        e.stopPropagation();

        await toggleWishlist(bookId);
    };

    return (
        <>
            <Navbar />

            <div className="page-wrap section">
                <h1
                    style={{
                        marginBottom: '28px',
                        fontSize: '2rem',
                        fontWeight: 700,
                    }}
                >
                    ❤️ My Wishlist
                </h1>

                {wishlistBooks.length === 0 ? (
                    <div
                        style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            fontSize: '1.1rem',
                        }}
                    >
                        No wishlist books yet ❤️
                    </div>
                ) : (
                    <div className="books-grid">
                        {wishlistBooks.map((book) => (
                            <div
                                key={book._id}
                                className="book-card"
                            >
                                <div
                                    onClick={() =>
                                        navigate(`/books/${book._id}`)
                                    }
                                    style={{
                                        cursor: 'pointer'
                                    }}
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
                                            />
                                        ) : (
                                            <div className="book-card-img-placeholder">
                                                <div className="book-icon">
                                                    📖
                                                </div>
                                                <span>BOOK</span>
                                            </div>
                                        )}

                                        <button
                                            onClick={(e) =>
                                                handleRemove(
                                                    e,
                                                    book._id
                                                )
                                            }
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
                                                boxShadow:
                                                    '0 4px 12px rgba(0,0,0,0.08)'
                                            }}
                                        >
                                            ❤️
                                        </button>
                                    </div>

                                    <div className="book-card-body">
                                        <h3>
                                            {book.title}
                                        </h3>

                                        <p>
                                            by {book.author || '-'}
                                        </p>

                                        <div
                                            style={{
                                                fontWeight: 700,
                                                marginTop: '10px',
                                            }}
                                        >
                                            {book.price === 0
                                                ? 'FREE'
                                                : `₹${book.price}`}
                                        </div>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-outline"
                                    style={{
                                        width: '100%',
                                        marginTop: '14px',
                                    }}
                                    onClick={(e) =>
                                        handleRemove(
                                            e,
                                            book._id
                                        )
                                    }
                                >
                                    Remove ❤️
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
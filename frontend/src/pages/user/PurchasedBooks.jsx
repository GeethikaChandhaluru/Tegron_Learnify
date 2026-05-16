import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Loader from '../../components/Loader';
import { getPurchasedBooks, getFileUrl } from '../../services/api';

export default function PurchasedBooks() {
    const navigate = useNavigate();
    const [data, setData] = useState({ books: [], count: 0, totalSpent: 0 });
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState(null);

    useEffect(() => {
        getPurchasedBooks()
            .then(({ data: res }) => setData({ books: res.data, count: res.count, totalSpent: res.totalSpent }))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const openBook = (pb) => {
        const book = pb.book;
        if (book.pdfFile) {
            setActive(book);
        } else if (book.bookUrl) {
            window.open(book.bookUrl, '_blank');
        } else {
            setActive(book);
        }
    };

    return (
        <>
            <Navbar />

            <div className="page-hero">
                <div className="page-hero-inner">
                    <h1>My <span>Library</span></h1>
                    <p>Your purchased books — ready to read anytime, anywhere</p>
                </div>
            </div>

            <div className="page-wrap section">

                {/* ── Back button ── */}
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
                    ← Back to Home
                </button>

                {/* Stats */}
                <div className="purchased-stats">
                    {[
                        { label: 'Books Purchased', value: data.count, icon: '📚', color: 'cyan' },
                        { label: 'Total Spent', value: `₹${data.totalSpent.toFixed(2)}`, icon: '💰', color: 'orange' },
                    ].map(s => (
                        <div key={s.label} className="stat-card">
                            <div className="stat-card-label">{s.icon} {s.label}</div>
                            <div className={`stat-card-value ${s.color}`}>{s.value}</div>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <Loader />
                ) : data.books.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No books yet</h3>
                        <p>You haven't purchased any books yet. Start exploring!</p>
                        <button className="btn btn-primary" onClick={() => navigate('/')}>
                            Browse Books
                        </button>
                    </div>
                ) : (
                    <>
                        {/* PDF Reader modal */}
                        {active && (
                            <div style={{
                                position: 'fixed', inset: 0, zIndex: 200,
                                background: 'rgba(10,34,56,0.85)', display: 'flex',
                                flexDirection: 'column', animation: 'fadeIn 0.2s ease',
                            }}>
                                <div style={{
                                    background: 'var(--navy)', padding: '12px 20px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                }}>
                                    <span style={{ color: 'white', fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>
                                        📖 {active.title}
                                    </span>
                                    <button
                                        className="btn btn-danger"
                                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                                        onClick={() => setActive(null)}
                                    >
                                        ✕ Close
                                    </button>
                                </div>
                                {active.pdfFile ? (
                                    <iframe src={getFileUrl(active.pdfFile)} title="PDF Reader" style={{ flex: 1, border: 'none' }} />
                                ) : (
                                    <div style={{
                                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: 'rgba(255,255,255,0.5)', flexDirection: 'column', gap: 16,
                                    }}>
                                        <div style={{ fontSize: '3rem' }}>📖</div>
                                        <p>No PDF available for this book.</p>
                                        {active.bookUrl && (
                                            <a href={active.bookUrl} target="_blank" rel="noopener noreferrer"
                                                className="btn btn-primary">
                                                Open External Link
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {data.books.map((pb, i) => (
                                <div
                                    key={pb._id}
                                    className="purchased-book-card"
                                    style={{ animationDelay: `${i * 60}ms` }}
                                    onClick={() => openBook(pb)}
                                >
                                    {pb.book?.thumbnail ? (
                                        <img src={getFileUrl(pb.book.thumbnail)} alt={pb.book.title}
                                            style={{ width: 70, height: 90, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                                    ) : (
                                        <div style={{
                                            width: 70, height: 90, background: 'linear-gradient(135deg,var(--navy),var(--dark-blue))',
                                            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: 'rgba(255,255,255,0.4)', fontSize: '1.5rem', flexShrink: 0,
                                        }}>📖</div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontFamily: 'Syne,sans-serif', fontSize: '1rem', fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                                            {pb.book?.title}
                                        </h4>
                                        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
                                            by {pb.book?.author} · {pb.book?.category}
                                        </p>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4,
                                            background: 'rgba(40,199,217,0.1)', color: 'var(--cyan)',
                                            borderRadius: 100, padding: '3px 10px', fontSize: '0.75rem', fontWeight: 600,
                                        }}>
                                            ✅ Purchased · ₹{pb.pricePaid?.toFixed(2)}
                                        </span>
                                    </div>
                                    <div style={{ color: 'var(--cyan)', fontSize: '1.4rem', flexShrink: 0 }}>▶</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import { getAdminPayments } from '../../services/api';

export default function Payments() {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [totalRevenue, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getAdminPayments()
            .then(({ data: res }) => {
                setData(res.data);
                setTotal(res.totalRevenue);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = data.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <button className="back-btn" onClick={() => navigate('/admin')}>
                ← Back to Dashboard
            </button>

            <div className="admin-page-header">
                <div className="admin-page-title">💳 Payment Analytics</div>
                <div className="admin-page-subtitle">Revenue breakdown per book</div>
            </div>

            {/* Total Revenue Banner */}
            <div style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, #061828 100%)',
                borderRadius: 'var(--radius-md)',
                padding: '24px 28px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
            }}>
                <div>
                    <p style={{
                        color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6
                    }}>
                        💰 Total Revenue Collected
                    </p>
                    <p style={{
                        color: 'var(--soft-gold)', fontSize: '2.2rem',
                        fontWeight: 800, letterSpacing: '-0.5px'
                    }}>
                        ₹{totalRevenue.toFixed(2)}
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{
                        color: 'rgba(255,255,255,0.55)', fontSize: '0.8rem',
                        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6
                    }}>
                        📚 Books Selling
                    </p>
                    <p style={{
                        color: 'var(--cyan)', fontSize: '2.2rem',
                        fontWeight: 800
                    }}>
                        {data.length}
                    </p>
                </div>
            </div>

            {/* Search */}
            <input
                style={{
                    width: '100%', maxWidth: 360, padding: '10px 18px',
                    border: '2px solid var(--border-gray)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem', background: 'var(--light-gray)',
                    fontFamily: 'Poppins, sans-serif', marginBottom: 20,
                }}
                placeholder="Search book title…"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {loading ? <Loader /> : (
                <>
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Book Title</th>
                                    <th>Price / Unit</th>
                                    <th>Units Sold</th>
                                    <th>Amount Collected</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{
                                            textAlign: 'center', padding: '56px',
                                            color: 'var(--text-secondary)',
                                        }}>
                                            {data.length === 0 ? 'No purchases yet' : 'No books match your search'}
                                        </td>
                                    </tr>
                                ) : filtered.map((book, i) => (
                                    <tr key={book._id}>
                                        <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                                            {i + 1}
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: 600, color: 'var(--navy)' }}>
                                                {book.title}
                                            </span>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>
                                            ₹{book.price?.toFixed(2) ?? '—'}
                                        </td>
                                        <td>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(40,199,217,0.10)', color: 'var(--cyan)',
                                                borderRadius: '100px', padding: '4px 14px',
                                                fontWeight: 700, fontSize: '0.875rem', minWidth: 40,
                                            }}>
                                                {book.unitsSold}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{
                                                fontWeight: 800, fontSize: '1rem', color: 'var(--orange-red)',
                                            }}>
                                                ₹{book.amountCollected.toFixed(2)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>

                            {/* Footer total row */}
                            {filtered.length > 0 && (
                                <tfoot>
                                    <tr>
                                        <td colSpan="3" style={{ padding: '14px 16px' }} />
                                        <td style={{
                                            padding: '14px 16px',
                                            fontWeight: 700, fontSize: '0.78rem',
                                            textTransform: 'uppercase', letterSpacing: '0.08em',
                                            color: 'var(--text-secondary)',
                                            borderTop: '2px solid var(--border-gray)',
                                        }}>
                                            Total
                                        </td>
                                        <td style={{
                                            padding: '14px 16px',
                                            fontWeight: 800, fontSize: '1.1rem', color: 'var(--navy)',
                                            borderTop: '2px solid var(--border-gray)',
                                        }}>
                                            ₹{filtered.reduce((s, b) => s + b.amountCollected, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </>
            )}
        </AdminLayout>
    );
}
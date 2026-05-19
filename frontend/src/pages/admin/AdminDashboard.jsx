import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import { getAdminStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const SOCKET_URL = 'https://tegron-learnify.onrender.com';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [liveOrders, setLiveOrders] = useState([]);

    // Fetch initial stats
    useEffect(() => {
        getAdminStats()
            .then(({ data }) => setStats(data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    // ── Socket.io: listen for new orders ──────────────────────────────────────
    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });

        socket.on('connect', () => {
            console.log('Admin dashboard connected to socket');
        });

        socket.on('newOrder', (orderData) => {
            // Show toast notification
            toast.success(
                `🛒 New order from ${orderData.user?.username || 'a user'} — ₹${orderData.totalAmount}`,
                { duration: 5000 }
            );

            // Update live orders list (most recent first, cap at 10)
            setLiveOrders((prev) => [orderData, ...prev].slice(0, 10));

            // Increment stats counters optimistically
            setStats((prev) =>
                prev
                    ? {
                        ...prev,
                        totalOrders: (prev.totalOrders || 0) + 1,
                        totalRevenue: (prev.totalRevenue || 0) + orderData.totalAmount,
                    }
                    : prev
            );
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    return (
        <AdminLayout>
            <div className="admin-page-title">Welcome, {user?.username} 👋</div>
            <div className="admin-page-subtitle">Here's what's happening with Tegron Notes today.</div>

            {loading ? <Loader /> : (
                <div className="stats-grid">
                    {[
                        { label: 'Total Users', value: stats?.totalUsers, color: 'cyan', icon: '👥' },
                        { label: 'Total Books', value: stats?.totalBooks, color: '', icon: '📚' },
                        { label: 'Total Orders', value: stats?.totalOrders, color: 'orange', icon: '🧾' },
                        { label: 'Total Revenue', value: `₹${(stats?.totalRevenue || 0).toFixed(2)}`, color: 'gold', icon: '💰' },
                    ].map(s => (
                        <div key={s.label} className="stat-card" style={{ animationDelay: '0ms' }}>
                            <div className="stat-card-label">{s.icon} {s.label}</div>
                            <div className={`stat-card-value ${s.color}`}>{s.value ?? 0}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Live Order Feed ──────────────────────────────────────────── */}
            {liveOrders.length > 0 && (
                <div style={{
                    background: '#fff', borderRadius: 'var(--radius-lg)',
                    padding: '28px', border: '1px solid var(--border-gray)',
                    boxShadow: 'var(--shadow-sm)', marginBottom: 24,
                }}>
                    <h3 style={{ fontFamily: 'Syne,sans-serif', marginBottom: 16, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        ⚡ Live Orders
                        <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 100, fontFamily: 'sans-serif' }}>
                            LIVE
                        </span>
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {liveOrders.map((o, i) => (
                            <div key={i} style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '12px 16px', background: '#f8fafc',
                                borderRadius: 'var(--radius-md)', border: '1px solid var(--border-gray)',
                                animation: 'fadeIn 0.4s ease',
                            }}>
                                <div>
                                    <span style={{ fontWeight: 600, color: 'var(--navy)', fontSize: '0.9rem' }}>
                                        {o.user?.username || 'Unknown'}
                                    </span>
                                    {o.book && (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                            {' '} bought <em>{o.book.title}</em>
                                        </span>
                                    )}
                                    {o.booksCount && (
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                            {' '} checked out {o.booksCount} book(s)
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ fontWeight: 700, color: 'var(--navy)' }}>
                                        ₹{o.totalAmount}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                        {new Date(o.createdAt).toLocaleTimeString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{
                background: 'white', borderRadius: 'var(--radius-lg)',
                padding: '32px', border: '1px solid var(--border-gray)',
                boxShadow: 'var(--shadow-sm)',
            }}>
                <h3 style={{ fontFamily: 'Syne,sans-serif', marginBottom: 8, color: 'var(--navy)' }}>
                    Quick Actions
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
                    Manage your platform from the sidebar or jump to a section below.
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {[
                        { label: 'Add New Book', path: '/admin/add-book', cls: 'btn-primary' },
                        { label: 'Manage Books', path: '/admin/manage-books', cls: 'btn-outline' },
                        { label: 'View Orders', path: '/admin/orders', cls: 'btn-outline' },
                        { label: 'View Users', path: '/admin/users', cls: 'btn-outline' },
                    ].map(a => (
                        <a key={a.path} href={a.path} className={`btn ${a.cls}`} style={{ fontSize: '0.875rem' }}>
                            {a.label}
                        </a>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
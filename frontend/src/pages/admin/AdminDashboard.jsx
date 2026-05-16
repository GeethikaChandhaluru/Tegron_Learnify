import { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import { getAdminStats } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminStats()
            .then(({ data }) => setStats(data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
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

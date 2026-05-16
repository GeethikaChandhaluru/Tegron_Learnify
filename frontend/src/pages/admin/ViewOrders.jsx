import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import { getAdminOrders } from '../../services/api';

export default function ViewOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [revenue, setRevenue] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminOrders()
            .then(({ data }) => { setOrders(data.data); setRevenue(data.totalRevenue); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <AdminLayout>
            <button className="back-btn" onClick={() => navigate('/admin')}>
                ← Back to Dashboard
            </button>
            <div className="admin-page-title">All Orders</div>
            <div className="admin-page-subtitle">{orders.length} total orders</div>

            <div className="stats-grid" style={{ marginBottom: 24 }}>
                {[
                    { label: 'Total Orders', value: orders.length, color: 'cyan', icon: '🧾' },
                    { label: 'Total Revenue', value: `₹${revenue.toFixed(2)}`, color: 'orange', icon: '💰' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-card-label">{s.icon} {s.label}</div>
                        <div className={`stat-card-value ${s.color}`}>{s.value}</div>
                    </div>
                ))}
            </div>

            {loading ? <Loader /> : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>User</th>
                                <th>Books</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No orders yet
                                    </td>
                                </tr>
                            ) : orders.map(order => (
                                <tr key={order._id}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--navy)' }}>
                                            {order.user?.username}
                                        </div>
                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            {order.user?.email}
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                            {order.books?.map(b => b.book?.title).filter(Boolean).join(', ').slice(0, 50)}
                                            {order.books?.length > 1 && <span style={{ color: 'var(--cyan)' }}> (+{order.books.length - 1})</span>}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: 'var(--orange-red)' }}>
                                        ₹{order.totalAmount?.toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`badge ${order.status === 'completed' ? 'badge-success' : order.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AdminLayout>
    );
}

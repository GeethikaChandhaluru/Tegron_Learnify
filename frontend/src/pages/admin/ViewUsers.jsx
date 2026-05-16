import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from './AdminLayout';
import Loader from '../../components/Loader';
import { getAdminUsers } from '../../services/api';

export default function ViewUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getAdminUsers()
            .then(({ data }) => setUsers(data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <AdminLayout>
            <button className="back-btn" onClick={() => navigate('/admin')}>
                ← Back to Dashboard
            </button>
            <div className="admin-page-title">All Users</div>
            <div className="admin-page-subtitle">{users.length} registered users</div>

            <input
                style={{
                    width: '100%', maxWidth: 360, padding: '10px 16px', marginBottom: 20,
                    border: '2px solid var(--border-gray)', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.9rem', background: 'var(--light-gray)',
                }}
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            {loading ? <Loader /> : (
                <div className="table-wrap">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Avatar</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                        No users found
                                    </td>
                                </tr>
                            ) : filtered.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: '50%',
                                            background: 'linear-gradient(135deg,var(--cyan),var(--light-cyan))',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontFamily: 'Syne,sans-serif', fontWeight: 700,
                                            color: 'var(--navy)', fontSize: '0.9rem',
                                        }}>
                                            {user.username[0].toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--navy)' }}>{user.username}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                                    <td>
                                        <span className={`badge ${user.role === 'admin' ? 'badge-warning' : 'badge-success'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                                        {new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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

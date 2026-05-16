import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/ConfirmModal';

const navItems = [
    { label: 'Dashboard', icon: '📊', path: '/admin' },
    { label: 'Add Book', icon: '➕', path: '/admin/add-book' },
    { label: 'Manage Books', icon: '📚', path: '/admin/manage-books' },
    { label: 'View Users', icon: '👥', path: '/admin/users' },
    { label: 'View Orders', icon: '🧾', path: '/admin/orders' },
    { label: 'Payments', icon: '💳', path: '/admin/payments' },
];

export default function AdminLayout({ children }) {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [confirmLogout, setConfirmLogout] = useState(false);

    const doLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            <div className="admin-layout">
                <aside className="admin-sidebar">
                    <div className="admin-sidebar-logo">
                        Tegron <span>Admin</span>
                    </div>
                    <nav className="admin-nav">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`admin-nav-item ${pathname === item.path ? 'active' : ''}`}
                                onClick={() => navigate(item.path)}
                            >
                                <span>{item.icon}</span> {item.label}
                            </button>
                        ))}
                        <div className="admin-nav-spacer" />
                        <button
                            className="admin-nav-item danger"
                            onClick={() => setConfirmLogout(true)}
                        >
                            <span>🚪</span> Logout
                        </button>
                    </nav>
                </aside>
                <main className="admin-content">{children}</main>
            </div>

            {confirmLogout && (
                <ConfirmModal
                    icon="🚪"
                    title="Logout?"
                    message="Do you really want to logout from the Admin Panel?"
                    confirmText="Yes, Logout"
                    cancelText="No, Stay"
                    danger={false}
                    onConfirm={doLogout}
                    onCancel={() => setConfirmLogout(false)}
                />
            )}
        </>
    );
}
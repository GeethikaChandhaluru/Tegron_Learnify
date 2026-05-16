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
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [confirmLogout, setConfirmLogout] = useState(false);
    // ✅ NEW: Mobile sidebar open/close state
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const doLogout = () => {
        logout();
        navigate('/login');
    };

    const handleNavClick = (path) => {
        navigate(path);
        setSidebarOpen(false); // close sidebar after navigating on mobile
    };

    return (
        <>
            {/* ── Mobile Top Bar ────────────────────────────────────────── */}
            <div className="admin-mobile-topbar">
                <button
                    className="admin-hamburger"
                    onClick={() => setSidebarOpen(prev => !prev)}
                    aria-label="Toggle menu"
                >
                    {sidebarOpen ? '✕' : '☰'}
                </button>
                <span className="admin-mobile-logo">Tegron <span>Admin</span></span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="admin-mobile-avatar">
                        {(user?.username || 'A')[0].toUpperCase()}
                    </span>
                    <button
                        className="admin-mobile-logout"
                        onClick={() => setConfirmLogout(true)}
                    >
                        🚪
                    </button>
                </div>
            </div>

            {/* ── Sidebar overlay (mobile) ──────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="admin-sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="admin-layout">
                {/* ── Sidebar ───────────────────────────────────────────── */}
                <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="admin-sidebar-logo">
                        Tegron <span>Admin</span>
                    </div>
                    <nav className="admin-nav">
                        {navItems.map(item => (
                            <button
                                key={item.path}
                                className={`admin-nav-item ${pathname === item.path || pathname.startsWith(item.path + '/') ? 'active' : ''}`}
                                onClick={() => handleNavClick(item.path)}
                            >
                                <span>{item.icon}</span> {item.label}
                            </button>
                        ))}
                        <div className="admin-nav-spacer" />
                        <button
                            className="admin-nav-item danger"
                            onClick={() => { setSidebarOpen(false); setConfirmLogout(true); }}
                        >
                            <span>🚪</span> Logout
                        </button>
                    </nav>
                </aside>

                {/* ── Main content ──────────────────────────────────────── */}
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
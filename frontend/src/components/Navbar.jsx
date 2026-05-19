import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const BASE_URL = 'https://tegron-learnify.onrender.com';

// Handles base64 data URLs, absolute http URLs, and relative /uploads/... paths
const resolveAvatar = (profilePic) => {
  if (!profilePic) return null;
  if (profilePic.startsWith('data:') || profilePic.startsWith('http')) return profilePic;
  return `${BASE_URL}${profilePic}`;
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const avatarSrc = resolveAvatar(user?.profilePic);
  const initial = user?.username?.[0]?.toUpperCase() || '?';

  const AvatarImg = ({ size = 36 }) => (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: avatarSrc ? '#e2e8f0' : 'var(--cyan)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', flexShrink: 0,
      fontSize: size * 0.4, fontWeight: 800, color: '#fff',
    }}>
      {avatarSrc
        ? <img src={avatarSrc} alt="avatar"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerText = initial; }}
        />
        : initial
      }
    </div>
  );

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">

          {/* ── Hamburger LEFT (mobile only) ─────────────── */}
          {user && (
            <div
              className="navbar-hamburger navbar-hamburger--left"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <span /><span /><span />
            </div>
          )}

          {/* ── Logo ─────────────────────────────────────── */}
          <Link to="/" className="navbar-logo">
            Tegron<span>Notes</span>
          </Link>

          {/* ── Desktop Links ────────────────────────────── */}
          {user && (
            <ul className="navbar-links">
              <li>
                <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
                  🏠 Home
                </NavLink>
              </li>
              <li>
                <NavLink to="/purchased" className={({ isActive }) => isActive ? 'active' : ''}>
                  📚 My Books
                </NavLink>
              </li>
              <li>
                <NavLink to="/cart" className={({ isActive }) => isActive ? 'active' : ''}>
                  🛒 Cart
                  {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                </NavLink>
              </li>
            </ul>
          )}

          {/* ── Right Side ───────────────────────────────── */}
          <div className="navbar-right">
            {user ? (
              <>
                {/* Wallet Balance chip */}
                <div className="navbar-balance">
                  💰 ₹{(user.balance ?? 100).toFixed(2)}
                </div>

                {/* Profile avatar → profile page */}
                <div className="navbar-avatar" onClick={() => navigate('/profile')} title="My Profile">
                  <AvatarImg size={36} />
                </div>
              </>
            ) : (
              <>
                <button
                  className="btn btn-outline"
                  style={{ padding: '8px 20px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)', borderColor: 'rgba(255,255,255,0.2)' }}
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                  onClick={() => navigate('/signup')}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile Slide Sidebar ─────────────────────────── */}
      {user && (
        <>
          <div className={`sidebar-overlay${sidebarOpen ? ' open' : ''}`} onClick={closeSidebar} />

          <div className={`sidebar-mobile${sidebarOpen ? ' open' : ''}`}>
            <div className="sidebar-mobile-header">
              <div className="sidebar-mobile-user">
                <div className="sidebar-mobile-avatar">
                  <AvatarImg size={44} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{user.username}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem' }}>{user.email}</div>
                </div>
              </div>
              <div className="sidebar-mobile-balance">
                💰 ₹{(user.balance ?? 100).toFixed(2)}
              </div>
              <button className="sidebar-mobile-close" onClick={closeSidebar}>✕</button>
            </div>

            <nav className="sidebar-mobile-nav">
              <NavLink to="/" end onClick={closeSidebar} className={({ isActive }) => isActive ? 'active' : ''}>🏠 Home</NavLink>
              <NavLink to="/purchased" onClick={closeSidebar} className={({ isActive }) => isActive ? 'active' : ''}>📚 My Books</NavLink>
              <NavLink to="/cart" onClick={closeSidebar} className={({ isActive }) => isActive ? 'active' : ''}>🛒 Cart {cartCount > 0 && `(${cartCount})`}</NavLink>
              <NavLink to="/profile" onClick={closeSidebar} className={({ isActive }) => isActive ? 'active' : ''}>👤 My Profile</NavLink>
            </nav>

            <div className="sidebar-mobile-footer">
              <button
                className="btn btn-outline"
                style={{ width: '100%', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}
                onClick={() => { logout(); closeSidebar(); navigate('/login'); }}
              >
                🚪 Logout
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
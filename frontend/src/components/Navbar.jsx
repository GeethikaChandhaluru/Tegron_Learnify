import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  const { user } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          Tegron<span>Learnify</span>
        </Link>

        {/* Desktop nav links — centred */}
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

        {/* Right side */}
        <div className="navbar-right">
          {user ? (
            <ProfileDropdown />
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

          {/* Hamburger (mobile) */}
          {user && (
            <div className="navbar-hamburger" onClick={() => setMenuOpen(!menuOpen)}>
              <span /><span /><span />
            </div>
          )}
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && user && (
        <div className="mobile-menu">
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>🏠 Home</NavLink>
          <NavLink to="/purchased" onClick={() => setMenuOpen(false)}>📚 My Books</NavLink>
          <NavLink to="/cart" onClick={() => setMenuOpen(false)}>
            🛒 Cart {cartCount > 0 && `(${cartCount})`}
          </NavLink>
        </div>
      )}
    </nav>
  );
}

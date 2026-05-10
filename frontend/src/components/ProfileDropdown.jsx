import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ConfirmModal from './ConfirmModal';

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const { clearCartLocal } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doLogout = () => {
    logout();
    clearCartLocal();
    navigate('/login');
    setOpen(false);
    setConfirmLogout(false);
  };

  if (!user) return null;

  return (
    <>
      <div className="profile-dropdown" ref={ref}>
        <div className="profile-avatar" onClick={() => setOpen(!open)} title={user.username}>
          {user.username[0].toUpperCase()}
        </div>

        {open && (
          <div className="profile-menu">
            <div className="profile-menu-header">
              <div className="name">{user.username}</div>
              <div className="email">{user.email}</div>
            </div>
            <Link to="/" onClick={() => setOpen(false)}>
              <span>🏠</span> Home
            </Link>
            <Link to="/purchased" onClick={() => setOpen(false)}>
              <span>📚</span> My Books
            </Link>
            <Link to="/cart" onClick={() => setOpen(false)}>
              <span>🛒</span> Cart
            </Link>
            <button className="logout-btn" onClick={() => { setOpen(false); setConfirmLogout(true); }}>
              <span>🚪</span> Logout
            </button>
          </div>
        )}
      </div>

      {/* Logout confirmation modal */}
      {confirmLogout && (
        <ConfirmModal
          icon="🚪"
          title="Logout?"
          message="Are you sure you want to logout from Tegron Learnify?"
          confirmText="Yes, Logout"
          cancelText="Stay"
          danger={false}
          onConfirm={doLogout}
          onCancel={() => setConfirmLogout(false)}
        />
      )}
    </>
  );
}

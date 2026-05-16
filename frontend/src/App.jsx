import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Loader from './components/Loader';

// Auth pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';

// User pages
import Home from './pages/user/Home';
import BookDetails from './pages/user/BookDetails';
import CartPage from './pages/user/Cart';
import PurchasedBooks from './pages/user/PurchasedBooks';
import Wishlist from './pages/user/Wishlist';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AddBook from './pages/admin/AddBook';
import ManageBooks from './pages/admin/ManageBooks';
import ViewUsers from './pages/admin/ViewUsers';
import ViewOrders from './pages/admin/ViewOrders';
import Payments from './pages/admin/Payments';

import NotFound from './pages/NotFound';

// Guards
const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  return children;
};

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;

  if (user) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin' : '/'}
        replace
      />
    );
  }

  return children;
};

export default function App() {
  return (
    <Routes>

      {/* Auth */}
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />

      <Route
        path="/signup"
        element={
          <GuestOnly>
            <Signup />
          </GuestOnly>
        }
      />

      <Route
        path="/forgot-password"
        element={
          <GuestOnly>
            <ForgotPassword />
          </GuestOnly>
        }
      />

      {/* User */}
      <Route
        path="/"
        element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        }
      />

      <Route
        path="/books/:id"
        element={
          <RequireAuth>
            <BookDetails />
          </RequireAuth>
        }
      />

      <Route
        path="/cart"
        element={
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        }
      />

      <Route
        path="/purchased"
        element={
          <RequireAuth>
            <PurchasedBooks />
          </RequireAuth>
        }
      />

      <Route
        path="/wishlist"
        element={
          <RequireAuth>
            <Wishlist />
          </RequireAuth>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboard />
          </RequireAdmin>
        }
      />

      <Route
        path="/admin/add-book"
        element={
          <RequireAdmin>
            <AddBook />
          </RequireAdmin>
        }
      />

      <Route
        path="/admin/manage-books"
        element={
          <RequireAdmin>
            <ManageBooks />
          </RequireAdmin>
        }
      />

      <Route
        path="/admin/edit-book/:id"
        element={
          <RequireAdmin>
            <AddBook />
          </RequireAdmin>
        }
      />

      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <ViewUsers />
          </RequireAdmin>
        }
      />

      <Route
        path="/admin/orders"
        element={
          <RequireAdmin>
            <ViewOrders />
          </RequireAdmin>
        }
      />

      <Route
        path="/admin/payments"
        element={
          <RequireAdmin>
            <Payments />
          </RequireAdmin>
        }
      />

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}
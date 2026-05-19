import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, signup as apiSignup, getMe, updateProfile as apiUpdateProfile } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('tn_token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(({ data }) => setUser(data.data))
      .catch(() => localStorage.removeItem('tn_token'))
      .finally(() => setLoading(false));
  }, []);

  // login — calls API, stores token, sets user
  const login = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    localStorage.setItem('tn_token', data.data.token);
    setUser(data.data);
    toast.success(`Welcome back, ${data.data.username}! 👋`);
    return data.data;
  };

  // register — calls API, stores token, sets user
  const register = async (username, email, password) => {
    const { data } = await apiSignup({ username, email, password });
    localStorage.setItem('tn_token', data.data.token);
    setUser(data.data);
    toast.success('Account created! Welcome to Tegron Notes 📚 — ₹100 added to your wallet!');
    return data.data;
  };

  // logout — clears token and user state
  const logout = () => {
    localStorage.removeItem('tn_token');
    setUser(null);
    toast('Logged out. See you soon!', { icon: '👋' });
  };

  // Update balance locally after purchase (no re-fetch needed)
  const updateBalance = useCallback((newBalance) => {
    setUser((prev) => prev ? { ...prev, balance: newBalance } : prev);
  }, []);

  // Update user profile data locally
  const updateUser = useCallback((updates) => {
    setUser((prev) => prev ? { ...prev, ...updates } : prev);
  }, []);

  // Refresh user from API
  const refreshUser = useCallback(async () => {
    try {
      const { data } = await getMe();
      setUser(data.data);
    } catch { /* ignore */ }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateBalance, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
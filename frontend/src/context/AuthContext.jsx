import { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, signup as apiSignup, getMe } from '../services/api';
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
    toast.success('Account created! Welcome to Tegron Learnify 📚');
    return data.data;
  };

  // logout — clears token and user state
  const logout = () => {
    localStorage.removeItem('tn_token');
    setUser(null);
    toast('Logged out. See you soon!', { icon: '👋' });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

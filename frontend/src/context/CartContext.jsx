import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart as fetchCart, addToCart as apiAddToCart, removeFromCart as apiRemove } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart]       = useState(null);
  const [cartCount, setCount] = useState(0);

  const loadCart = useCallback(async () => {
    if (!user) { setCart(null); setCount(0); return; }
    try {
      const { data } = await fetchCart();
      setCart(data.data);
      setCount(data.data?.items?.length || 0);
    } catch {
      setCart(null); setCount(0);
    }
  }, [user]);

  useEffect(() => { loadCart(); }, [loadCart]);

  const addToCart = async (bookId) => {
    try {
      const { data } = await apiAddToCart(bookId);
      setCart(data.data);
      setCount(data.data?.items?.length || 0);
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  };

  const removeFromCart = async (bookId) => {
    try {
      const { data } = await apiRemove(bookId);
      setCart(data.data);
      setCount(data.data?.items?.length || 0);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const clearCartLocal = () => { setCart(null); setCount(0); };

  return (
    <CartContext.Provider value={{ cart, cartCount, loadCart, addToCart, removeFromCart, clearCartLocal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

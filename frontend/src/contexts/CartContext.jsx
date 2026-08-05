import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';

const CartContext = createContext(null);
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    const token = localStorage.getItem('ss_token');
    api.get('/cart', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setItems(res.data))
      .catch(() => setItems([]));
  }, [user]);

  const refresh = () => {
    if (!user) return;
    const token = localStorage.getItem('ss_token');
    return api.get('/cart', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setItems(res.data))
      .catch(() => setItems([]));
  };

  const add = async (product_id, quantity = 1) => {
    const token = localStorage.getItem('ss_token');
    await api.post('/cart/add', { product_id, quantity }, { headers: { Authorization: `Bearer ${token}` } });
    await refresh();
  };

  const update = async (id, quantity) => {
    const token = localStorage.getItem('ss_token');
    await api.put(`/cart/${id}?qty=${quantity}`, null, { headers: { Authorization: `Bearer ${token}` } });
    await refresh();
  };

  const remove = async (id) => {
    const token = localStorage.getItem('ss_token');
    await api.delete(`/cart/${id}`, { headers: { Authorization: `Bearer ${token}` } });
    await refresh();
  };

  const count = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const subtotal = items.reduce((sum, item) => sum + (item.quantity || 0) * (item.product?.price || 0), 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, add, update, remove, refresh }}>
      {children}
    </CartContext.Provider>
  );
}

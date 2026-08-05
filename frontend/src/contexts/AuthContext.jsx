import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ss_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api.defaults.headers.Authorization = `Bearer ${token}`;
    api.get('/auth/me')
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('ss_token');
        delete api.defaults.headers.Authorization;
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const token = response.data.token;
    localStorage.setItem('ss_token', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    const token = response.data.token;
    localStorage.setItem('ss_token', token);
    api.defaults.headers.Authorization = `Bearer ${token}`;
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem('ss_token');
    setUser(null);
    delete api.defaults.headers.Authorization;
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

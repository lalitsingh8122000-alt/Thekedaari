'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('thekedaar_token');
    const savedUser = localStorage.getItem('thekedaar_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
    }
    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    const res = await api.post('/auth/login', { phone, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('thekedaar_token', t);
    localStorage.setItem('thekedaar_user', JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    router.push('/dashboard');
  };

  const registerUser = async (name, phone, password, confirmPassword) => {
    const res = await api.post('/auth/register', { name, phone, password, confirmPassword });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('thekedaar_token', t);
    localStorage.setItem('thekedaar_user', JSON.stringify(u));
    api.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    router.push('/dashboard');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('thekedaar_token');
    localStorage.removeItem('thekedaar_user');
    delete api.defaults.headers.common['Authorization'];
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, registerUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

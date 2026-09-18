import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client, { setLogoutCallback } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      const t = await AsyncStorage.getItem('thekedaar_token');
      const u = await AsyncStorage.getItem('thekedaar_user');
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
      }
      setLoading(false);
    };
    restore();
  }, []);

  useEffect(() => {
    setLogoutCallback(() => {
      setToken(null);
      setUser(null);
    });
  }, []);

  const login = async (phone, password) => {
    const res = await client.post('/auth/login', { phone, password });
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('thekedaar_token', t);
    await AsyncStorage.setItem('thekedaar_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const register = async (name, phone, password, confirmPassword) => {
    const res = await client.post('/auth/register', { name, phone, password, confirmPassword });
    const { token: t, user: u } = res.data;
    await AsyncStorage.setItem('thekedaar_token', t);
    await AsyncStorage.setItem('thekedaar_user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('thekedaar_token');
    await AsyncStorage.removeItem('thekedaar_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import * as authService from '../services/auth.js';

const AuthContext = createContext();

const USER_KEY = 'mydrive:user';
const TOKEN_KEY = 'mydrive:token';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem(USER_KEY);
    return cached ? JSON.parse(cached) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [initializing, setInitializing] = useState(!!token && !user);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  }, [user]);

  useEffect(() => {
    const hydrate = async () => {
      if (!token || user) return;
      try {
        const { data } = await authService.me();
        setUser(data.user);
      } catch (error) {
        setToken(null);
      } finally {
        setInitializing(false);
      }
    };
    hydrate();
  }, [token, user]);

  const handleAuth = async (actionFn, payload) => {
    setLoading(true);
    try {
      const { data } = await actionFn(payload);
      setToken(data.token);
      setUser(data.user);
      toast.success('Welcome back!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Authentication failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = (payload) => handleAuth(authService.login, payload);
  const signup = (payload) => handleAuth(authService.signup, payload);

  const logout = () => {
    setToken(null);
    setUser(null);
    toast('Signed out');
  };

  const value = useMemo(
    () => ({ user, token, initializing, loading, login, signup, logout }),
    [user, token, initializing, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

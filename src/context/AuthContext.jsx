import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, login as apiLogin, register as apiRegister, googleLogin as apiGoogleLogin, logout as apiLogout } from '../api/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [tokens, setTokens] = useState(() => JSON.parse(localStorage.getItem('tokens') || 'null'));
  const [loading, setLoading] = useState(true);

  const saveAuth = useCallback((tokenData, userData) => {
    const t = { access: tokenData.access, refresh: tokenData.refresh };
    localStorage.setItem('tokens', JSON.stringify(t));
    localStorage.setItem('user', JSON.stringify(userData));
    setTokens(t);
    setUser(userData);
  }, []);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    setTokens(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await getCurrentUser();
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return data;
    } catch {
      clearAuth();
      return null;
    }
  }, [clearAuth]);

  useEffect(() => {
    if (tokens?.access) {
      fetchUser().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);// eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    const { data } = await apiLogin(email, password);
    const userRes = await getCurrentUser();
    saveAuth(data, userRes.data);
    return userRes.data;
  };

  const register = async (formData) => {
    const { data } = await apiRegister(formData);
    const userRes = await getCurrentUser();
    saveAuth(data, userRes.data);
    return userRes.data;
  };

  const googleLogin = async (code) => {
    const { data } = await apiGoogleLogin(code);
    const userRes = await getCurrentUser();
    saveAuth(data, userRes.data);
    return userRes.data;
  };

  const logout = async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, tokens, loading, login, register, googleLogin, logout, fetchUser, isAuthenticated: !!tokens?.access }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

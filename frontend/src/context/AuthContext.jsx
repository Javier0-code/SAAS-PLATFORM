import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '@services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]                       = useState(null);
  const [isLoading, setIsLoading]             = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const refreshTimerRef = useRef(null);

  const storeTokens = (accessToken, refreshToken) => {
    if (accessToken)  localStorage.setItem('access_token',  accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const scheduleTokenRefresh = useCallback((accessToken) => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    try {
      const payload  = JSON.parse(atob(accessToken.split('.')[1]));
      const refreshAt = (payload.exp * 1000) - Date.now() - 60_000;
      if (refreshAt > 0) {
        refreshTimerRef.current = setTimeout(async () => {
          const stored = localStorage.getItem('refresh_token');
          if (!stored) return;
          try {
            const res = await authService.refresh(stored);
            storeTokens(res.data.accessToken, res.data.refreshToken);
            scheduleTokenRefresh(res.data.accessToken);
          } catch {
            logout();
          }
        }, refreshAt);
      }
    } catch (_) {}
  }, []);

  // Verificar sesión al montar
  useEffect(() => {
    const initAuth = async () => {
      const stored = localStorage.getItem('access_token');
      if (!stored) { setIsLoading(false); return; }
      try {
        const res = await authService.getMe();
        setUser(res.data.user);
        setIsAuthenticated(true);
        scheduleTokenRefresh(stored);
      } catch {
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
    return () => { if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current); };
  }, []);

  const login = useCallback((userData, tokens) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (tokens) {
      storeTokens(tokens.accessToken, tokens.refreshToken);
      if (tokens.accessToken) scheduleTokenRefresh(tokens.accessToken);
    }
  }, [scheduleTokenRefresh]);

  const logout = useCallback(async () => {
    try { await authService.logout(); } catch (_) {}
    clearTokens();
    setUser(null);
    setIsAuthenticated(false);
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  }, []);

  const loginWithEmail = useCallback(async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: u, accessToken, refreshToken } = res.data;
    login(u, { accessToken, refreshToken });
    return u;
  }, [login]);

  const registerWithEmail = useCallback(async (name, email, password) => {
    const res = await authService.register({ name, email, password });
    const { user: u, accessToken, refreshToken } = res.data;
    login(u, { accessToken, refreshToken });
    return u;
  }, [login]);

  const updateProfile = useCallback(async (data) => {
    const res = await authService.updateMe(data);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading, isAuthenticated,
      login, logout, loginWithEmail, registerWithEmail, updateProfile, setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;

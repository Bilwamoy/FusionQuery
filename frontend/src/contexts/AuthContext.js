'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth as authApi } from '@/lib/api';

const AuthContext = createContext(null);

const PUBLIC_PATHS = ['/login', '/auth/callback'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Hydrate user from localStorage on mount, then verify with backend
  useEffect(() => {
    const stored = authApi.getUser();
    const token = authApi.getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    // Optimistically set stored user while we verify
    if (stored) setUser(stored);

    authApi.me()
      .then((freshUser) => {
        setUser(freshUser);
        // Keep localStorage in sync
        localStorage.setItem('collabmind_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        // Token expired / invalid — clear everything
        authApi.logout();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Redirect unauthenticated users away from protected pages
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!user && !isPublic) {
      router.replace('/login');
    }
  }, [user, loading, pathname, router]);

  const login = useCallback(async ({ email, password }) => {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async ({ email, name, password }) => {
    const data = await authApi.register({ email, name, password });
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  // After OAuth callback stores token, re-sync user into context
  const syncFromStorage = useCallback(() => {
    const stored = authApi.getUser();
    if (stored) setUser(stored);
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, syncFromStorage, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

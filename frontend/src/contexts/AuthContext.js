'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { auth as authApi } from '@/lib/api';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext(null);

const PUBLIC_PATHS = ['/login', '/signup', '/shared'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedUser = authApi.getUser();
    const token = authApi.getToken();

    if (savedUser && token) {
      setUser(savedUser);
      // Verify token is still valid
      authApi.me()
        .then(u => setUser(u))
        .catch(() => {
          setUser(null);
          const isPublic = PUBLIC_PATHS.some(p => pathname?.startsWith(p));
          if (!isPublic) router.push('/login');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
      const isPublic = PUBLIC_PATHS.some(p => pathname?.startsWith(p));
      if (!isPublic && pathname !== '/login') {
        router.push('/login');
      }
    }
  }, []);

  const login = async (email, password) => {
    const data = await authApi.login({ email, password });
    setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await authApi.register({ name, email, password });
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

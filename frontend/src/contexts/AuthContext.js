'use client';

import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Auth bypassed — no login/signup required for now
const MOCK_USER = { id: 'guest', name: 'Guest User', email: 'guest@example.com' };

export function AuthProvider({ children }) {
  const [user] = useState(MOCK_USER);

  const login = async () => ({ user: MOCK_USER });
  const register = async () => ({ user: MOCK_USER });
  const logout = () => {};

  return (
    <AuthContext.Provider value={{ user, loading: false, login, register, logout, isAuthenticated: true }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

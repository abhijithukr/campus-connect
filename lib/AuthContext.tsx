'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, getToken, setToken, removeToken, getUser, setUser, removeUser } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'organizer' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: string; organization?: string }) => Promise<void>;
  logout: () => void;
  isOrganizer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth on mount
    const storedToken = getToken();
    const storedUser = getUser();
    
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authAPI.login({ email, password });
    setToken(response.token);
    setUser(response.user);
    setTokenState(response.token);
    setUserState(response.user);
  };

  const register = async (data: { name: string; email: string; password: string; role?: string; organization?: string }) => {
    const response = await authAPI.register(data);
    setToken(response.token);
    setUser(response.user);
    setTokenState(response.token);
    setUserState(response.user);
  };

  const logout = () => {
    removeToken();
    removeUser();
    setTokenState(null);
    setUserState(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isOrganizer: user?.role === 'organizer' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

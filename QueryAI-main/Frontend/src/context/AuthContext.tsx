import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types';

const API_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      // Backend returns this when user is not logged in
      if (data.authenticated === false) {
        setUser(null);
        return;
      }

      // Support either:
      // { authenticated: true, user: {...} }
      // OR
      // { authenticated: true, name, email, ... }
      const backendUser = data.user ?? data;

      setUser({
        name: backendUser.name ?? backendUser.full_name ?? 'User',
        email: backendUser.email ?? '',
        avatarUrl:
          backendUser.avatarUrl ??
          backendUser.picture ??
          backendUser.profile_picture ??
          '',
      });
    } catch (error) {
      console.error('Authentication check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = () => {
    window.location.href = `${API_URL}/auth/google/login`;
  };

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'GET',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
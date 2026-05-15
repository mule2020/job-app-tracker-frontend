import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthUser } from '../types/auth.types';
import { logoutApi } from '../api/auth.api';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (accessToken: string, refreshToken: string, user: AuthUser) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rehydrate on page refresh
  useEffect(() => {
    const savedUser  = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const setAuth = (accessToken: string, refreshToken: string, newUser: AuthUser) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = async () => {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (storedRefresh) {
      try { await logoutApi(storedRefresh); } catch { /* ignore */ }
    }
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      setAuth,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'patient' | 'admin';
  avatar?: string;
  specialty?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  loginWithCredentials: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token and get user profile
    const token = localStorage.getItem('app4doctor_token');
    if (token) {
      authAPI.getProfile()
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('app4doctor_token');
          localStorage.removeItem('app4doctor_user');
        });
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('app4doctor_user', JSON.stringify(userData));
  };

  const loginWithCredentials = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('app4doctor_token', token);
      localStorage.setItem('app4doctor_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('app4doctor_token');
    localStorage.removeItem('app4doctor_user');
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('app4doctor_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithCredentials, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
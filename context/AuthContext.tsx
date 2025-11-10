'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createToken, verifyToken, getToken, saveToken, removeToken, getUserFromToken } from '@/lib/jwt';

export interface User {
  id?: string;
  userId?: string;
  email: string;
  name: string;
  phone?: string;
  role?: 'user' | 'admin';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      const payload = verifyToken(token);
      if (payload) {
        // Try to fetch user from API, fallback to token payload
        fetchUserData(payload.userId || payload.email)
          .then((userData) => {
            if (userData) {
              setUser(userData);
            } else {
              // Fallback to token data
              setUser({
                id: payload.userId,
                userId: payload.userId,
                email: payload.email,
                name: payload.name || '',
                role: (payload.role === 'admin' || payload.role === 'user') ? payload.role : 'user',
              });
            }
          })
          .catch(() => {
            // Fallback to token data
            setUser({
              id: payload.userId,
              userId: payload.userId,
              email: payload.email,
              name: payload.name || '',
              role: (payload.role === 'admin' || payload.role === 'user') ? payload.role : 'user',
            });
          });
      } else {
        removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const fetchUserData = async (userIdOrEmail: string): Promise<User | null> => {
    try {
      // Try to fetch user by ID first, then by email
      const response = await fetch(`/api/users/${userIdOrEmail}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return {
            id: data.data._id,
            userId: data.data._id,
            email: data.data.email,
            name: data.data.name,
            phone: data.data.phone,
            role: data.data.role,
          };
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
    return null;
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Invalid email or password' };
      }

      // Save token
      saveToken(data.data.token);
      
      // Set user
      setUser({
        id: data.data.user.id,
        userId: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.name,
        role: data.data.user.role,
      });

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate password
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (!data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      // Save token
      saveToken(data.data.token);
      
      // Set user
      setUser({
        id: data.data.user.id,
        userId: data.data.user.id,
        email: data.data.user.email,
        name: data.data.user.name,
        role: data.data.user.role,
        phone,
      });

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const updateUser = async (userData: Partial<User>) => {
    if (user && user.id) {
      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        });

        const data = await response.json();
        if (data.success) {
          setUser({ ...user, ...userData });
        }
      } catch (error) {
        console.error('Error updating user:', error);
        // Still update locally on error
        setUser({ ...user, ...userData });
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


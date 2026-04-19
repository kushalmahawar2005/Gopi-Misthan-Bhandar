'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getToken, saveToken, removeToken } from '@/lib/jwt';
import { useSession, signOut as nextAuthSignOut } from 'next-auth/react';

export interface User {
  id?: string;
  userId?: string;
  email: string;
  name: string;
  phone?: string;
  role?: 'user' | 'admin';
  addresses?: {
    type?: 'home' | 'work' | 'other';
    street: string;
    city: string;
    state: string;
    pincode?: string;
  }[];
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
  updateUser: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ...

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from token or session
  useEffect(() => {
    const initAuth = async () => {
      // 1. Check NextAuth Session (Google Login)
      if (session?.user) {
        setUser({
          id: (session.user as any).id, // Cast because we extended the session type in route.ts but typescript might not know here without types
          userId: (session.user as any).id,
          email: session.user.email || '',
          name: session.user.name || '',
          role: (session.user as any).role || 'user',
          // Google login doesn't usually give these, but we could fetch from DB if needed
        });
        setIsLoading(false);
        return;
      }

      // 2. Check Custom Token (Email/Pass Login)
      const token = getToken();
      if (token) {
        try {
          const userData = await fetchUserData();
          if (userData) {
            setUser(userData);
          } else {
            removeToken();
            await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
            setUser(null);
          }
        } catch (error) {
          removeToken();
          await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [session]);

  const fetchUserData = async (): Promise<User | null> => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const primaryAddress = Array.isArray(data.data.addresses) && data.data.addresses.length > 0
            ? data.data.addresses[0]
            : null;

          return {
            id: data.data._id,
            userId: data.data._id,
            email: data.data.email,
            name: data.data.name,
            phone: data.data.phone,
            role: data.data.role,
            addresses: data.data.addresses || [],
            address: primaryAddress?.street || '',
            city: primaryAddress?.city || '',
            state: primaryAddress?.state || '',
            pincode: primaryAddress?.pincode || '',
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
    fetch('/api/auth/logout', { method: 'POST' }).catch(console.error);
    nextAuthSignOut({ redirect: false });
    setUser(null);
  };


  const updateUser = async (userData: Partial<User>): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'Please login to update profile' };
    }

    try {
      const payload: any = {};

      if (userData.name !== undefined) payload.name = userData.name;
      if (userData.phone !== undefined) payload.phone = userData.phone;

      if (Array.isArray(userData.addresses)) {
        payload.addresses = userData.addresses;
      } else if (
        userData.address !== undefined ||
        userData.city !== undefined ||
        userData.state !== undefined ||
        userData.pincode !== undefined
      ) {
        payload.address = userData.address || '';
        payload.city = userData.city || '';
        payload.state = userData.state || '';
        payload.pincode = userData.pincode || '';
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }

      const primaryAddress = Array.isArray(data.data.addresses) && data.data.addresses.length > 0
        ? data.data.addresses[0]
        : null;

      setUser((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          id: data.data._id,
          userId: data.data._id,
          email: data.data.email,
          name: data.data.name,
          phone: data.data.phone,
          role: data.data.role,
          addresses: data.data.addresses || [],
          address: primaryAddress?.street || '',
          city: primaryAddress?.city || '',
          state: primaryAddress?.state || '',
          pincode: primaryAddress?.pincode || '',
        };
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error updating user:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
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


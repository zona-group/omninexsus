import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('omni_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const mockUsers = JSON.parse(localStorage.getItem('omni_users') || '[]');
    const foundUser = mockUsers.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('omni_user', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const loginWithGoogle = async (): Promise<boolean> => {
    const mockUser: User = {
      id: 'google_' + Date.now(),
      email: 'user@gmail.com',
      name: 'Google User',
      avatar: 'https://ui-avatars.com/api/?name=Google+User&background=6366f1&color=fff',
      createdAt: new Date().toISOString(),
      preferences: {
        language: 'en',
        notifications: true,
        theme: 'dark'
      }
    };
    setUser(mockUser);
    localStorage.setItem('omni_user', JSON.stringify(mockUser));
    return true;
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    const mockUsers = JSON.parse(localStorage.getItem('omni_users') || '[]');
    
    if (mockUsers.some((u: any) => u.email === email)) {
      return false;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      email,
      password,
      name,
      createdAt: new Date().toISOString(),
      preferences: {
        language: 'en',
        notifications: true,
        theme: 'dark'
      }
    };

    mockUsers.push(newUser);
    localStorage.setItem('omni_users', JSON.stringify(mockUsers));

    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword as User);
    localStorage.setItem('omni_user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('omni_user');
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    const mockUsers = JSON.parse(localStorage.getItem('omni_users') || '[]');
    const foundUser = mockUsers.find((u: any) => u.email === email);
    
    if (foundUser) {
      const resetToken = 'reset_' + Date.now();
      localStorage.setItem('omni_reset_token', JSON.stringify({ email, token: resetToken }));
      return true;
    }
    return false;
  };

  const resetPassword = async (token: string, newPassword: string): Promise<boolean> => {
    const resetData = JSON.parse(localStorage.getItem('omni_reset_token') || '{}');
    
    if (resetData.token === token) {
      const mockUsers = JSON.parse(localStorage.getItem('omni_users') || '[]');
      const userIndex = mockUsers.findIndex((u: any) => u.email === resetData.email);
      
      if (userIndex !== -1) {
        mockUsers[userIndex].password = newPassword;
        localStorage.setItem('omni_users', JSON.stringify(mockUsers));
        localStorage.removeItem('omni_reset_token');
        return true;
      }
    }
    return false;
  };

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('omni_user', JSON.stringify(updatedUser));
      
      const mockUsers = JSON.parse(localStorage.getItem('omni_users') || '[]');
      const userIndex = mockUsers.findIndex((u: any) => u.id === user.id);
      if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], ...data };
        localStorage.setItem('omni_users', JSON.stringify(mockUsers));
      }
      return true;
    }
    return false;
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (user) {
      const mockUsers = JSON.parse(localStorage.getItem('omni_users') || '[]');
      const userIndex = mockUsers.findIndex((u: any) => u.id === user.id && u.password === currentPassword);
      
      if (userIndex !== -1) {
        mockUsers[userIndex].password = newPassword;
        localStorage.setItem('omni_users', JSON.stringify(mockUsers));
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      register,
      logout,
      forgotPassword,
      resetPassword,
      updateProfile,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

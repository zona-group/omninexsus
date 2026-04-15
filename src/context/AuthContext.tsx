import React, { createContext, useContext, useState } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => void
  logout: () => void
  register: (name: string, email: string, password: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)

  const login = (email: string, password: string) => {
    // Mock login
    setUser({
      id: '1',
      name: 'User',
      email,
      role: 'user',
    })
  }

  const logout = () => {
    setUser(null)
  }

  const register = (name: string, email: string, password: string) => {
    setUser({
      id: '1',
      name,
      email,
      role: 'user',
    })
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
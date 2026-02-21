import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppRole = 'renter' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role: AppRole; // 🔥 make role REQUIRED
}

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  token: string | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: AppRole
  ) => Promise<{ error: Error | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- SIGN UP ---------------- */
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    selectedRole: AppRole
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');

      // 🔥 Force role into user object
      const userWithRole: User = {
        ...data.user,
        role: data.user.role || selectedRole,
      };

      setUser(userWithRole);
      setRole(userWithRole.role);
      setToken(data.token);

      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('role', userWithRole.role);
      localStorage.setItem('token', data.token);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGN IN ---------------- */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      const userWithRole: User = {
        ...data.user,
        role: data.user.role,
      };

      setUser(userWithRole);
      setRole(userWithRole.role);
      setToken(data.token);

      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('role', userWithRole.role);
      localStorage.setItem('token', data.token);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SIGN OUT ---------------- */
  const signOut = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('token');
  };

  /* ---------------- RESTORE SESSION ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      const parsedUser: User = JSON.parse(storedUser);
      setUser(parsedUser);
      setRole(parsedUser.role);
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        loading,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
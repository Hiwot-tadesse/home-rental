import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppRole = 'renter' | 'owner' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: AppRole;
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
  const [token, setToken] = useState<string | null>(null); // ✅ ADDED
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

      setUser(data.user);
      setRole(data.user.role || selectedRole);
      setToken(data.token); 

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role || selectedRole);
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

      setUser(data.user);
      setRole(data.user.role);
      setToken(data.token); // ✅

      localStorage.setItem('user', JSON.stringify(data.user));
      localStorage.setItem('role', data.user.role);
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
    localStorage.clear();
  };

  /* ---------------- RESTORE SESSION ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedRole && storedToken) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole as AppRole);
      setToken(storedToken);
    }

    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,     // ✅ EXPOSED
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

// src/hooks/useUsers.ts
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = 'http://localhost:5000/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'renter' | 'owner' | 'admin';
  createdAt: string;
}

export function useAdminUsers() {
  const { token, role } = useAuth();

  return useQuery({
    queryKey: ['admin-users'],
    enabled: role === 'admin',
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!res.ok) {
        // Try to get error message from backend
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch users');
      }
      
      const data = await res.json();
      // Extract users array from { success: true, users: [...] }
      return data.users; 
    },
  });
}
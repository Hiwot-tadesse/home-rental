// src/hooks/useProperties.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  location: string;
  city: string;
  price: number; // Ethiopian Birr (ETB)
  rooms: number;
  bathrooms: number | null;
  area_sqft: number | null;
  images: string[];
  status: 'pending' | 'approved' | 'rejected' | 'rented';
  created_at: string;
  updated_at: string;
}

/* =========================================================
   PUBLIC / MARKETPLACE PROPERTIES
   - Renters & Owners → approved only
   - Admin → all houses
========================================================= */
export function useProperties() {
  const { role, token } = useAuth();

  return useQuery({
    queryKey: ['properties', role],
    queryFn: async () => {
      let url = `${API_URL}/houses?status=approved`;
      let headers: HeadersInit = {};

      if (role === 'admin') {
        url = `${API_URL}/admin/houses`;
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch(url, { headers });

      if (!res.ok) {
        throw new Error('Failed to fetch properties');
      }

      const data = await res.json();
      return Array.isArray(data) ? data : data.houses || [];
    },
  });
}

/* =========================================================
   OWNER PROPERTIES (MY HOUSES)
========================================================= */
export function useOwnerProperties() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['owner-properties'],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/houses/my-houses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch your properties');

      const data = await res.json();
      return Array.isArray(data) ? data : data.houses || [];
    },
  });
}

/* =========================================================
   ADMIN PROPERTIES (MODERATION)
========================================================= */
export function useAdminProperties() {
  const { token, role } = useAuth();

  return useQuery({
    queryKey: ['admin-properties'],
    enabled: role === 'admin',
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/houses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Admin access denied');

      const data = await res.json();
      return data.houses || [];
    },
  });
}

/* =========================================================
   CREATE PROPERTY
========================================================= */
export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (
      property: Omit<Property, 'id' | 'owner_id' | 'status' | 'created_at' | 'updated_at'>
    ) => {
      const res = await fetch(`${API_URL}/houses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(property),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create property');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      // ✅ Invalidate public properties cache so new approved properties appear immediately
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('House submitted for approval!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create house');
    },
  });
}

/* =========================================================
   ADMIN APPROVE / REJECT
========================================================= */
export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const endpoint =
        status === 'approved'
          ? `${API_URL}/admin/houses/${id}/approve`
          : `${API_URL}/admin/houses/${id}/reject`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to update house status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      // ✅ Critical: Refresh public properties when admin approves/rejects
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('House status updated');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

/* =========================================================
   OWNER UPDATE PROPERTY
========================================================= */
export function useUpdateOwnerProperty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Property> }) => {
      const res = await fetch(`${API_URL}/houses/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update house');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      // ✅ Refresh public properties if owner updates an approved property
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('House updated successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

/* =========================================================
   DELETE PROPERTY
========================================================= */
export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const { token, role } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const url =
        role === 'admin'
          ? `${API_URL}/admin/houses/${id}`
          : `${API_URL}/houses/${id}`;

      const res = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to delete house');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      // ✅ Refresh public properties when property is deleted
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('House deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });
}
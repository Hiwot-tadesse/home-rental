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
  price: number;
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
========================================================= */
export function useProperties() {
  const { role, token } = useAuth();

  return useQuery<Property[]>({
    queryKey: ['properties', role],
    queryFn: async () => {
      let url = `${API_URL}/houses?status=approved`;
      let headers: HeadersInit = {};

      if (role === 'admin') {
        url = `${API_URL}/admin/houses`;
        headers = { Authorization: `Bearer ${token}` };
      }

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error('Failed to fetch properties');

      const data = await res.json();
      return Array.isArray(data) ? data : data.houses || [];
    },
  });
}

/* =========================================================
   OWNER PROPERTIES
========================================================= */
export function useOwnerProperties() {
  const { token, user } = useAuth();

  return useQuery<Property[]>({
    queryKey: ['owner-properties'],
    enabled: !!user,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/houses/my-houses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to fetch your properties');

      const data = await res.json();
      return Array.isArray(data) ? data : data.houses || [];
    },
  });
}

/* =========================================================
   ADMIN PROPERTIES
========================================================= */
export function useAdminProperties() {
  const { token, role } = useAuth();

  return useQuery<Property[]>({
    queryKey: ['admin-properties'],
    enabled: role === 'admin',
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/houses`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Admin access denied');

      const data = await res.json();
      return data.houses || [];
    },
  });
}

/* =========================================================
   CREATE PROPERTY (FormData supported)
========================================================= */
export function useCreateProperty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (property: FormData) => {
      const res = await fetch(`${API_URL}/houses`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: property, // FormData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create property');
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('House submitted for approval!');
    },
    onError: (err: any) => toast.error(err.message),
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to update house status');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates),
      });

      if (!res.ok) throw new Error('Failed to update house');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
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
      const url = role === 'admin' ? `${API_URL}/admin/houses/${id}` : `${API_URL}/houses/${id}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete house');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin-properties'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('House deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });
}
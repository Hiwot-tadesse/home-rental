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

/* ----------------------------------
   PUBLIC (RENTERS) – APPROVED HOUSES ONLY
   Backend: GET /api/houses
-----------------------------------*/
export function useProperties() {
  return useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/houses`);
      if (!res.ok) throw new Error('Failed to fetch properties');
      return res.json();
    },
  });
}

/* ----------------------------------
   OWNER – OWN HOUSES
   Backend: GET /api/houses/my-houses
-----------------------------------*/
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
      return res.json();
    },
  });
}

/* ----------------------------------
   ADMIN – ALL HOUSES
   Backend: GET /api/admin/houses (NOT /api/houses/admin)
-----------------------------------*/
export function useAdminProperties() {
  const { token, role } = useAuth();

  return useQuery({
    queryKey: ['admin-properties'],
    enabled: role === 'admin',
    queryFn: async () => {
      const res = await fetch(`${API_URL}/admin/houses`, { // ✅ CORRECTED PATH
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Admin access denied');
      const data = await res.json();
      // Handle your backend's response format: { success: true, houses: [...] }
      return data.houses || data; 
    },
  });
}

/* ----------------------------------
   CREATE HOUSE (OWNER)
   Backend: POST /api/houses
-----------------------------------*/
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
      toast.success('House submitted for approval!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create house');
    },
  });
}

/* ----------------------------------
   UPDATE STATUS (ADMIN ONLY)
   Backend: PATCH /api/admin/houses/:id/approve or /reject
-----------------------------------*/
export function useUpdateProperty() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const endpoint =
        status === 'approved'
          ? `${API_URL}/admin/houses/${id}/approve` // ✅ CORRECTED PATH
          : `${API_URL}/admin/houses/${id}/reject`; // ✅ CORRECTED PATH

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
      toast.success('House status updated');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

/* ----------------------------------
   UPDATE OWN HOUSE (OWNER)
   Backend: PATCH /api/houses/:id
-----------------------------------*/
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
      toast.success('House updated successfully');
    },
    onError: (err: any) => toast.error(err.message),
  });
}

/* ----------------------------------
   DELETE HOUSE (OWNER OR ADMIN)
   Backend: DELETE /api/houses/:id (for owners) OR /api/admin/houses/:id (for admins)
-----------------------------------*/
export function useDeleteProperty() {
  const queryClient = useQueryClient();
  const { token, role } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      // Use different endpoints based on role
      const url = role === 'admin' 
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
      toast.success('House deleted');
    },
    onError: (err: any) => toast.error(err.message),
  });
}
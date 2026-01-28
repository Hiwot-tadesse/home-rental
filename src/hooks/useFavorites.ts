// src/hooks/useFavorites.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Property } from './useProperties';

const API_URL = 'http://localhost:5000/api';

export function useFavoriteProperties() {
  const { user, token } = useAuth();

  return useQuery({
    queryKey: ['favorite-properties', user?.id],
    enabled: !!user && !!token,
    queryFn: async (): Promise<Property[]> => {
      const res = await fetch(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 404) return [];
        throw new Error('Failed to load favorites');
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user, token } = useAuth();

  return useMutation({
    mutationFn: async ({
      propertyId,
      isFavorited,
    }: {
      propertyId: string;
      isFavorited: boolean;
    }) => {
      if (!token || !user) throw new Error('Not authenticated');

      const method = isFavorited ? 'DELETE' : 'POST';
      const url = `${API_URL}/favorites/${propertyId}`;

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Operation failed');
      }
    },
    onSuccess: (_, { propertyId, isFavorited }) => {
      // ✅ Invalidate with full query key
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: ['favorite-properties', user.id],
        });
      }
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update favorites');
    },
  });
}
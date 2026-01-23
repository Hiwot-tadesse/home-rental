import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { Property } from './useProperties';

const API_URL = 'http://localhost:5000/api';

export function useFavoriteProperties() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['favorite-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const res = await fetch(`${API_URL}/favorites`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (!res.ok) throw new Error('Failed to fetch favorites');
      
      const data = await res.json();
      // ✅ Extract favorites array from { success: true, favorites: [...] }
      return data.favorites || []; 
    },
    enabled: !!user,
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ propertyId, isFavorited }: { propertyId: string; isFavorited: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      
      const token = localStorage.getItem('token');
      
      if (isFavorited) {
        // Remove from favorites
        const res = await fetch(`${API_URL}/favorites/${propertyId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to remove from favorites');
      } else {
        // Add to favorites
        const res = await fetch(`${API_URL}/favorites/${propertyId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) throw new Error('Failed to add to favorites');
      }
    },
    onSuccess: (_, { isFavorited }) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-properties'] });
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    },
    onError: (error) => {
      toast.error('Failed to update favorites: ' + error.message);
    },
  });
}
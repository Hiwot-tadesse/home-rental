// src/hooks/useBookings.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const API_URL = 'http://localhost:5000/api';

export interface Booking {
  id: string;
  property_id: string;
  renter_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  createdAt: string;
  updatedAt: string;
  property?: {
    id: string;
    title: string;
    city: string;
    price: number;
    images: string[];
    owner_id: string;
  };
  renter?: {
    id: string;
    fullName: string;
    email: string;
  };
}

export function useAdminBookings() {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['admin-bookings'],
    enabled: !!token,
    queryFn: async (): Promise<Booking[]> => {
      const res = await fetch(`${API_URL}/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error('Failed to fetch bookings');
      }

      const data = await res.json();
      return data.bookings || [];
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`${API_URL}/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update booking');
      }

      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
      if (data?.deleted) {
        toast.success('Booking rejected and removed');
      } else {
        toast.success('Booking approved! Owner notified.');
      }
    },
    onError: (error: any) => {
      toast.error('Failed to update booking: ' + (error.message || 'Unknown error'));
    },
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async (houseId: string) => {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ houseId }),
      });

      if (!res.ok) throw new Error('Failed to create booking');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking request sent! Owner will contact you soon.');
    },
    onError: (error: any) => {
      toast.error('Failed to book property: ' + (error.message || 'Unknown error'));
    },
  });
}
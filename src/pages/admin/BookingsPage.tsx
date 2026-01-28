import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminBookings, useUpdateBooking } from '@/hooks/useBookings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, Home, User } from 'lucide-react';
import { toast } from 'sonner';

export default function BookingsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: bookings, isLoading, isError, error } = useAdminBookings();
  const updateBooking = useUpdateBooking();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  const handleApprove = async (id: string) => {
    try {
      await updateBooking.mutateAsync({ id, status: 'approved' });
    } catch (err) {
    }
  };

  const handleReject = async (id: string) => {
    try {
      await updateBooking.mutateAsync({ id, status: 'rejected' });
    } catch (err) {
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
          <h2 className="text-xl font-bold text-destructive">Failed to load bookings</h2>
          <p className="text-muted-foreground mt-2">Please try again later.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Retry
          </Button>
        </div>
      </Layout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">Booking Requests</h1>
          <p className="text-muted-foreground">Manage rental requests from users</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings ({bookings?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings?.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No booking requests yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {bookings.map((booking) => (
                  <div key={booking.id} className="p-4 border rounded-lg hover:bg-muted/30">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0">
                            {booking.property?.images?.[0] ? (
                              <img 
                                src={booking.property.images[0]} 
                                alt={booking.property.title}
                                className="w-full h-full object-cover rounded-md"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Home className="h-5 w-5 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium">{booking.property?.title || 'Property'}</h3>
                            <p className="text-sm text-muted-foreground">
                              {booking.property?.city} • {booking.property?.price ? formatPrice(booking.property.price) : 'N/A'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {booking.renter?.fullName || 'Unknown Renter'}
                            {booking.renter?.email && (
                              <span className="text-muted-foreground ml-1">({booking.renter.email})</span>
                            )}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mt-2">
                          Requested on: {new Date(booking.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        <Badge className={
                          booking.status === 'approved' ? 'bg-green-100 text-green-800' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>

                        {booking.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApprove(booking.id)}
                              disabled={updateBooking.isPending}
                            >
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleReject(booking.id)}
                              disabled={updateBooking.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
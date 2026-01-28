// src/pages/admin/PropertiesPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { 
  useAdminProperties, 
  useUpdateProperty, 
  useDeleteProperty 
} from '@/hooks/useProperties';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, Home, MapPin, DollarSign, Bed, CheckCircle, XCircle, Trash2, Clock, Key, User
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
  rented: { label: 'Rented', icon: Key, className: 'bg-blue-100 text-blue-800' },
};

export default function PropertiesPage() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: properties, isLoading, refetch } = useAdminProperties();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/auth');
    }
  }, [user, role, authLoading, navigate]);

  const handleApprove = async (id: string) => {
    await updateProperty.mutateAsync({ id, status: 'approved' });
    toast.success('Property approved!');
    refetch();
  };

  const handleReject = async (id: string) => {
    await updateProperty.mutateAsync({ id, status: 'rejected' });
    toast.success('Property rejected');
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      await deleteProperty.mutateAsync(id);
      toast.success('Property deleted');
      refetch();
    }
  };

  // Format price in Ethiopian Birr (ETB)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(price);
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

  return (
    <Layout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold">All Properties</h1>
          <p className="text-muted-foreground">Manage rental listings on the platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Property Listings</CardTitle>
          </CardHeader>
          <CardContent>
            {properties?.length === 0 ? (
              <div className="text-center py-12">
                <Home className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No properties listed yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {properties.map((property) => {
                  const status = statusConfig[property.status as keyof typeof statusConfig];
                  return (
                    <div key={property.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        <div className="w-full md:w-40 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          {property.images && property.images[0] ? (
                            <img 
                              src={property.images[0]} 
                              alt={property.title} 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Home className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-3">
                            <h3 className="font-semibold text-lg truncate">{property.title}</h3>
                            <Badge className={status.className}>
                              {status.label}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {property.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {formatPrice(property.price)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Bed className="h-4 w-4" />
                              {property.rooms} rooms
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              Owner: {property.owner_id?.substring(0, 8)}...
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {property.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => handleApprove(property.id)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleReject(property.id)}>
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDelete(property.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
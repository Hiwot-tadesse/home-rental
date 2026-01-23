import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // ✅ Added Link import
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminProperties, useUpdateProperty, useDeleteProperty } from '@/hooks/useProperties';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckCircle, XCircle, Trash2, Loader2, Home, MapPin, DollarSign, Bed, Clock, Key, User, Users } from 'lucide-react'; // ✅ Added Users icon
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
  rented: { label: 'Rented', icon: Key, className: 'bg-blue-100 text-blue-800' },
};

export default function AdminDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: properties, isLoading, refetch } = useAdminProperties();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();

  useEffect(() => {
    if (!authLoading && (!user || role !== 'admin')) {
      navigate('/');
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
    await deleteProperty.mutateAsync(id);
    toast.success('Property deleted');
    refetch();
  };

  if (authLoading || isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const pendingProperties = properties?.filter((p) => p.status === 'pending') || [];
  const approvedProperties = properties?.filter((p) => p.status === 'approved') || [];
  const rejectedProperties = properties?.filter((p) => p.status === 'rejected') || [];
  const rentedProperties = properties?.filter((p) => p.status === 'rented') || [];

  const PropertyCard = ({ property, showActions = false }: { property: any; showActions?: boolean }) => {
    const status = statusConfig[property.status as keyof typeof statusConfig];
    const StatusIcon = status.icon;

    return (
      <Card className="shadow-soft hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Image */}
            <div className="w-full md:w-40 h-28 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {property.images && property.images[0] ? (
                <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-display text-lg font-semibold truncate">{property.title}</h3>
                <Badge className={status.className}>
                  <StatusIcon className="h-3 w-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {property.city}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  ${property.price}/mo
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
              {showActions && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleApprove(property.id)}>
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleReject(property.id)}>
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              )}

              {property.status === 'rented' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Listing
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Rented Property?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently remove this rented property from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(property.id)}>Remove</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage property listings and user submissions</p>
          </div>
          {/* ✅ Added View All Users Button */}
          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/users">
              <Users className="h-4 w-4" />
              View All Users
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(statusConfig).map(([key, config]) => {
            const count = properties?.filter((p) => p.status === key).length || 0;
            const Icon = config.icon;
            return (
              <Card key={key} className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.className}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground">{config.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingProperties.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved ({approvedProperties.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({rejectedProperties.length})
            </TabsTrigger>
            <TabsTrigger value="rented" className="gap-2">
              <Key className="h-4 w-4" />
              Rented ({rentedProperties.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingProperties.length > 0 ? (
              pendingProperties.map((property) => (
                <PropertyCard key={property.id} property={property} showActions />
              ))
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No pending properties</h3>
                  <p className="text-muted-foreground">All submissions have been reviewed</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedProperties.length > 0 ? (
              approvedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No approved properties</h3>
                  <p className="text-muted-foreground">Approved properties will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedProperties.length > 0 ? (
              rejectedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No rejected properties</h3>
                  <p className="text-muted-foreground">Rejected properties will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rented" className="space-y-4">
            {rentedProperties.length > 0 ? (
              rentedProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <Card className="shadow-soft">
                <CardContent className="py-12 text-center">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-semibold mb-2">No rented properties</h3>
                  <p className="text-muted-foreground">Rented properties will appear here</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
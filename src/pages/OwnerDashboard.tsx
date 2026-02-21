// src/pages/owner/OwnerDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PropertyForm } from '@/components/property/PropertyForm';
import { useAuth } from '@/contexts/AuthContext';
import {
  useOwnerProperties,
  useCreateProperty,
  useUpdateOwnerProperty,
  useDeleteProperty,
} from '@/hooks/useProperties';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Loader2, Home, MapPin, DollarSign, Bed, Clock, CheckCircle, XCircle, Key, User } from 'lucide-react';
import { toast } from 'sonner';
import type { Property } from '@/hooks/useProperties';

const statusConfig = {
  pending: { label: 'Pending Review', icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
  approved: { label: 'Approved', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
  rejected: { label: 'Rejected', icon: XCircle, className: 'bg-red-100 text-red-800' },
  rented: { label: 'Rented', icon: Key, className: 'bg-blue-100 text-blue-800' },
};

export default function OwnerDashboard() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: properties, isLoading, refetch } = useOwnerProperties();
  const createProperty = useCreateProperty();
  const updateOwnerProperty = useUpdateOwnerProperty();
  const deleteProperty = useDeleteProperty();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || role !== 'owner')) navigate('/');
  }, [user, role, authLoading, navigate]);

  const handleCreate = async (data: any) => {
    await createProperty.mutateAsync(data);
    setShowAddForm(false);
    refetch();
  };

  const handleUpdate = async (data: any) => {
    if (!editingProperty) return;
    await updateOwnerProperty.mutateAsync({ id: editingProperty.id, updates: data });
    setEditingProperty(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    await deleteProperty.mutateAsync(id);
    refetch();
  };

  const handleMarkRented = async (id: string) => {
    await updateOwnerProperty.mutateAsync({ id, updates: { status: 'rented' } });
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

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              Owner Dashboard
            </h1>
            <p className="text-muted-foreground">Manage your property listings</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/owner/profile">
                <User className="h-4 w-4" /> My Profile
              </Link>
            </Button>
            <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
              <DialogTrigger asChild>
                <Button className="btn-gradient gap-2">
                  <Plus className="h-4 w-4" /> Add Property
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Property</DialogTitle>
                </DialogHeader>
                <PropertyForm onSubmit={handleCreate} isLoading={createProperty.isPending} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-4">
          {properties?.map((property) => {
            const status = statusConfig[property.status];
            const StatusIcon = status.icon;

            return (
              <Card key={property.id} className="shadow-soft hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Image */}
                    <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {property.images && property.images[0] ? (
                        <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-display text-lg font-semibold truncate">{property.title}</h3>
                        <Badge className={status.className}>
                          <StatusIcon className="h-3 w-3 mr-1" /> {status.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
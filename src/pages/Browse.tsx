import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Loader2, Home } from 'lucide-react';

export default function Browse() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Handle authentication loading & redirect
  if (authLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const { data: properties = [], isLoading } = useProperties();

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse Properties
          </h1>
          <p className="text-muted-foreground">
            Find your perfect rental home
          </p>
        </div>

        {/* Results — identical logic to home page */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : properties.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {properties.length}{' '}
              {properties.length === 1 ? 'property' : 'properties'} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  showBooking={role === 'renter'}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">
              No properties available yet
            </h3>
            <p className="text-muted-foreground mb-4">
              Check back soon for new listings
            </p>
            {role === 'owner' && (
              <Button asChild className="btn-gradient">
                <a href="/owner/dashboard">Add Your First Property</a>
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
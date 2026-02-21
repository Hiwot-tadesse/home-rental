import { Layout } from '@/components/layout/Layout';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { Button } from '@/components/ui/button';
import { Loader2, Home } from 'lucide-react';

export default function Browse() {
  // ❌ REMOVED AUTH CHECK - Guests can browse!
  const { data: properties = [], isLoading } = useProperties();

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse Properties
          </h1>
          <p className="text-muted-foreground">
            Find your perfect rental home
          </p>
        </div>

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
                  showBooking={false} // ❌ Guests can't book
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
          </div>
        )}
      </div>
    </Layout>
  );
}
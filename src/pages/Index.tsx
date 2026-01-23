import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PropertyCard } from '@/components/property/PropertyCard';
import { Button } from '@/components/ui/button';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/contexts/AuthContext';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import heroImage from '@/assets/hero-property.jpg';

export default function Index() {
  const { data: properties, isLoading } = useProperties();
  const { user, role } = useAuth();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Modern apartment" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        <div className="container relative py-24 md:py-32">
          <div className="max-w-xl animate-fade-up">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Find Your <span className="text-gradient">Perfect</span> Home with <span className="text-primary">myHome</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Discover beautiful rental properties in your favorite neighborhoods. Your dream home is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg" className="btn-gradient">
                <Link to="/browse">
                  <Search className="h-5 w-5 mr-2" />
                  Browse Properties
                </Link>
              </Button>
              {!user && (
                <Button asChild size="lg" variant="outline">
                  <Link to="/auth?mode=signup">Get Started <ArrowRight className="h-5 w-5 ml-2" /></Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16 md:py-24 bg-secondary/30">
        <div className="container">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Handpicked homes waiting for you</p>
            </div>
            <Button asChild variant="ghost" className="hidden md:flex">
              <Link to="/browse">View All <ArrowRight className="h-4 w-4 ml-2" /></Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties && properties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg mb-4">No properties available yet.</p>
              {role === 'owner' && (
                <Button asChild className="btn-gradient">
                  <Link to="/owner/dashboard">Add Your First Property</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}

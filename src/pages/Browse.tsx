import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useProperties } from '@/hooks/useProperties';
import { useFavoriteProperties } from '@/hooks/useFavorites';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal, X, Loader2, Home } from 'lucide-react';

export default function Browse() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  const { data: favoriteProperties = [], isLoading: favoritesLoading } = useFavoriteProperties();
  
  const [showFilters, setShowFilters] = useState(false);
  const [searchCity, setSearchCity] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minRooms, setMinRooms] = useState('');

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  // Create Set for O(1) favorite lookup
  const favoriteIds = new Set(favoriteProperties.map(p => p.id));

  // Filter properties
  const filteredProperties = properties?.filter((property) => {
    const matchesCity = !searchCity || 
      property.city.toLowerCase().includes(searchCity.toLowerCase()) ||
      property.location.toLowerCase().includes(searchCity.toLowerCase());
    const matchesPrice = property.price >= priceRange[0] && property.price <= priceRange[1];
    const matchesRooms = !minRooms || property.rooms >= parseInt(minRooms);
    return matchesCity && matchesPrice && matchesRooms;
  });

  const clearFilters = () => {
    setSearchCity('');
    setPriceRange([0, 10000]);
    setMinRooms('');
  };

  const isLoading = propertiesLoading || favoritesLoading;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
            Browse Properties
          </h1>
          <p className="text-muted-foreground">Find your perfect rental home</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-card rounded-xl border border-border p-4 mb-8 shadow-soft">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by city or location..."
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label>Price Range: ${priceRange[0]} - ${priceRange[1]}</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    min={0}
                    max={10000}
                    step={100}
                    className="mt-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minRooms">Minimum Bedrooms</Label>
                  <Input
                    id="minRooms"
                    type="number"
                    placeholder="Any"
                    value={minRooms}
                    onChange={(e) => setMinRooms(e.target.value)}
                    min={1}
                    max={10}
                  />
                </div>
                <div className="flex items-end">
                  <Button variant="ghost" onClick={clearFilters} className="gap-2">
                    <X className="h-4 w-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProperties && filteredProperties.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'} found
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard 
                  key={property.id} 
                  property={property} 
                  isFavorited={favoriteIds.has(property.id)} // ✅ Pass favorite status
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Home className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-xl font-semibold mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              {searchCity || minRooms || priceRange[0] > 0 || priceRange[1] < 10000
                ? 'Try adjusting your filters'
                : 'Check back soon for new listings'}
            </p>
            {(searchCity || minRooms || priceRange[0] > 0 || priceRange[1] < 10000) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
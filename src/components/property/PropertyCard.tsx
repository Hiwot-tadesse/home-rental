// src/components/property/PropertyCard.tsx
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useToggleFavorite } from '@/hooks/useFavorites';
import { useCreateBooking } from '@/hooks/useBookings';
import type { Property } from '@/hooks/useProperties';
import { cn } from '@/lib/utils';

interface PropertyCardProps {
  property: Property;
  showStatus?: boolean;
  onEdit?: () => void;
  isFavorited?: boolean;
  showBooking?: boolean;
}

export function PropertyCard({ 
  property, 
  showStatus, 
  onEdit, 
  isFavorited = false,
  showBooking = false
}: PropertyCardProps) {
  const { user, role } = useAuth();
  const toggleFavorite = useToggleFavorite();
  const createBooking = useCreateBooking();
  
  const canFavorite = user && role === 'renter';
  const canBook = user && role === 'renter' && property.status === 'approved';

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canFavorite) return;
    // Call the toggle mutation with the expected payload shape
    toggleFavorite.mutate({ propertyId: property.id, isFavorited: !!isFavorited });
  };

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canBook) return;
    createBooking.mutate(property.id);
  };

  // ✅ Ethiopian Birr (ETB) formatting
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusBadge = () => {
    if (!showStatus) return null;
    
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'secondary', label: 'Pending' },
      approved: { variant: 'default', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      rented: { variant: 'outline', label: 'Rented' },
    };
    
    const status = variants[property.status];
    return <Badge variant={status.variant}>{status.label}</Badge>;
  };

  const mainImage = property.images?.[0] || '/placeholder.svg';

  return (
    <Card className="overflow-hidden card-hover group cursor-pointer bg-card border-border/50">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={mainImage}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {canFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "absolute top-3 right-3 p-2 rounded-full transition-all duration-200 z-10",
              isFavorited 
                ? "bg-primary text-primary-foreground" 
                : "bg-white/90 text-muted-foreground hover:bg-white hover:text-primary"
            )}
            disabled={toggleFavorite.isPending}
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-5 w-5", isFavorited && "fill-current")} />
          </button>
        )}

        {showStatus && (
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>
        )}

        <div className="absolute bottom-3 left-3">
          <span className="px-3 py-1.5 bg-primary text-primary-foreground text-lg font-semibold rounded-lg shadow-medium">
            {formatPrice(property.price)}/mo
          </span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 mb-2">
          {property.title}
        </h3>
        
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="text-sm line-clamp-1">{property.location}, {property.city}</span>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="h-4 w-4" />
            <span>{property.rooms} {property.rooms === 1 ? 'Bed' : 'Beds'}</span>
          </div>
          {property.bathrooms && (
            <div className="flex items-center gap-1">
              <Bath className="h-4 w-4" />
              <span>{property.bathrooms} {property.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          )}
          {property.area_sqft && (
            <div className="flex items-center gap-1">
              <Square className="h-4 w-4" />
              <span>{property.area_sqft} sqft</span>
            </div>
          )}
        </div>

        {property.description && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {property.description}
          </p>
        )}

        {/* Booking Button for Renters */}
        {showBooking && canBook && (
          <Button 
            onClick={handleBookClick}
            className="w-full mt-4 btn-gradient"
            disabled={createBooking.isPending}
          >
            {createBooking.isPending ? 'Booking...' : 'Book This Property'}
          </Button>
        )}

        {onEdit && (
          <Button 
            variant="outline" 
            className="w-full mt-4" 
            onClick={(e) => { 
              e.stopPropagation(); 
              onEdit(); 
            }}
          >
            Edit Property
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
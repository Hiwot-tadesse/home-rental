// src/components/property/PropertyForm.tsx
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import Lightbox from "react-image-lightbox";
import "react-image-lightbox/style.css";
import type { Property } from "@/hooks/useProperties";

// ⭐ Select component from shadcn
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const MAX_IMAGES = 5;
const MIN_REQUIRED_IMAGES = 2;

const propertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().max(1000).optional(),
  location: z.string().min(1, "Address is required").max(200),
  city: z.string().min(1, "City is required").max(100),
  price: z.number().min(1, "Price must be greater than 0"),
  rooms: z.number().min(1).max(20),
  bathrooms: z.number().min(1).max(10).optional(),
  area_sqft: z.number().min(1).optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  initialData?: Partial<Property>;
  onSubmit: (data: PropertyFormData & { images: string[] }) => Promise<void>;
  isLoading?: boolean;
}

export function PropertyForm({ initialData, onSubmit, isLoading }: PropertyFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      city: initialData?.city || "",
      price: initialData?.price || undefined,
      rooms: initialData?.rooms || 1,
      bathrooms: initialData?.bathrooms || 1,
      area_sqft: initialData?.area_sqft || undefined,
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remainingSlots = MAX_IMAGES - images.length;
    if (remainingSlots <= 0) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    setUploading(true);
    setImageError(null);

    const uploadedUrls: string[] = [];
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    // For now just local preview, you can replace with Cloudinary upload
    for (const file of filesToProcess) {
      const localUrl = URL.createObjectURL(file);
      uploadedUrls.push(localUrl);
    }

    setImages(prev => [...prev, ...uploadedUrls]);
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageError(null);
  };

  const handleFormSubmit = async (data: PropertyFormData) => {
    if (images.length < MIN_REQUIRED_IMAGES) {
      setImageError(`At least ${MIN_REQUIRED_IMAGES} images are required`);
      return;
    }
    await onSubmit({ ...data, images });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{initialData ? "Edit Property" : "Add New Property"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">

          {/* ------------------ IMAGES ------------------ */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Property Images *</Label>
              <span className="text-sm text-muted-foreground">
                {images.length}/{MAX_IMAGES} images (min {MIN_REQUIRED_IMAGES} required)
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Array.from({ length: MAX_IMAGES }).map((_, index) => {
                const imageUrl = images[index];
                const isRequired = index < MIN_REQUIRED_IMAGES;

                if (imageUrl) {
                  return (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted border-2 border-transparent">
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => {
                          setLightboxIndex(index);
                          setLightboxOpen(true);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {isRequired && (
                        <span className="absolute bottom-1 left-1 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded">
                          Required
                        </span>
                      )}
                    </div>
                  );
                }

                if (index === images.length && images.length < MAX_IMAGES) {
                  return (
                    <label
                      key={index}
                      className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${
                        isRequired
                          ? "border-primary bg-primary/5 hover:bg-primary/10"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                      {uploading ? (
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground text-center px-2">
                            {isRequired ? "Required" : "Optional"}
                          </span>
                        </>
                      )}
                    </label>
                  );
                }

                return (
                  <div
                    key={index}
                    className={`aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center ${
                      isRequired ? "border-primary/30 bg-primary/5" : "border-border/50"
                    }`}
                  >
                    <ImageIcon className="h-6 w-6 text-muted-foreground/50 mb-1" />
                    <span className="text-xs text-muted-foreground/50">
                      {isRequired ? "Required" : "Optional"}
                    </span>
                  </div>
                );
              })}
            </div>
            {imageError && <p className="text-sm text-destructive">{imageError}</p>}
          </div>

          {/* ------------------ TITLE ------------------ */}
          <div className="space-y-2">
            <Label htmlFor="title">Property Title *</Label>
            <Select
              onValueChange={(value) => setValue("title", value)}
              defaultValue={initialData?.title || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a property title" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Modern Apartment">Modern Apartment</SelectItem>
                <SelectItem value="Luxury Villa">Luxury Villa</SelectItem>
                <SelectItem value="Family House">Family House</SelectItem>
                <SelectItem value="Studio Apartment">Studio Apartment</SelectItem>
                <SelectItem value="Beachfront Property">Beachfront Property</SelectItem>
              </SelectContent>
            </Select>
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* ------------------ DESCRIPTION ------------------ */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={4} placeholder="Describe your property..." />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          {/* ------------------ LOCATION + CITY ------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Address *</Label>
              <Input id="location" {...register("location")} placeholder="123 Main Street" />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" {...register("city")} placeholder="New York" />
              {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
            </div>
          </div>

          {/* ------------------ PRICE + ROOMS + BATHROOMS + AREA ------------------ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price/Month ($) *</Label>
              <Input id="price" type="number" {...register("price", { valueAsNumber: true })} placeholder="2000" />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="rooms">Bedrooms *</Label>
              <Input id="rooms" type="number" {...register("rooms", { valueAsNumber: true })} placeholder="2" />
              {errors.rooms && <p className="text-sm text-destructive">{errors.rooms.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input id="bathrooms" type="number" {...register("bathrooms", { valueAsNumber: true })} placeholder="1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="area_sqft">Area (sqft)</Label>
              <Input id="area_sqft" type="number" {...register("area_sqft", { valueAsNumber: true })} placeholder="850" />
            </div>
          </div>

          <Button type="submit" className="w-full btn-gradient" disabled={isLoading || uploading}>
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> :
              initialData ? "Update Property" : "Submit Property"}
          </Button>
        </form>

        {/* ------------------ LIGHTBOX ------------------ */}
        {lightboxOpen && (
          <Lightbox
            mainSrc={images[lightboxIndex]}
            nextSrc={images[(lightboxIndex + 1) % images.length]}
            prevSrc={images[(lightboxIndex + images.length - 1) % images.length]}
            onCloseRequest={() => setLightboxOpen(false)}
            onMovePrevRequest={() =>
              setLightboxIndex((lightboxIndex + images.length - 1) % images.length)
            }
            onMoveNextRequest={() =>
              setLightboxIndex((lightboxIndex + 1) % images.length)
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
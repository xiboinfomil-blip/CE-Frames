'use client';

// ✅ Updated Import: Using GallerySummary from consolidated types
import { GallerySummary } from '@/types/types';
import { GalleryCard } from './GalleryCard';
import { EmptyState } from './EmptyState';
import CardGrid from '@/components/displayGrid'; 

interface GalleryGridProps {
  // ✅ Updated to use GallerySummary
  galleries: GallerySummary[];
  onEdit: (gallery: GallerySummary) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function GalleryGrid({ galleries, onEdit, onDelete }: GalleryGridProps) {
  
  // Custom empty state specific to Galleries
  // Note: Ensure EmptyState handles the onCreateClick prop correctly
  const galleryEmptyState = (
    <EmptyState onCreateClick={() => onEdit({} as GallerySummary)} />
  );

  return (
    <CardGrid
      items={galleries}
      ariaLabel="Photo galleries"
      emptyState={galleryEmptyState}
      getKey={(gallery) => gallery.id}
      renderItem={(gallery, index) => (
        <GalleryCard 
          gallery={gallery} 
          onEdit={() => onEdit(gallery)}
          onDelete={() => onDelete(gallery.id)}
          priority={index === 0}
        />
      )}
    />
  );
}
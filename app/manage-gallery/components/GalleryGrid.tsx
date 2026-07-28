'use client';

import { Gallery } from '@/types/gallery';
import { GalleryCard } from './GalleryCard';
import { EmptyState } from './EmptyState';
import CardGrid from '@/components/displayGrid'; // Adjust path to where you saved CardGrid

interface GalleryGridProps {
  galleries: Gallery[];
  onEdit: (gallery: Gallery) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function GalleryGrid({ galleries, onEdit, onDelete }: GalleryGridProps) {
  
  // Custom empty state specific to Galleries
  const galleryEmptyState = (
    <EmptyState onCreateClick={() => onEdit({} as Gallery)} />
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
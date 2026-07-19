'use client';

import { Gallery } from '@/types/gallery';
import { GalleryCard } from './GalleryCard';
import { EmptyState } from './EmptyState';

interface GalleryGridProps {
  galleries: Gallery[];
  onEdit: (gallery: Gallery) => void;
  onDelete: (id: string, title: string) => Promise<void>;
}

export default function GalleryGrid({ galleries, onEdit, onDelete }: GalleryGridProps) {
  
  if (!galleries || galleries.length === 0) {
    return <EmptyState onCreateClick={() => onEdit({} as Gallery)} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {galleries.map((gallery) => (
        <GalleryCard 
          key={gallery.id} 
          gallery={gallery} 
          onEdit={() => onEdit(gallery)}
          onDelete={() => onDelete(gallery.id, gallery.title)}
        />
      ))}
    </div>
  );
}
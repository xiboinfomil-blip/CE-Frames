'use client';

import { GallerySummary } from '@/types/types';
import { GalleryCard } from './GalleryCard';
import CardGrid from '@/components/displayGrid'; 
import { CustomButton } from '@/components/ui/CustomButton';
import { FolderOpen } from 'lucide-react';

interface GalleryGridProps {
  galleries: GallerySummary[];
  onEdit: (gallery: GallerySummary) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function GalleryGrid({ galleries, onEdit, onDelete }: GalleryGridProps) {
  
  // Custom empty state specific to Galleries
  const galleryEmptyState = (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
      <div className="w-20 h-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100 dark:border-zinc-800">
        <FolderOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">No galleries yet</h3>
      <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2 max-w-xs font-medium">Create your first collection to start organizing your masterpieces.</p>
      <CustomButton 
        variant="primary"
        size="lg"
        onClick={() => onEdit({} as GallerySummary)}
        className="mt-8"
        leftIcon={<FolderOpen className="w-4 h-4" />}
      >
        Create Gallery
      </CustomButton>
    </div>
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
          priority={index < 4}
        />
      )}
    />
  );
}
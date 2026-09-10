'use client';

import { GallerySummary } from '@/types/types';
import { GalleryCard } from './GalleryCard';
import CardGrid from '@/components/displayGrid'; 
import { CustomButton } from '@/components/ui/CustomButton';
import { Images, Plus } from 'lucide-react';

interface GalleryGridProps {
  galleries: GallerySummary[];
  onEdit: (gallery: GallerySummary) => void;
  onDelete: (id: string) => Promise<void>;
}

export default function GalleryGrid({ galleries, onEdit, onDelete }: GalleryGridProps) {
  
  const galleryEmptyState = (
    <div className="flex flex-col items-center justify-center py-24 md:py-40 text-center w-full animate-in fade-in zoom-in-95 duration-500">
      <div className="w-24 h-24 md:w-32 md:h-32 bg-[#F5F7FA] dark:bg-[#0E1C2D] rounded-[2rem] flex items-center justify-center mb-8 ring-1 ring-[#E2E8F0] dark:ring-white/10 shadow-sm">
        <Images className="w-10 h-10 md:w-12 md:h-12 text-[#CBD5E1] dark:text-white/30" />
      </div>
      <h3 className="text-2xl md:text-3xl font-light text-[#172033] dark:text-white tracking-tight">
        Aucune galerie pour le moment
      </h3>
      <p className="text-[#64748B] dark:text-white/60 text-base md:text-lg mt-4 max-w-md mx-auto font-light leading-relaxed">
        Archivez et partagez les photos des activités du CE. Créez votre premier album média pour les salariés.
      </p>
      <CustomButton 
        variant="primary"
        size="lg"
        onClick={() => onEdit({} as GallerySummary)}
        className="mt-10 px-8 py-4 text-base font-medium tracking-wide shadow-sm hover:shadow-md transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
        leftIcon={<Plus className="w-5 h-5" />}
      >
        Créer un album
      </CustomButton>
    </div>
  );

  return (
    <div className="w-full min-h-[60vh] flex flex-col">
      <CardGrid
        items={galleries}
        ariaLabel="Galeries photos du CE"
        emptyState={galleryEmptyState}
        getKey={(gallery) => gallery.id}
        /* 
            RESPONSIVE PHOTOGRAPHY GRID LAYOUT:
            - Fluid breakpoint-driven columns for 3:4 cards.
            - 1 col (mobile), 2 cols (tablet), 3 cols (laptop), 4 cols (large desktop).
        */
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 xl:gap-10 p-4 md:p-8 lg:p-12 w-full max-w-[1920px] mx-auto"
        renderItem={(gallery, index) => (
          <GalleryCard 
            gallery={gallery} 
            onEdit={() => onEdit(gallery)}
            onDelete={() => onDelete(gallery.id)}
            priority={index < 4} // Prioritize LCP for the first row only
          />
        )}
      />
    </div>
  );
}
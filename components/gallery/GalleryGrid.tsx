'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { HiPhoto, HiLockClosed } from 'react-icons/hi2';

import { GallerySummary } from '@/types/types';
import GalleryCard from './GalleryCard';
import EmptyState from './EmptyState';

interface GalleryGridProps {
galleries: GallerySummary[];
onGalleryClick: (gallery: GallerySummary) => void;
useCardComponent?: boolean;
}

const containerVariants = {
hidden: { opacity: 0 },
visible: {
opacity: 1,
transition: {
staggerChildren: 0.05,
},
},
};

const itemVariants = {
hidden: { opacity: 0, y: 16 },
visible: { opacity: 1, y: 0 },
};

export default function GalleryGrid({
galleries,
onGalleryClick,
useCardComponent = true,
}: GalleryGridProps) {
if (galleries.length === 0) {
return ( <EmptyState
     title="No galleries found"
     description="Try adjusting your search criteria or filter options to discover galleries."
   />
);
}

return (
<motion.div
variants={containerVariants}
initial="hidden"
animate="visible"
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
>
{galleries.map((gallery) => {
// Render via standard GalleryCard component when enabled
if (useCardComponent) {
return ( <GalleryCard
           key={gallery.id}
           gallery={gallery}
           onClick={onGalleryClick}
         />
);
}

    const displayMedia = gallery.randomMedia;

    // Custom Grid Card Fallback Mode
    return (
      <motion.div
        key={gallery.id}
        variants={itemVariants}
        onClick={() => onGalleryClick(gallery)}
        className="group cursor-pointer flex flex-col h-full bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-lg shadow-[#00345F]/10 hover:border-[#004A87]/30 hover:shadow-xl hover:shadow-[#00345F]/15 transition-all duration-300"
      >
        {/* Media Aspect Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F5F7FA] flex items-center justify-center">
          {displayMedia?.thumbnailUrl ? (
            <img
              src={displayMedia.thumbnailUrl}
              alt={gallery.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="text-center p-4">
              <HiPhoto className="h-10 w-10 mx-auto text-[#94A3B8] mb-2" />
              <p className="text-[#64748B] text-xs font-semibold uppercase tracking-wider">
                No media
              </p>
            </div>
          )}

          {/* Vignette Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#00345F]/80 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity" />

          {/* Top Right Status Badge */}
          {gallery.visibility === 'password_protected' && (
            <div className="absolute top-3 right-3 z-10">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00345F]/90 backdrop-blur-md border border-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                <HiLockClosed className="w-3 h-3 text-[#FF8201]" />
                Locked
              </span>
            </div>
          )}
        </div>

        {/* Gallery Info Details */}
        <div className="p-4 flex flex-col flex-grow bg-white">
          <h3 className="text-[#172033] font-bold text-base line-clamp-1 group-hover:text-[#004A87] transition-colors duration-200">
            {gallery.title}
          </h3>

          {gallery.description && (
            <p className="text-[#64748B] text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {gallery.description}
            </p>
          )}

          <div className="grow min-h-[12px]" />

          {/* Meta Info Line */}
          <div className="flex items-center justify-between text-[11px] text-[#94A3B8] font-medium pt-3 border-t border-[#E2E8F0] mt-2">
            {gallery.owner?.username ? (
              <span className="text-[#64748B]">
                @{gallery.owner.username}
              </span>
            ) : (
              <span />
            )}

            <span>
              {new Date(gallery.createdAt).toLocaleDateString(
                undefined,
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }
              )}
            </span>
          </div>
        </div>

        {/* Brand Accent */}
        <div className="h-0.5 w-full bg-[#FF8201] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
      </motion.div>
    );
  })}
</motion.div>

);
}

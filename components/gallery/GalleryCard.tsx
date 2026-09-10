'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
HiLockClosed,
HiLockOpen,
HiEyeSlash,
HiPhoto,
HiArrowRight,
} from 'react-icons/hi2';

import { GallerySummary } from '@/types/types';
import { getUnlockedGalleries } from '@/lib/gallery-utils';

interface GalleryCardProps {
gallery: GallerySummary;
onClick: (gallery: GallerySummary) => void;
}

const itemVariants = {
hidden: { opacity: 0, y: 20 },
visible: { opacity: 1, y: 0 },
};

export default function GalleryCard({
gallery,
onClick,
}: GalleryCardProps) {
const unlockedGalleries = getUnlockedGalleries();
const isUnlocked = unlockedGalleries.includes(gallery.id);
const isProtected =
gallery.visibility === 'password_protected' && !isUnlocked;

// Status badge styling aligned with the CE Frames palette
const getBadgeStyle = () => {
  if (isProtected) {
    return {
      bg: 'bg-[#00345F]/90 border-white/20 text-white',
      icon: <HiLockClosed className="w-3 h-3" />,
      label: 'Protégé',
    };
  }

  if (isUnlocked) {
    return {
      bg: 'bg-emerald-600/90 border-emerald-300/30 text-white',
      icon: <HiLockOpen className="w-3 h-3" />,
      label: 'Déverrouillé',
    };
  }

  if (gallery.visibility === 'unlisted') {
    return {
      bg: 'bg-[#FF8201]/90 border-orange-200/30 text-white',
      icon: <HiEyeSlash className="w-3 h-3" />,
      label: 'Non listé',
    };
  }

  return {
    bg: 'bg-[#004A87]/90 border-white/20 text-white',
    icon: null,
    label: 'Public',
  };
};

const badge = getBadgeStyle();
const displayMedia = gallery.randomMedia;

return (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -6 }}
    transition={{
      type: 'spring',
      stiffness: 300,
      damping: 25,
    }}
    className="group relative flex flex-col h-full cursor-pointer select-none"
    onClick={() => onClick(gallery)}
  >
    <div className="relative flex flex-col h-full bg-white dark:bg-[#102238] rounded-2xl shadow-lg shadow-[#00345F]/10 border border-[#E2E8F0] dark:border-white/10 overflow-hidden transition-all duration-300 group-hover:border-[#004A87]/30 group-hover:shadow-xl group-hover:shadow-[#00345F]/15">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F5F7FA] dark:bg-[#0E1C2D]">
        {displayMedia?.thumbnailUrl ? (
          <Image
            src={displayMedia.thumbnailUrl}
            alt={gallery.title || 'Couverture de galerie'}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-[#EAF4FB] dark:bg-[#00345F]/40 text-[#94A3B8]">
            <HiPhoto className="text-5xl mb-2" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-white/55">
              Aucune couverture
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#00345F]/80 via-[#00345F]/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300" />

        <div className="absolute top-3.5 right-3.5 z-20">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 backdrop-blur-md border shadow-lg ${badge.bg}`}
          >
            {badge.icon}
            {badge.label}
          </span>
        </div>

        <div className="absolute bottom-3.5 left-3.5 z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00345F]/70 backdrop-blur-md border border-white/20 rounded-lg text-white shadow-md text-xs font-medium">
            <HiPhoto className="w-3.5 h-3.5 text-[#FF8201]" />
            <span>{gallery.mediaCount || 0}</span>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-white/95 dark:bg-[#102238]/95 backdrop-blur-md p-3.5 rounded-full border border-white dark:border-white/10 text-[#004A87] dark:text-[#FFB15C] shadow-xl transform scale-95 group-hover:scale-100 transition-transform duration-300">
            <HiArrowRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow bg-white dark:bg-[#102238] relative z-10">
        <h3 className="font-bold text-lg text-[#172033] dark:text-white line-clamp-1 group-hover:text-[#004A87] dark:group-hover:text-[#FFB15C] transition-colors duration-200">
          {gallery.title}
        </h3>

        {gallery.description && (
          <p className="text-[#64748B] dark:text-white/60 text-xs mt-1.5 line-clamp-2 leading-relaxed">
            {gallery.description}
          </p>
        )}

        <div className="grow min-h-[8px]" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF8201] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-center" />
    </div>
  </motion.div>
);
}

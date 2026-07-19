'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  FaLock, 
  FaUnlock, 
  FaImages, 
  FaEyeSlash,
  FaArrowRight
} from 'react-icons/fa';
import { Gallery } from '@/types/gallery';
import { getUnlockedGalleries } from '@/lib/gallery-utils';

interface GalleryCardProps {
  gallery: Gallery;
  onClick: (gallery: Gallery) => void;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function GalleryCard({ gallery, onClick }: GalleryCardProps) {
  const unlockedGalleries = getUnlockedGalleries();
  const isUnlocked = unlockedGalleries.includes(gallery.id);
  const isProtected = gallery.visibility === 'password_protected' && !isUnlocked;

  // Determine badge style based on visibility
  const getBadgeStyle = () => {
    if (isProtected) {
      return {
        bg: 'bg-red-500/90 backdrop-blur-md',
        text: 'text-white',
        icon: <FaLock className="w-3 h-3" />,
        label: 'Protected'
      };
    }
    if (isUnlocked) {
      return {
        bg: 'bg-emerald-500/90 backdrop-blur-md',
        text: 'text-white',
        icon: <FaUnlock className="w-3 h-3" />,
        label: 'Unlocked'
      };
    }
    if (gallery.visibility === 'unlisted') {
      return {
        bg: 'bg-amber-500/90 backdrop-blur-md',
        text: 'text-white',
        icon: <FaEyeSlash className="w-3 h-3" />,
        label: 'Unlisted'
      };
    }
    return {
      bg: 'bg-blue-600/90 backdrop-blur-md',
      text: 'text-white',
      icon: null,
      label: 'Public'
    };
  };

  const badge = getBadgeStyle();

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -12 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="group relative flex flex-col h-full cursor-pointer"
      onClick={() => onClick(gallery)}
    >
      {/* Main Card Container */}
      <div className="relative flex flex-col h-full bg-white rounded-3xl shadow-sm hover:shadow-2xl border border-gray-100 overflow-hidden transition-shadow duration-500">
        
        {/* Image Section (Taller Aspect Ratio for Photography Focus) */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          {gallery.coverMedia?.thumbnailUrl ? (
            <Image
              src={gallery.coverMedia.thumbnailUrl}
              alt={gallery.title || 'Gallery cover'}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
              <FaImages className="text-6xl text-blue-200/50" />
            </div>
          )}
          
          {/* Dark Gradient Overlay (Always present slightly for text readability if needed, stronger on hover) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

          {/* Top Right: Status Badge */}
          <div className="absolute top-4 right-4 z-20">
            <span className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold flex items-center gap-1.5 shadow-lg ${badge.bg} ${badge.text}`}>
              {badge.icon}
              {badge.label}
            </span>
          </div>

          {/* Bottom Left: Floating Media Count (Telemetry Style) */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white shadow-lg transform translate-y-2 opacity-90 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <FaImages className="w-3 h-3 text-blue-300" />
              <span className="text-xs font-semibold">{gallery._count?.galleryMedia || 0}</span>
            </div>
          </div>

          {/* Center: Action Icon (Appears on Hover) */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
            <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 shadow-2xl">
              <FaArrowRight className="text-white w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow bg-white relative z-10">
          <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
            {gallery.title}
          </h3>
          
          {gallery.description && (
            <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">
              {gallery.description}
            </p>
          )}

          {/* Spacer to push content up if description is short */}
          <div className="flex-grow" />
        </div>

        {/* The "Start Light" Racing Stripe */}
        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out origin-center" />
      </div>
    </motion.div>
  );
}
'use client';

// ✅ Updated Import: Using GallerySummary from consolidated types
import { GallerySummary } from '@/types/types';
import MediaViewport from '@/components/media-viewport';
import { HiPhoto, HiLockClosed } from 'react-icons/hi2';

interface GalleryGridProps {
  galleries: GallerySummary[];
  onGalleryClick: (gallery: GallerySummary) => void;
}

const GalleryGrid = ({ galleries, onGalleryClick }: GalleryGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {galleries.map((gallery, index) => {
        // ✅ Use randomMedia for list previews since coverMedia object isn't in GallerySummary
        const displayMedia = gallery.randomMedia;
        
        if (!displayMedia) {
          // Fallback for galleries without any media
          return (
            <div
              key={gallery.id}
              onClick={() => onGalleryClick(gallery)}
              className="group relative aspect-4/3 w-full overflow-hidden rounded-lg bg-slate-800 ring-1 ring-slate-700 shadow-xl cursor-pointer transition-all duration-300 hover:ring-red-500 hover:shadow-2xl hover:-translate-y-1"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-4">
                  <HiPhoto className="h-12 w-12 mx-auto text-slate-600 mb-2" />
                  <p className="text-slate-500 text-sm">No media</p>
                </div>
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Gallery Info */}
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <h3 className="text-white font-bold text-lg truncate">{gallery.title}</h3>
                {gallery.visibility === 'password_protected' && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-red-400 font-mono uppercase tracking-widest">
                    <HiLockClosed className="w-3 h-3" />
                    <span>Locked</span>
                  </div>
                )}
              </div>
            </div>
          );
        }

        return (
          <div
            key={gallery.id}
            onClick={() => onGalleryClick(gallery)}
            className="group cursor-pointer"
          >
            <MediaViewport
              mediaType={displayMedia.type}
              fullResUrl={displayMedia.fullResUrl || displayMedia.thumbnailUrl}
              thumbnailUrl={displayMedia.thumbnailUrl}
              caption={gallery.title}
              originalFilename={null}
              className="transition-all duration-300 hover:ring-red-500 hover:shadow-2xl hover:-translate-y-1"
              priority={index === 0} // <-- Eager load ONLY the first item for LCP optimization
            />
            
            {/* Gallery Info - positioned outside MediaViewport for better control */}
            <div className="mt-3 px-1">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-slate-900 font-bold text-base truncate group-hover:text-red-600 transition-colors">
                    {gallery.title}
                  </h3>
                  {gallery.description && (
                    <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                      {gallery.description}
                    </p>
                  )}
                </div>
                
                {/* Visibility Badge */}
                {gallery.visibility === 'password_protected' && (
                  <div className="shrink-0 mt-1">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      <HiLockClosed className="w-3 h-3" />
                      Locked
                    </div>
                  </div>
                )}
              </div>
              
              {/* Meta info */}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {/* ✅ Updated: Use gallery.owner instead of gallery.user */}
                {gallery.owner && (
                  <span className="font-medium">@{gallery.owner.username}</span>
                )}
                <span>•</span>
                <span>{new Date(gallery.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GalleryGrid;
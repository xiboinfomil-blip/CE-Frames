'use client';

import { Gallery } from '@/types/gallery';
import MediaViewport from '@/components/media-viewport';

interface GalleryGridProps {
  galleries: Gallery[];
  onGalleryClick: (gallery: Gallery) => void;
}

const GalleryGrid = ({ galleries, onGalleryClick }: GalleryGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {galleries.map((gallery, index) => {
        // Use coverMedia if available, otherwise use randomMedia
        const displayMedia = gallery.coverMedia || gallery.randomMedia;
        
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
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-12 w-12 mx-auto text-slate-600 mb-2" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                    />
                  </svg>
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
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
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                      </svg>
                      Locked
                    </div>
                  </div>
                )}
              </div>
              
              {/* Meta info */}
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                {gallery.user && (
                  <span className="font-medium">@{gallery.user.username}</span>
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
// components/PhotoGrid.tsx
import React from 'react';
import PhotoAlbum from 'react-photo-album';

interface PhotoItem {
  src: string;
  width: number;
  height: number;
  alt: string;
  description?: string;
  title?: string;
}

interface PhotoGridProps {
  photos: PhotoItem[];
  layoutStyle: string;
  onPhotoClick: (index: number) => void;
}

export default function PhotoGrid({ photos, layoutStyle, onPhotoClick }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-zinc-400 bg-white border border-dashed border-zinc-200 rounded-2xl m-4">
        <div className="w-16 h-16 mb-4 rounded-full bg-zinc-50 flex items-center justify-center border border-zinc-100">
          <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-zinc-500">No Assets Found</p>
        <p className="text-xs text-zinc-400 mt-1 font-mono">Adjust filters or search terms</p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[50vh] p-4">
      <PhotoAlbum
        photos={photos}
        layout={layoutStyle === 'grid' ? 'columns' : 'masonry'}
        spacing={16}
        padding={0}
        rows={{ height: 240 }}
        columns={(containerWidth) => {
          if (containerWidth < 640) return 2;
          if (containerWidth < 1024) return 3;
          if (containerWidth < 1536) return 4;
          return 5;
        }}
        onClick={({ index }) => onPhotoClick(index)}
        render={{
          image: (props) => (
            <div 
              role="button"
              tabIndex={0}
              aria-label={`View ${props.alt}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  props.onClick?.();
                }
              }}
              // IMPORTANT: Use the style and className from props to maintain layout
              style={props.style}
              className={`${props.className} group relative block overflow-hidden bg-zinc-100 cursor-pointer rounded-xl shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 transition-all duration-300 ease-out border border-transparent hover:border-zinc-200`}
            >
              {/* Image */}
              <img 
                {...props} 
                loading="lazy" 
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-110"
                alt={props.alt}
                style={{ ...props.style, objectFit: 'cover' }}
              />
              
              {/* Technical Overlay (Slide Up) */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                
                {/* Content Container */}
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  
                  {/* Title/Alt */}
                  <h3 className="text-white text-sm font-bold truncate drop-shadow-md mb-1">
                    {props.title || props.alt}
                  </h3>
                  
                  {/* Telemetry Data Row */}
                  <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-300 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      JPG
                    </span>
                    <span>{props.width} × {props.height}</span>
                  </div>
                </div>
              </div>

              {/* Corner "Action" Indicator */}
              <div className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-md rounded-lg shadow-lg opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 flex items-center justify-center text-slate-800">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          ),
        }}
      />
    </div>
  );
}``
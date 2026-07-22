// components/PhotoGrid.tsx
import React from 'react';
import PhotoAlbum from 'react-photo-album';
import "react-photo-album/styles.css";

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
      <div className="relative flex flex-col items-center justify-center py-24 px-4 text-center bg-zinc-50/50 border-2 border-dashed border-zinc-200 rounded-3xl m-4 transition-colors duration-300 hover:border-red-500/30 overflow-hidden">
        {/* Subtle technical grid background pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04]" 
          style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} 
        />
        
        <div className="relative z-10 w-20 h-20 mb-6 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-zinc-100">
          <svg className="w-10 h-10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {/* Racing "Recording/Active" Dot Accent */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        
        <h3 className="relative z-10 text-lg font-bold uppercase tracking-widest text-zinc-800 mb-2">
          No Assets Found
        </h3>
        <p className="relative z-10 text-sm text-zinc-500 font-mono max-w-xs">
          Adjust your filters or search terms to find the perfect shot.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-[50vh] p-2 sm:p-6 rounded-3xl shadow-sm border border-zinc-100">
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
              aria-label={`View photo: ${props.alt || 'Untitled racecar photography'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  props.onClick?.();
                }
              }}
              className={`
                group relative block overflow-hidden bg-zinc-100 cursor-pointer 
                rounded-2xl shadow-sm hover:shadow-2xl hover:shadow-zinc-200/60 
                transition-all duration-500 ease-out border border-zinc-100 
                hover:border-red-500/30 
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-500/20
                ${props.className || ''}
              `}
              style={props.style}
            >
              {/* Image */}
              <img 
                src={props.src}
                width={props.width}
                height={props.height}
                alt={props.alt || 'Racecar photography'}
                loading="lazy" 
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] group-hover:scale-105"
                style={{ ...props.style, objectFit: 'cover' }}
                onClick={props.onClick}
              />
              
              {/* Light Style Telemetry Overlay (Slide Up) */}
              <div className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-xl border-t border-zinc-100 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex flex-col justify-end">
                
                {/* Racing Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />

                {/* Content Container */}
                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                  
                  {/* Title/Alt */}
                  <h3 className="text-slate-900 text-sm font-bold uppercase tracking-wider truncate mb-2 drop-shadow-sm">
                    {props.title || props.alt || 'Untitled Shot'}
                  </h3>
                  
                  {/* Telemetry Data Row */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-sm bg-red-600"></span>
                        <span className="font-semibold text-zinc-700">JPG</span>
                      </span>
                      <span className="w-px h-3 bg-zinc-300"></span>
                      <span>{props.width} <span className="text-zinc-400">×</span> {props.height}</span>
                    </div>
                    
                    {/* View Call to Action */}
                    <span className="flex items-center gap-1 text-red-600 font-bold">
                      VIEW
                      <svg className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Corner "Action" Indicator */}
              <div className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-zinc-100 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 flex items-center justify-center text-slate-700 group-hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>

              {/* Subtle "Speed" Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
          ),
        }}
      />
    </div>
  );
}
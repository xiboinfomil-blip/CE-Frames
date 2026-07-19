'use client';

import Link from 'next/link';
import { memo } from 'react';
import Swal from 'sweetalert2';
import { Gallery } from '@/types/gallery';
import { VisibilityBadge } from './VisibilityBadge';
import { VISIBILITY_STATUSES } from '@/db/schema';
import MediaViewport from '@/components/media-viewport'; 

interface GalleryCardProps {
  gallery: Gallery;
  onEdit: () => void;
  onDelete: () => void;
}

export const GalleryCard = memo(function GalleryCard({ 
  gallery, 
  onEdit, 
  onDelete 
}: GalleryCardProps) {
  
  const handleDeleteClick = async () => {
    const result = await Swal.fire({
      title: 'Purge Gallery?',
      html: `<span class="text-slate-600">You are about to permanently delete <strong class="text-slate-900">${gallery.title}</strong>. This action cannot be undone.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // Tailwind red-500
      cancelButtonColor: '#cbd5e1', // Tailwind slate-300
      confirmButtonText: 'Yes, purge it',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-slate-100 font-sans',
        title: 'font-bold text-slate-900 text-lg',
        confirmButton: 'px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-red-600 hover:shadow-md',
        cancelButton: 'px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }
    });

    if (result.isConfirmed) {
      onDelete();
    }
  };

  const getMediaInfo = () => {
    // Priority: Random Media -> Cover Media -> First Item in Gallery
    const media = (gallery as any).randomMedia || gallery.coverMedia || (gallery.galleryMedia?.[0]?.media ?? null);
    
    if (!media) return { sourceUrl: null, posterUrl: null, mediaType: null };

    return {
      sourceUrl: media.url || media.thumbnailUrl,
      posterUrl: media.thumbnailUrl,
      mediaType: media.type
    };
  };

  const { sourceUrl, posterUrl, mediaType } = getMediaInfo();
  const hasMedia = !!sourceUrl;
  const mediaCount = gallery.galleryMedia?.length || 0;
  
  const createdDate = new Date(gallery.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: '2-digit' 
  });

  // Safe access for user details
  const ownerName = gallery.user?.name || gallery.user?.email?.split('@')[0] || 'Unknown';
  const initial = ownerName.charAt(0).toUpperCase();

  return (
    <article className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/60 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] hover:border-slate-300 transition-all duration-300 h-full">
      
      {/* Animated Racing Gradient Accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-20" />
      
      {/* --- Media Area --- */}
      <Link 
        href={`/manage-gallery/${gallery.id}`} 
        className="block relative aspect-[4/3] bg-slate-50 overflow-hidden shrink-0 focus:outline-none"
        aria-label={`Manage gallery: ${gallery.title}`}
      >
        {hasMedia && mediaType ? (
          <>
            <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
              <MediaViewport
                mediaType={mediaType as any}
                fullResUrl={sourceUrl!}
                thumbnailUrl={posterUrl || sourceUrl!}
                caption={gallery.title}
                originalFilename={null}
                className="w-full h-full object-cover"
              />
            </div>
            
            {/* Play Icon Overlay for Videos */}
            {mediaType === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center opacity-90 group-hover:scale-110 transition-all duration-300">
                  <svg className="w-6 h-6 text-slate-900 ml-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 border-b border-slate-100">
            <div className="p-4 rounded-full bg-slate-100 mb-2">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">No Media</span>
          </div>
        )}

        {/* Top Left: Visibility */}
        <div className="absolute top-3 left-3 z-10">
          <VisibilityBadge type={gallery.visibility as typeof VISIBILITY_STATUSES[number]} />
        </div>

        {/* Top Right: Media Count Telemetry */}
        {mediaCount > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <div className="bg-white/90 backdrop-blur-md text-slate-700 text-[10px] font-mono font-bold px-2.5 py-1.5 rounded-full shadow-sm border border-slate-200/50 flex items-center gap-1.5">
              <svg className="w-3 h-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {mediaCount}
            </div>
          </div>
        )}
      </Link>

      {/* --- Content Area --- */}
      <div className="flex flex-col flex-grow p-5">
        
        {/* Header: Title & Date */}
        <div className="mb-3">
          <Link href={`/manage-gallery/${gallery.id}`} className="block group/title focus:outline-none">
            <h3 className="text-lg font-bold text-slate-900 leading-tight group-hover/title:text-purple-600 transition-colors line-clamp-1">
              {gallery.title}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-2">
             <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">
               EST. {formattedDate}
             </span>
          </div>
        </div>

        {/* Description */}
        {gallery.description ? (
          <p className="text-sm text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-grow font-normal">
            {gallery.description}
          </p>
        ) : (
          <div className="flex-grow" />
        )}

        {/* Footer: Actions & Telemetry */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          
          {/* Owner Avatar */}
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 shadow-sm">
                {initial}
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Owner</span>
                <span className="text-xs text-slate-700 font-medium truncate max-w-[100px]">{ownerName}</span>
             </div>
          </div>

          {/* Management Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onEdit}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-200"
              title="Edit Details"
              aria-label={`Edit details for ${gallery.title}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={handleDeleteClick}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-200"
              title="Delete Gallery"
              aria-label={`Delete gallery: ${gallery.title}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
});
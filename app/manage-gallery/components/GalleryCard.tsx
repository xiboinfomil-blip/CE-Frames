'use client';

import Link from 'next/link';
import { memo } from 'react';
import Swal from 'sweetalert2';
import { GallerySummary } from '@/types/types';
import { VisibilityBadge } from './VisibilityBadge';
import MediaViewport from '@/components/media-viewport'; 

interface GalleryCardProps {
  gallery: GallerySummary;
  onEdit: () => void;
  onDelete: () => void;
  priority?: boolean;
}

export const GalleryCard = memo(function GalleryCard({ 
  gallery, 
  onEdit, 
  onDelete,
  priority = false
}: GalleryCardProps) {
  
  const handleDeleteClick = async () => {
    const result = await Swal.fire({
      title: 'Delete Gallery?',
      html: `<span class="text-zinc-500">You are about to permanently delete <strong class="text-zinc-900">${gallery.title}</strong>. This action cannot be undone.</span>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#e4e4e7',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-2xl shadow-xl border border-zinc-100',
        title: 'font-semibold text-zinc-900 text-lg',
        htmlContainer: 'mt-2',
        confirmButton: 'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-red-600 hover:shadow-md',
        cancelButton: 'px-5 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100'
      }
    });

    if (result.isConfirmed) {
      onDelete();
    }
  };

  const getMediaInfo = () => {
    const media = gallery.randomMedia;
    
    if (!media) return { sourceUrl: null, posterUrl: null, mediaType: null };

    return {
      sourceUrl: media.thumbnailUrl,
      posterUrl: media.thumbnailUrl,
      mediaType: media.type
    };
  };

  const { sourceUrl, posterUrl, mediaType } = getMediaInfo();
  const hasMedia = !!sourceUrl;
  
  const mediaCount = gallery.mediaCount || 0;
  
  const createdDate = new Date(gallery.createdAt);
  const formattedDate = createdDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <article className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 transition-all duration-500 ease-out h-full border border-zinc-100/60 dark:border-zinc-800/60">
      
      {/* --- Media Area --- */}
      <Link 
        href={`/manage-gallery/${gallery.id}`} 
        className="block relative aspect-4/3 bg-zinc-50 dark:bg-zinc-950 overflow-hidden shrink-0 focus:outline-none"
        aria-label={`Manage gallery: ${gallery.title}`}
      >
        {hasMedia && mediaType ? (
          <>
            {/* Image Container with Zoom Effect */}
            <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-in-out will-change-transform">
              <MediaViewport
                mediaType={mediaType}
                fullResUrl={sourceUrl!}
                thumbnailUrl={posterUrl || sourceUrl!}
                caption={gallery.title}
                originalFilename={null}
                className="w-full h-full object-cover"
                priority={priority}
              />
            </div>
            
            {/* Gradient Overlay for better text contrast on hover */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Play Button Overlay for Video */}
            {mediaType === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-lg flex items-center justify-center opacity-90 scale-90 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 border border-white/20 dark:border-zinc-800">
                  <svg className="w-5 h-5 text-zinc-900 dark:text-zinc-100 ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
            <div className="p-4 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-3 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50">
              <svg className="w-6 h-6 text-zinc-300 dark:text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">No Media</span>
          </div>
        )}

        {/* Top Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
          <VisibilityBadge type={gallery.visibility} />
          
          {mediaCount > 0 && (
            <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow-sm border border-white/20 dark:border-zinc-800 flex items-center gap-1.5 pointer-events-auto transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {mediaCount}
            </div>
          )}
        </div>
      </Link>

      {/* --- Content Area --- */}
      <div className="flex flex-col grow p-5 sm:p-6 bg-white dark:bg-zinc-900">
        <div className="mb-3">
          <Link href={`/manage-gallery/${gallery.id}`} className="block group/title focus:outline-none">
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 leading-snug group-hover/title:text-zinc-600 dark:group-hover/title:text-zinc-300 transition-colors line-clamp-1 tracking-tight">
              {gallery.title}
            </h3>
          </Link>
          <time className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 mt-1.5 block uppercase tracking-widest">
            {formattedDate}
          </time>
        </div>

        {gallery.description ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-4 leading-relaxed grow font-light">
            {gallery.description}
          </p>
        ) : (
          <div className="grow" />
        )}

        {/* Actions Bar - Minimalist & Spaced */}
        <div className="mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            onClick={onEdit}
            className="inline-flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white active:scale-95"
            title="Edit Details"
            aria-label={`Edit details for ${gallery.title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
            
          <button
            onClick={handleDeleteClick}
            className="inline-flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/50 hover:text-rose-700 dark:hover:text-rose-300 rounded-lg transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 active:scale-95 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50"
            title="Delete Gallery"
            aria-label={`Delete gallery: ${gallery.title}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </article>
  );
});
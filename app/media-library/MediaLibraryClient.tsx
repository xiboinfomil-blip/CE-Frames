'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import MediaCard, { MediaSchema } from '@/app/media-library/components/MediaCard';
import UploadModal from '@/app/media-library/components/UploadModal'; 
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/SearchSortFilter'; 
import Pagination from '@/components/Pagination'; 
import FloatingActionButton from '@/components/FloatingActionButton'; 
import { MEDIA_TYPES } from '@/db/schema';
import GalleryLightbox from '@/components/GalleryLightbox'; 

interface MediaLibraryClientProps {
  initialMedia: MediaSchema[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: {
    search: string;
    type?: typeof MEDIA_TYPES[number];
    sortBy?: 'newest' | 'oldest' | 'name';
  };
}

// Hoisted static options to prevent recreation on every render
const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All Assets' },
  ...MEDIA_TYPES.map(type => ({
    value: type,
    label: type === 'image' ? 'Images' : type === 'video' ? 'Videos' : 'GIFs'
  }))
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' }
];

export default function MediaLibraryClient({ 
  initialMedia, 
  pagination,
  filters 
}: MediaLibraryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // Map media to Lightbox PhotoItem format
  const slides = useMemo(() => initialMedia.map(item => {
    const isVideo = item.type === 'video';
    
    return {
      type: isVideo ? 'video' : 'image', // 🚨 CRITICAL: Tells YARL to use the Video plugin
      src: !isVideo ? item.fullResUrl : undefined, // Image source
      sources: isVideo ? [{ src: item.fullResUrl, type: 'video/mp4' }] : undefined, // Video source array
      poster: isVideo ? item.thumbnailUrl : undefined, // 🚨 CRITICAL: Shows thumbnail before play
      width: item.width || 800,
      height: item.height || 600,
      alt: item.originalFilename || 'Media asset',
      title: item.originalFilename || undefined,
      description: item.caption || undefined,
    };
  }), [initialMedia]);

  const updateSearchParams = useCallback((params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    if (params.search !== undefined || params.type !== undefined || params.sortBy !== undefined) {
      newParams.set('page', '1');
    }
    
    router.push(`${pathname}?${newParams.toString()}`);
  }, [router, pathname, searchParams]);

  const handleSearch = useCallback(() => {
    updateSearchParams({ search: searchInput || undefined });
  }, [searchInput, updateSearchParams]);

  const handleTypeFilter = useCallback((type: string) => {
    updateSearchParams({ type: type === 'all' ? undefined : type as typeof MEDIA_TYPES[number] });
  }, [updateSearchParams]);

  const handleSort = useCallback((sortBy: string) => {
    updateSearchParams({ sortBy });
  }, [updateSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateSearchParams]);

  const handleDelete = useCallback(async (id: string) => {
    const result = await Swal.fire({
      title: 'Confirm Deletion',
      text: "This will permanently remove this asset from the archive.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, purge asset',
      cancelButtonText: 'Cancel',
      background: '#ffffff',
      customClass: {
        popup: 'rounded-xl shadow-2xl border border-slate-200',
        title: 'font-black text-slate-900 uppercase tracking-tight',
        htmlContainer: 'text-slate-600 font-medium',
        confirmButton: 'font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg transition-colors hover:bg-red-700',
        cancelButton: 'font-bold uppercase tracking-wider text-xs px-4 py-2.5 rounded-lg transition-colors hover:bg-slate-200'
      }
    });

    if (!result.isConfirmed) return;

    setIsDeleting(id);
    try {
      const res = await fetch(`/api/media?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      await Swal.fire({
        icon: 'success',
        title: 'Asset Purged',
        text: 'The media has been permanently removed.',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        customClass: {
          popup: 'rounded-xl shadow-2xl border border-slate-200',
          title: 'font-black text-slate-900 uppercase tracking-tight'
        }
      });

      router.refresh();
    } catch (error) {
      console.error('Failed to delete media:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Deletion Failed',
        text: 'An error occurred while removing the asset. Please try again.',
        background: '#ffffff',
        customClass: {
          popup: 'rounded-xl shadow-2xl border border-slate-200',
          title: 'font-black text-slate-900 uppercase tracking-tight'
        }
      });
    } finally {
      setIsDeleting(null);
    }
  }, [router]);

  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    updateSearchParams({ search: undefined, type: undefined, sortBy: undefined });
  }, [updateSearchParams]);

  const handleCloseUpload = useCallback(() => {
    setIsUploadOpen(false);
    router.refresh();
  }, [router]);

  const handleOpenLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(-1);
  }, []);

  const currentFilter = filters.type || 'all';
  const currentSort = filters.sortBy || 'newest';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white relative">
      
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4]" 
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        aria-hidden="true" 
      />
      
      <div className="relative z-10 flex flex-col min-h-screen">
        
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1600px] py-4">
            <MediaLibraryHeader
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearch}
              activeFilter={currentFilter}
              onFilterChange={handleTypeFilter}
              filters={FILTER_OPTIONS}
              activeSort={currentSort}
              onSortChange={handleSort}
              sorts={SORT_OPTIONS}
              totalItems={pagination.totalItems}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px]">
          
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Showing {initialMedia.length} of {pagination.totalItems} assets.
          </div>

          {initialMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm animate-fadeInUp">
              <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden border border-slate-200">
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
                <svg className="w-10 h-10 text-slate-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Empty</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs font-medium">No assets match your current filter parameters.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-8 px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {initialMedia.map((item, index) => (
                <MediaCard 
                  key={item.id}
                  media={item} 
                  onDelete={handleDelete}
                  onOpenLightbox={() => handleOpenLightbox(index)}
                  isDeleting={isDeleting === item.id}
                  priority={index === 0} // <-- Eager load ONLY the first item for LCP optimization
                />
              ))}
            </div>
          )}

          {initialMedia.length > 0 && (
            <div className="mt-12 flex justify-center animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
              <Pagination 
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasNext={pagination.hasNext}
                hasPrevious={pagination.hasPrevious}
                onPageChange={handlePageChange}
              />
            </div>
          )}

        </main>

        <FloatingActionButton 
          onClick={() => setIsUploadOpen(true)}
          label="Add Asset"
        />

        <UploadModal 
          isOpen={isUploadOpen} 
          onClose={handleCloseUpload} 
        />
      </div>
      
      {/* --- Lightbox Integration --- */}
      <GalleryLightbox
        index={lightboxIndex}
        slides={slides}
        onClose={handleCloseLightbox}
      />
      
      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp { 
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
      `}</style>
    </div>
  );
}
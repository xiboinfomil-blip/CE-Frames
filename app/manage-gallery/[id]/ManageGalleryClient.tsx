'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import MediaCard from './components/MediaCard';
import AddMediaModal from './components/AddMediaModal';
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/manageHeader';
import Pagination from '@/components/Pagination';
import FloatingActionButton from '@/components/FloatingActionButton';

interface GalleryData {
  id: string;
  title: string;
  description?: string | null;
  visibility: string;
  slug: string;
}

interface MediaItem {
  id: string;
  mediaId: string;
  position: number;
  media: {
    id: string;
    thumbnailUrl: string;
    fullResUrl: string;
    title?: string | null;
    type: string;
    width?: number | null;
    height?: number | null;
  };
}

interface AvailableMediaItem {
  id: string;
  thumbnailUrl: string;
  fullResUrl: string;
  title: string;
  type: string;
  uploadedAt: string | Date;
}

interface PaginationData {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface ManageGalleryClientProps {
  gallery: GalleryData;
  galleryMediaItems: MediaItem[];
  availableMedia: AvailableMediaItem[];
  mainPagination: PaginationData;
  modalPagination: PaginationData;
  initialFilters: {
    search: string;
    gallerySearch: string;
    type: 'all' | 'image' | 'video' | 'gif';
    sortBy: 'newest' | 'oldest' | 'name' | 'position';
  };
}

// Hoisted static configuration to prevent recreation on every render
const TYPE_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Assets' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'gif', label: 'GIFs' }
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'position', label: 'Custom Order' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' }
];

export default function ManageGalleryClient({ 
  gallery, 
  galleryMediaItems,
  availableMedia,
  mainPagination,
  modalPagination,
  initialFilters
}: ManageGalleryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Local state for inputs before submitting to URL
  const [gallerySearchInput, setGallerySearchInput] = useState(initialFilters.gallerySearch);
  const [modalSearchInput, setModalSearchInput] = useState(initialFilters.search);

  // Sync local input state if URL changes externally (e.g., browser back button)
  useEffect(() => {
    setGallerySearchInput(initialFilters.gallerySearch);
    setModalSearchInput(initialFilters.search);
  }, [initialFilters.gallerySearch, initialFilters.search]);

  // --- Server-Driven Filter Updates for Main List ---
  const updateMainFilters = useCallback((updates: {
    gallerySearch?: string;
    type?: 'all' | 'image' | 'video' | 'gif';
    sortBy?: 'newest' | 'oldest' | 'name' | 'position';
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const isFilterChange = updates.gallerySearch !== undefined || updates.type !== undefined || updates.sortBy !== undefined;
    
    if (updates.page !== undefined) {
      params.set('page', updates.page.toString());
    } else if (isFilterChange) {
      params.delete('page'); // Reset to page 1 on filter change
    }

    if (updates.gallerySearch !== undefined) {
      if (updates.gallerySearch) params.set('gallerySearch', updates.gallerySearch);
      else params.delete('gallerySearch');
    }
    
    if (updates.type !== undefined) {
      if (updates.type !== 'all') params.set('type', updates.type);
      else params.delete('type');
    }
    
    if (updates.sortBy !== undefined) {
      if (updates.sortBy !== 'position') params.set('sortBy', updates.sortBy);
      else params.delete('sortBy');
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // --- Server-Driven Filter Updates for Modal ---
  const updateModalFilters = useCallback((updates: {
    search?: string;
    type?: 'all' | 'image' | 'video' | 'gif';
    sortBy?: 'newest' | 'oldest' | 'name';
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
    const isFilterChange = updates.search !== undefined || updates.type !== undefined || updates.sortBy !== undefined;
    
    if (updates.page !== undefined) {
      params.set('modalPage', updates.page.toString());
    } else if (isFilterChange) {
      params.delete('modalPage');
    }

    if (updates.search !== undefined) {
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
    }
    
    if (updates.type !== undefined) {
      if (updates.type !== 'all') params.set('type', updates.type);
      else params.delete('type');
    }
    
    if (updates.sortBy !== undefined) {
      if (updates.sortBy !== 'newest') params.set('sortBy', updates.sortBy);
      else params.delete('sortBy');
    }
    
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  // --- Handlers ---
  const handleMainSearchSubmit = useCallback(() => {
    updateMainFilters({ gallerySearch: gallerySearchInput, page: 1 });
  }, [gallerySearchInput, updateMainFilters]);

  const handleMainTypeFilter = useCallback((type: 'all' | 'image' | 'video' | 'gif') => {
    updateMainFilters({ type, page: 1 });
  }, [updateMainFilters]);

  const handleMainSortChange = useCallback((sortBy: 'newest' | 'oldest' | 'name' | 'position') => {
    updateMainFilters({ sortBy, page: 1 });
  }, [updateMainFilters]);

  const handleMainPageChange = useCallback((page: number) => {
    updateMainFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateMainFilters]);

  const handleModalSearchSubmit = useCallback(() => {
    updateModalFilters({ search: modalSearchInput, page: 1 });
  }, [modalSearchInput, updateModalFilters]);

  const handleModalTypeFilter = useCallback((type: 'all' | 'image' | 'video' | 'gif') => {
    updateModalFilters({ type, page: 1 });
  }, [updateModalFilters]);

  const handleModalSortChange = useCallback((sortBy: 'newest' | 'oldest' | 'name') => {
    updateModalFilters({ sortBy, page: 1 });
  }, [updateModalFilters]);

  const handleModalPageChange = useCallback((page: number) => {
    updateModalFilters({ page });
  }, [updateModalFilters]);

  const handleRemoveMedia = useCallback(async (mediaId: string) => {
    const result = await Swal.fire({
      title: 'Confirm Removal',
      text: "Remove this asset from the gallery? This does not delete the original file from the library.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, remove it',
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

    try {
      const res = await fetch(`/api/gallery-media?galleryId=${gallery.id}&mediaId=${mediaId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove');
      
      await Swal.fire({
        icon: 'success',
        title: 'Asset Removed',
        text: 'The media has been detached from this gallery.',
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
      console.error('Failed to remove media', error);
      await Swal.fire({
        icon: 'error',
        title: 'Removal Failed',
        text: 'An error occurred while removing the asset.',
        background: '#ffffff',
        customClass: { 
          popup: 'rounded-xl shadow-2xl border border-slate-200',
          title: 'font-black text-slate-900 uppercase tracking-tight'
        }
      });
    }
  }, [gallery.id, router]);

  const handleAddMediaToGallery = useCallback(async (mediaId: string) => {
    try {
      const res = await fetch('/api/gallery-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId: gallery.id, mediaId }),
      });
      if (!res.ok) throw new Error('Failed to add media');
      
      router.refresh();
      return true;
    } catch (error) {
      console.error('Failed to add media', error);
      await Swal.fire({
        icon: 'error',
        title: 'Add Failed',
        text: 'An error occurred while adding the asset.',
        background: '#ffffff',
        customClass: { 
          popup: 'rounded-xl shadow-2xl border border-slate-200',
          title: 'font-black text-slate-900 uppercase tracking-tight'
        }
      });
      return false;
    }
  }, [gallery.id, router]);

  const handleCloseModal = useCallback(() => {
    setIsAddModalOpen(false);
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white relative">
      
      {/* Subtle Telemetry Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4]" 
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* --- Sticky Dashboard Control Panel --- */}
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <MediaLibraryHeader
              title={gallery.title}
              subtitle={`ID: ${gallery.slug.toUpperCase()} • VISIBILITY: ${gallery.visibility.replace('_', ' ').toUpperCase()}`}
              searchPlaceholder="Search current assets..."
              searchValue={gallerySearchInput}
              onSearchChange={setGallerySearchInput}
              onSearchSubmit={handleMainSearchSubmit}
              activeFilter={initialFilters.type}
              onFilterChange={handleMainTypeFilter}
              filters={TYPE_FILTERS}
              activeSort={initialFilters.sortBy}
              onSortChange={handleMainSortChange}
              sorts={SORT_OPTIONS}
              totalItems={mainPagination.total}
              currentPage={mainPagination.currentPage}
              totalPages={mainPagination.totalPages}
              onPageChange={handleMainPageChange}
            />
          </div>
        </header>

        {/* Sleek Technical Finish-Line Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/40 to-transparent" aria-hidden="true" />

        {/* --- Main Content Area --- */}
        <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Showing {galleryMediaItems.length} of {mainPagination.total} assets.
          </div>

          {galleryMediaItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden animate-fadeInUp">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
              
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 relative shadow-sm">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">
                {mainPagination.total === 0 ? 'Telemetry Empty' : 'No Matches Found'}
              </h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs font-medium leading-relaxed">
                {mainPagination.total === 0 
                  ? 'No assets assigned to this gallery yet.' 
                  : 'Try adjusting your search or filter parameters.'}
              </p>
              {mainPagination.total === 0 && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-8 px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-red-500/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Initialize Upload
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 animate-fadeInUp">
                {galleryMediaItems.map((item) => (
                  <MediaCard 
                    key={item.mediaId} 
                    media={item.media} 
                    onRemove={handleRemoveMedia}
                  />
                ))}
              </div>
              
              {/* Premium Pagination Component */}
              {mainPagination.totalPages > 1 && (
                <Pagination 
                  currentPage={mainPagination.currentPage}
                  totalPages={mainPagination.totalPages}
                  hasNext={mainPagination.hasNext}
                  hasPrevious={mainPagination.hasPrevious}
                  onPageChange={handleMainPageChange}
                  className="mt-12"
                />
              )}
            </>
          )}

        </main>

        {/* --- Floating Action Button (FAB) --- */}
        <FloatingActionButton 
          onClick={() => setIsAddModalOpen(true)}
          label="Add Asset"
        />

        {/* --- Add Media Modal --- */}
        <AddMediaModal 
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          galleryId={gallery.id}
          availableMedia={availableMedia}
          modalPagination={modalPagination}
          initialFilters={{
            search: initialFilters.search,
            type: initialFilters.type,
            sortBy: initialFilters.sortBy === 'position' ? 'newest' : initialFilters.sortBy
          }}
          onSearchChange={setModalSearchInput}
          onSearchSubmit={handleModalSearchSubmit}
          onFilterChange={handleModalTypeFilter}
          onSortChange={handleModalSortChange}
          onPageChange={handleModalPageChange}
          onAddMedia={handleAddMediaToGallery}
        />
      </div>

      {/* Inline Styles for Snappy, Racecar-Inspired Animations */}
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
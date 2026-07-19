'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import GalleryGrid from './components/GalleryGrid';
import CreateGalleryModal from '@/app/manage-gallery/components/CreateGalleryModal';
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/manageHeader';
import Pagination from '@/components/Pagination';
import FloatingActionButton from '@/components/FloatingActionButton';
import { VISIBILITY_STATUSES } from '@/db/schema';

// --- Shared Types ---
export type MediaType = 'image' | 'video' | 'gif';

export interface Media {
  id: string;
  url: string; // Note: Ensure your API returns 'url' or map thumbnailUrl to url if needed
  type: MediaType;
  thumbnailUrl?: string | null;
  title?: string | null;
}

export interface GalleryMediaItem {
  media: Media;
  position: number;
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
}

export interface Gallery {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  visibility: typeof VISIBILITY_STATUSES[number];
  coverMediaId?: string | null;
  layoutStyle?: string;
  createdAt: Date | string;
  user?: User;
  coverMedia?: Media | null;
  galleryMedia?: GalleryMediaItem[];
  randomMedia?: Media | null; // <--- ADDED THIS
}

interface GalleriesContentProps {
  initialGalleries: Gallery[];
  pagination: {
    total: number;
    currentPage?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    limit?: number;
  };
  filters: {
    search: string;
    sortBy?: 'newest' | 'oldest' | 'name';
    visibility?: typeof VISIBILITY_STATUSES[number];
  };
}

// ... (VISIBILITY_FILTERS and SORT_OPTIONS remain same) ...
const VISIBILITY_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Collections' },
  ...VISIBILITY_STATUSES.map(status => ({
    value: status,
    label: status === 'public' ? 'Public' : 
           status === 'private' ? 'Private' : 
           status === 'password_protected' ? 'Locked' : 
           status === 'unlisted' ? 'Unlisted' : status
  }))
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' }
];

export default function GalleriesContent({ 
  initialGalleries, 
  pagination,
  filters 
}: GalleriesContentProps) {
  // ... (state and handlers remain same) ...
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search);

  const updateSearchParams = useCallback((params: Record<string, string | undefined>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    if (params.search !== undefined || params.sortBy !== undefined || params.visibility !== undefined) {
      newParams.set('page', '1');
    }
    router.push(`${pathname}?${newParams.toString()}`);
  }, [router, pathname, searchParams]);

  const handleSearch = useCallback(() => {
    updateSearchParams({ search: searchInput || undefined });
  }, [searchInput, updateSearchParams]);

  const handleSort = useCallback((sortBy: string) => {
    updateSearchParams({ sortBy });
  }, [updateSearchParams]);

  const handleVisibilityFilter = useCallback((visibility: string) => {
    updateSearchParams({ 
      visibility: visibility === 'all' ? undefined : visibility as typeof VISIBILITY_STATUSES[number]
    });
  }, [updateSearchParams]);

  const handlePageChange = useCallback((newPage: number) => {
    updateSearchParams({ page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateSearchParams]);

  const handleResetFilters = useCallback(() => {
    setSearchInput('');
    updateSearchParams({ search: undefined, sortBy: undefined, visibility: undefined });
  }, [updateSearchParams]);

  const handleOpenCreateModal = useCallback(() => {
    setEditingGallery(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((gallery: Gallery) => {
    setEditingGallery(gallery);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingGallery(null);
    router.refresh();
  }, [router]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    try {
      const response = await fetch(`/api/galleries/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete gallery');
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  }, [router]);

  const currentVisibility = filters.visibility || 'all';
  const currentSort = filters.sortBy || 'newest';
  const displayPage = pagination.currentPage || 1;
  const displayTotalPages = pagination.totalPages || 1;
  const hasNext = pagination.hasNext ?? (displayPage < displayTotalPages);
  const hasPrevious = pagination.hasPrevious ?? (displayPage > 1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white relative">
      <div className="absolute inset-0 pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} aria-hidden="true" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <MediaLibraryHeader
              title="My Galleries"
              subtitle="Telemetry v2.0"
              searchPlaceholder="Search collection..."
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearch}
              activeFilter={currentVisibility}
              onFilterChange={handleVisibilityFilter}
              filters={VISIBILITY_FILTERS}
              activeSort={currentSort}
              onSortChange={handleSort}
              sorts={SORT_OPTIONS}
              totalItems={pagination.total}
              currentPage={displayPage}
              totalPages={displayTotalPages}
            />
          </div>
        </header>
        
        <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/40 to-transparent" aria-hidden="true" />

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Showing {initialGalleries.length} of {pagination.total} galleries.
          </div>

          {initialGalleries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden animate-fadeInUp">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
              <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 relative shadow-sm">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Telemetry Empty</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-xs font-medium leading-relaxed">
                No galleries match your current filter parameters.
              </p>
              <button 
                onClick={handleResetFilters}
                className="mt-8 px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-red-500/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeInUp">
              <GalleryGrid 
                galleries={initialGalleries} 
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
              />
              
              <div className="flex justify-center pt-4">
                <Pagination 
                  currentPage={displayPage}
                  totalPages={displayTotalPages}
                  hasNext={hasNext}
                  hasPrevious={hasPrevious}
                  onPageChange={handlePageChange}
                />
              </div>
            </div>
          )}
        </main>

        <FloatingActionButton onClick={handleOpenCreateModal} label="New Gallery" />
        <CreateGalleryModal isOpen={isModalOpen} onClose={handleCloseModal} initialData={editingGallery} />
      </div>

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
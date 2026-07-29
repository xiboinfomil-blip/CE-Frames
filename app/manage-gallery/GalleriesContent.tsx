'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import GalleryGrid from './components/GalleryGrid';
import CreateGalleryModal from '@/app/manage-gallery/components/CreateGalleryModal';
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination';
import FloatingActionButton from '@/components/FloatingActionButton';
import { VISIBILITY_STATUSES } from '@/db/schema';
import { GallerySummary } from '@/types/types';

interface GalleriesContentProps {
  // ✅ Updated to use GallerySummary
  initialGalleries: GallerySummary[];
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  // ✅ Updated state type to GallerySummary
  const [editingGallery, setEditingGallery] = useState<GallerySummary | null>(null);
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

  // ✅ Updated parameter type to GallerySummary
  const handleOpenEditModal = useCallback((gallery: GallerySummary) => {
    setEditingGallery(gallery);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingGallery(null);
    router.refresh();
  }, [router]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/galleries/${id}`, { method: 'DELETE' });
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
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-sans selection:bg-zinc-200 selection:text-zinc-900 relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-zinc-200/60 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <MediaLibraryHeader
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

        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Showing {initialGalleries.length} of {pagination.total} galleries.
          </div>

          {initialGalleries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-zinc-200 shadow-sm animate-fadeInUp">
              <div className="w-20 h-20 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 border border-zinc-100">
                <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-zinc-900">No collections found</h3>
              <p className="text-zinc-500 text-sm mt-2 max-w-xs">No galleries match your current filters. Try adjusting your search or create a new collection.</p>
              <button 
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-all duration-200 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2"
              >
                Clear Filters
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
        {/* Note: Ensure CreateGalleryModal accepts GallerySummary | null for initialData */}
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
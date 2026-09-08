'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { GallerySummary } from '@/types/types'; 
import MediaLibraryHeader from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination'; 
import CardGrid from '@/components/displayGrid'; 
import MediaViewport from '@/components/media-viewport';
import EmptyState from '@/components/gallery/EmptyState';
import { Calendar, ArrowRight, Image as ImageIcon } from 'lucide-react';

interface GalleryClientProps {
  initialGalleries: GallerySummary[];
  totalGalleries: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  initialParams: {
    search: string;
    sort: string;
    filter: string;
  };
}

type SortOption = 'newest' | 'oldest' | 'name';
type FilterOption = 'all' | 'public' | 'password_protected';

export default function GalleryClient({ 
  initialGalleries, 
  totalGalleries,
  currentPage,
  totalPages,
  hasNext,
  hasPrevious,
  initialParams 
}: GalleryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isPending, startTransition] = useTransition();
  
  const [searchQuery, setSearchQuery] = useState(initialParams.search);
  const [sortBy, setSortBy] = useState<SortOption>(initialParams.sort as SortOption);
  const [filterType, setFilterType] = useState<FilterOption>(initialParams.filter as FilterOption);

  const updateUrl = useCallback((params: Record<string, string>) => {
    startTransition(() => {
      const current = new URLSearchParams(Array.from(searchParams.entries()));
      Object.entries(params).forEach(([key, value]) => {
        if (value === '' || value === 'all' || value === 'newest') {
          current.delete(key);
        } else {
          current.set(key, value);
        }
      });
      const search = current.toString();
      const query = search ? `?${search}` : '';
      router.push(`${pathname}${query}`);
    });
  }, [searchParams, pathname, router, startTransition]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== initialParams.search) {
        updateUrl({ search: searchQuery, page: '1' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, initialParams.search, updateUrl]);

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort as SortOption);
    updateUrl({ sort: newSort, page: '1' });
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterType(newFilter as FilterOption);
    updateUrl({ filter: newFilter, page: '1' });
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGalleryClick = (gallery: GallerySummary) => {
    router.push(`/galeries/${gallery.id}`);
  };

  const displayedGalleries = initialGalleries;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-zinc-900 selection:text-white font-sans antialiased">
      
      {/* Sticky Header - Full Width */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 transition-colors duration-300">
        <div className="w-full px-6 lg:px-12 py-6">

          <MediaLibraryHeader
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            onSearchSubmit={() => updateUrl({ search: searchQuery, page: '1' })}
            
            activeFilter={filterType}
            onFilterChange={handleFilterChange}
            filters={[
              { value: 'all', label: 'Toutes les galeries' },
              { value: 'public', label: 'Publiques' },
              { value: 'password_protected', label: 'Mot de passe requis' }
            ]}
            
            activeSort={sortBy}
            onSortChange={handleSortChange}
            sorts={[
              { value: 'newest', label: 'Plus récentes' },
              { value: 'oldest', label: 'Plus anciennes' },
              { value: 'name', label: 'Nom (A-Z)' }
            ]}
            
            totalItems={totalGalleries}
            currentPage={currentPage}
            totalPages={totalPages}
          />
        </div>
      </header>

      <main className="w-full px-6 lg:px-12 py-12 min-h-[60vh]">
        {isPending && (
          <div className="fixed inset-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm flex items-center justify-center pointer-events-none transition-opacity duration-300">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-100 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-100"></div>
          </div>
        )}

        <CardGrid
          items={displayedGalleries}
          getKey={(item) => item.id}
          emptyState={
            <EmptyState />
          }
          ariaLabel="Galeries photos CSE"
          renderItem={(gallery, index) => {
            const displayMedia = gallery.randomMedia; 
            
            // --- Fallback State (No Media) ---
            if (!displayMedia) {
              return (
                <button
                  onClick={() => handleGalleryClick(gallery)}
                  className="group relative w-full aspect-[4/5] bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-850 transition-all duration-300 flex flex-col items-center justify-center text-center p-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                >
                  <div className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                  </div>
                  <h3 className="text-zinc-900 dark:text-zinc-100 font-medium">{gallery.title}</h3>
                  <p className="text-xs text-zinc-400 mt-2 uppercase tracking-widest">Album vide</p>
                </button>
              );
            }

            // --- Standard Card State ---
            return (
              <article 
                onClick={() => handleGalleryClick(gallery)}
                className="group flex flex-col h-full cursor-pointer focus:outline-none"
              >
                {/* Image Container */}
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-900 shadow-sm group-hover:shadow-md transition-shadow duration-500">
                  <MediaViewport
                    mediaType={displayMedia.type}
                    fullResUrl={displayMedia.fullResUrl || displayMedia.thumbnailUrl}
                    thumbnailUrl={displayMedia.thumbnailUrl}
                    caption={gallery.title}
                    originalFilename={null}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={index < 4}
                  />
                  
                  {/* Subtle Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* View Button Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md text-zinc-900 dark:text-zinc-100 text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg flex items-center justify-center gap-2">
                      Voir l&apos;album
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                
                {/* Content Info */}
                <div className="mt-5 px-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-zinc-900 dark:text-zinc-100 font-medium text-lg leading-snug truncate group-hover:text-zinc-600 dark:group-hover:text-zinc-400 transition-colors">
                        {gallery.title}
                      </h3>
                      {gallery.description && (
                        <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1.5 line-clamp-2 leading-relaxed font-light">
                          {gallery.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Meta Footer - Date Only */}
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <time className="text-xs text-zinc-400 font-medium flex items-center gap-1.5 uppercase tracking-wide">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(gallery.createdAt).toLocaleDateString('fr-FR', { 
                        day: 'numeric',
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </time>
                  </div>
                </div>
              </article>
            );
          }}
        />
      </main>

      {/* Pagination Footer */}
      {(hasNext || hasPrevious) && (
        <div className="w-full border-t border-zinc-100 dark:border-zinc-800 py-12 bg-white dark:bg-zinc-950">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
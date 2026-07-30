'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { GallerySummary } from '@/types/types'; 
import MediaLibraryHeader from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination'; 
import CardGrid from '@/components/displayGrid'; 
import MediaViewport from '@/components/media-viewport';
import EmptyState from '@/components/gallery/EmptyState';
import { Lock, Calendar } from 'lucide-react';
import { 
  getUnlockedGalleries, 
  saveUnlockedGallery
} from '@/lib/gallery-utils';

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

  const handleGalleryClick = async (gallery: GallerySummary) => {
    const unlockedGalleries = getUnlockedGalleries();

    if (gallery.visibility === 'password_protected' && !unlockedGalleries.includes(gallery.id)) {
      
      const result = await Swal.fire({
        title: '<span class="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Protected Gallery</span>',
        html: `
          <div class="text-left space-y-4 mt-2">
            <p class="text-zinc-500 dark:text-zinc-400 text-sm">Please enter the access key to view this collection.</p>
            <input 
              type="password" 
              id="gallery-password" 
              class="w-full px-4 py-3 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:border-zinc-900 dark:focus:border-white focus:ring-4 focus:ring-zinc-100 dark:focus:ring-zinc-800 transition-all outline-none text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900"
              placeholder="Enter password"
              style="margin: 0;"
            />
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Unlock',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950',
          confirmButton: 'bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors',
          cancelButton: 'bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors',
        },
        allowOutsideClick: false,
        allowEscapeKey: false,
        preConfirm: () => {
          const passwordInput = document.getElementById('gallery-password') as HTMLInputElement;
          const password = passwordInput?.value;
          if (!password) {
            Swal.showValidationMessage('Password is required');
            return false; 
          }
          return password;
        },
      });

      if (!result.isConfirmed) return;
      
      const password = result.value as string;

      Swal.fire({
        title: '',
        html: '<div class="animate-spin rounded-full h-8 w-8 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white mx-auto"></div>',
        showConfirmButton: false,
        allowOutsideClick: false,
        background: 'transparent',
      });

      try {
        const response = await fetch('/api/galleries/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ galleryId: gallery.id, password }),
        });

        const data = await response.json();
        Swal.close();

        if (data.success) {
          saveUnlockedGallery(gallery.id);
          router.push(`/gallery/${gallery.id}`);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: data.message || 'Incorrect password',
            confirmButtonText: 'Try Again',
            customClass: { 
              popup: 'rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800',
              confirmButton: 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl' 
            }
          });
        }
      } catch {
        Swal.close();
        Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: 'Failed to verify password',
          customClass: { popup: 'rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800' }
        });
      }
    } else {
      router.push(`/gallery/${gallery.id}`);
    }
  };

  const displayedGalleries = initialGalleries;

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 relative flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-900 dark:selection:text-rose-100">
      
      {/* Content */}
      <div className="relative z-10 grow">
        
        {/* Header & Controls */}
        <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30 border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Gallery</h1>
              <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Explore our curated collections</p>
            </div>

            <MediaLibraryHeader
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchSubmit={() => updateUrl({ search: searchQuery, page: '1' })}
              
              activeFilter={filterType}
              onFilterChange={handleFilterChange}
              filters={[
                { value: 'all', label: 'All Collections' },
                { value: 'public', label: 'Public' },
                { value: 'password_protected', label: 'Password Protected' }
              ]}
              
              activeSort={sortBy}
              onSortChange={handleSortChange}
              sorts={[
                { value: 'newest', label: 'Newest Arrivals' },
                { value: 'oldest', label: 'Classic First' },
                { value: 'name', label: 'Alphabetical' }
              ]}
              
              totalItems={totalGalleries}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        </div>

        <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isPending && (
             <div className="fixed inset-0 z-40 bg-white/60 dark:bg-zinc-950/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
               <div className="animate-spin rounded-full h-10 w-10 border-2 border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-white"></div>
             </div>
          )}

          <div className="min-h-100">
            <CardGrid
              items={displayedGalleries}
              getKey={(item) => item.id}
              emptyState={<EmptyState />}
              ariaLabel="Photo Galleries"
              renderItem={(gallery, index) => {
                const displayMedia = gallery.randomMedia; 
                
                // --- Fallback State (No Media) ---
                if (!displayMedia) {
                  return (
                    <button
                      onClick={() => handleGalleryClick(gallery)}
                      className="group relative w-full aspect-4/3 bg-white dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all duration-300 flex flex-col items-center justify-center text-center p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-white"
                    >
                      <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-zinc-400 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-zinc-700 dark:text-zinc-300 font-bold">{gallery.title}</h3>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-widest">Empty Collection</p>
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
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-900 shadow-sm hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-black/50 transition-all duration-500 ease-out group-hover:-translate-y-1">
                      <MediaViewport
                        mediaType={displayMedia.type}
                        fullResUrl={displayMedia.fullResUrl || displayMedia.thumbnailUrl}
                        thumbnailUrl={displayMedia.thumbnailUrl}
                        caption={gallery.title}
                        originalFilename={null}
                        className="h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                        priority={index === 0}
                      />
                      
                      {/* Hover Overlay Gradient */}
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Locked Badge */}
                      {gallery.visibility === 'password_protected' && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md text-zinc-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-full shadow-sm border border-white/20 dark:border-zinc-800 flex items-center gap-1.5">
                            <Lock className="w-3 h-3" />
                            Protected
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Info */}
                    <div className="mt-4 px-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-zinc-900 dark:text-zinc-100 font-bold text-base leading-snug truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors tracking-tight">
                            {gallery.title}
                          </h3>
                          {gallery.description && (
                            <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1 line-clamp-2 leading-relaxed font-medium">
                              {gallery.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Meta Footer */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                        {gallery.owner ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-400 uppercase">
                              {gallery.owner.username.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">@{gallery.owner.username}</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        )}
                        
                        <span className="text-zinc-300 dark:text-zinc-700 text-xs">•</span>
                        
                        <time className="text-xs text-zinc-400 dark:text-zinc-500 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(gallery.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </time>
                      </div>
                    </div>
                  </article>
                );
              }}
            />
          </div>
        </main>
      </div>

      {/* Pagination Footer */}
      <div className="bg-white dark:bg-zinc-950 border-t border-zinc-200/60 dark:border-zinc-800/60 py-12 relative z-10 transition-colors duration-300">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
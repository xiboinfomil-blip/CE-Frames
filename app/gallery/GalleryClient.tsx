'use client';

import { useState, useEffect, useTransition, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { Gallery } from '@/types/gallery';

// Your Custom Components
import MediaLibraryHeader from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination'; 
import CardGrid from '@/components/displayGrid'; 
import MediaViewport from '@/components/media-viewport';
import EmptyState from '@/components/gallery/EmptyState';

// Utilities
import { 
  getUnlockedGalleries, 
  saveUnlockedGallery
} from '@/lib/gallery-utils';

interface GalleryClientProps {
  initialGalleries: Gallery[];
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
  
  // Local State for Inputs
  const [searchQuery, setSearchQuery] = useState(initialParams.search);
  const [sortBy, setSortBy] = useState<SortOption>(initialParams.sort as SortOption);
  const [filterType, setFilterType] = useState<FilterOption>(initialParams.filter as FilterOption);

  // ✅ Wrapped in useCallback and moved above useEffect to fix hook dependency & declaration errors
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

  // Debounce Search to update URL
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

  // Password Protection Logic
  const handleGalleryClick = async (gallery: Gallery) => {
    const unlockedGalleries = getUnlockedGalleries();

    if (gallery.visibility === 'password_protected' && !unlockedGalleries.includes(gallery.id)) {
      
      const result = await Swal.fire({
        title: '<span class="text-xl font-light text-slate-800">Protected Gallery</span>',
        html: `
          <div class="text-left space-y-4 mt-2">
            <p class="text-slate-500 text-sm">Please enter the access key to view this collection.</p>
            <input 
              type="password" 
              id="gallery-password" 
              class="w-full px-4 py-3 border border-slate-200 rounded-lg focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none text-slate-700 bg-white"
              placeholder="Enter password"
              style="margin: 0;"
            />
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Unlock',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'rounded-2xl shadow-xl border-0',
          confirmButton: 'bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors',
          cancelButton: 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors',
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
        html: '<div class="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-slate-900 mx-auto"></div>',
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
            customClass: { confirmButton: 'bg-slate-900 text-white rounded-lg' }
          });
        }
      } catch { // ✅ Removed unused 'error' variable
        Swal.close();
        Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: 'Failed to verify password',
        });
      }
    } else {
      router.push(`/gallery/${gallery.id}`);
    }
  };

  const displayedGalleries = initialGalleries;

  return (
    <div className="min-h-screen bg-white relative flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Subtle Top Accent */}
      <div className="h-1 w-full bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

      {/* Content */}
      <div className="relative z-10 grow">
        
        {/* Header & Controls */}
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gallery</h1>
              <p className="text-slate-500 mt-1">Explore our curated collections</p>
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

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isPending && (
             <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
               <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-100 border-t-blue-600"></div>
             </div>
          )}

          <div className="min-h-100">
            <CardGrid
              items={displayedGalleries}
              getKey={(item) => item.id}
              emptyState={<EmptyState />}
              ariaLabel="Photo Galleries"
              renderItem={(gallery, index) => {
                const displayMedia = gallery.coverMedia || gallery.randomMedia;
                
                // --- Fallback State (No Media) ---
                if (!displayMedia) {
                  return (
                    <button
                      onClick={() => handleGalleryClick(gallery)}
                      className="group relative w-full aspect-4/3 bg-slate-50 rounded-xl border border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all duration-300 flex flex-col items-center justify-center text-center p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                        <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h3 className="text-slate-700 font-medium">{gallery.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">Empty Collection</p>
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
                    <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl bg-slate-100 shadow-sm ring-1 ring-slate-900/5 transition-all duration-500 ease-out group-hover:shadow-xl group-hover:-translate-y-1 group-hover:ring-blue-500/20">
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
                      
                      {/* Locked Badge (Visible on Hover or Always if preferred) */}
                      {gallery.visibility === 'password_protected' && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-white/90 backdrop-blur-sm text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-blue-600">
                              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                            </svg>
             protected
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Content Info */}
                    <div className="mt-4 px-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-slate-900 font-semibold text-base leading-snug truncate group-hover:text-blue-600 transition-colors">
                            {gallery.title}
                          </h3>
                          {gallery.description && (
                            <p className="text-slate-500 text-sm mt-1 line-clamp-2 leading-relaxed">
                              {gallery.description}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {/* Meta Footer */}
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100">
                        {gallery.user ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-linear-to-br from-blue-400 to-purple-400 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                              {gallery.user.username.charAt(0)}
                            </div>
                            <span className="text-xs font-medium text-slate-600">@{gallery.user.username}</span>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200" />
                        )}
                        
                        <span className="text-slate-300 text-xs">•</span>
                        
                        <time className="text-xs text-slate-400 font-medium">
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
      <div className="bg-white border-t border-slate-100 py-12 relative z-10">
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

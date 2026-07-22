'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { Gallery } from '@/types/gallery';

// Your Custom Components
import MediaLibraryHeader from '@/components/SearchSortFilter';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import EmptyState from '@/components/gallery/EmptyState';
import Pagination from '@/components/Pagination'; 

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
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>(initialParams.sort as any);
  const [filterType, setFilterType] = useState<'all' | 'public' | 'password_protected'>(initialParams.filter as any);

  // Debounce Search to update URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== initialParams.search) {
        updateUrl({ search: searchQuery, page: '1' });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const updateUrl = (params: Record<string, string>) => {
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
  };

  const handleSortChange = (newSort: string) => {
    setSortBy(newSort as any);
    updateUrl({ sort: newSort, page: '1' });
  };

  const handleFilterChange = (newFilter: string) => {
    setFilterType(newFilter as any);
    updateUrl({ filter: newFilter, page: '1' });
  };

  const handlePageChange = (page: number) => {
    updateUrl({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Password Protection Logic - Refined Modal Behavior
  const handleGalleryClick = async (gallery: Gallery) => {
    const unlockedGalleries = getUnlockedGalleries();

    if (gallery.visibility === 'password_protected' && !unlockedGalleries.includes(gallery.id)) {
      
      // Use SweetAlert2 as a persistent modal
      const result = await Swal.fire({
        title: '<span class="text-2xl font-bold text-slate-900 uppercase italic">Protected Gallery</span>',
        html: `
          <div class="text-left space-y-4 mt-4">
            <p class="text-slate-600 mb-2 font-medium">This gallery is locked. Please enter the password.</p>
            <input 
              type="password" 
              id="gallery-password" 
              class="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 transition-all duration-300 outline-none text-slate-700 placeholder-slate-400 bg-slate-50"
              placeholder="Enter password"
              style="margin: 0;"
            />
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: '<span class="font-bold uppercase tracking-wider">Unlock</span>',
        cancelButtonText: 'Cancel',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-100',
          confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300',
          cancelButton: 'bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-xl font-bold uppercase tracking-wider transition-all duration-300',
        },
        // CRITICAL: Prevent closing by clicking outside or pressing ESC
        allowOutsideClick: false,
        allowEscapeKey: false,
        background: '#ffffff',
        
        // Validation before closing
        preConfirm: () => {
          const passwordInput = document.getElementById('gallery-password') as HTMLInputElement;
          const password = passwordInput?.value;
          
          if (!password) {
            // Show error inside the modal without closing it
            Swal.showValidationMessage('Please enter a password');
            return false; 
          }
          return password;
        },
      });

      // If user cancelled or validation failed, stop here
      if (!result.isConfirmed) return;
      
      const password = result.value as string;

      // Show loading state INSIDE the modal while checking
      Swal.fire({
        title: 'Verifying...',
        html: 'Checking credentials',
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        const response = await fetch('/api/galleries/verify-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ galleryId: gallery.id, password }),
        });

        const data = await response.json();

        if (data.success) {
          saveUnlockedGallery(gallery.id);
          // Close the loading modal and redirect
          Swal.close();
          router.push(`/gallery/${gallery.id}`);
        } else {
          // Close loading modal and show error modal
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: data.message || 'Incorrect password',
            customClass: { popup: 'rounded-2xl' },
            confirmButtonText: 'Try Again',
            allowOutsideClick: false, // Keep error modal open too if desired
          });
        }
      } catch (error) {
        Swal.fire({ 
          icon: 'error', 
          title: 'Error', 
          text: 'Failed to verify password',
          allowOutsideClick: false,
        });
      }
    } else {
      router.push(`/gallery/${gallery.id}`);
    }
  };

  const displayedGalleries = initialGalleries;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden flex flex-col">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Racing Speed Lines */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20"></div>
        <div className="absolute top-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-400 to-transparent opacity-15"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-grow">
        
        {/* Controls Section - Using MediaLibraryHeader */}
        <MediaLibraryHeader
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={() => updateUrl({ search: searchQuery, page: '1' })}
          
          activeFilter={filterType}
          onFilterChange={handleFilterChange}
          filters={[
            { value: 'all', label: 'All Types' },
            { value: 'public', label: 'Public' },
            { value: 'password_protected', label: 'Locked' }
          ]}
          
          activeSort={sortBy}
          onSortChange={handleSortChange}
          sorts={[
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'name', label: 'Title A-Z' }
          ]}
          
          totalItems={totalGalleries}
          currentPage={currentPage}
          totalPages={totalPages}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isPending && (
             <div className="fixed inset-0 z-40 bg-white/50 backdrop-blur-[2px] flex items-center justify-center pointer-events-none mt-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
             </div>
          )}

          <div className="min-h-[400px]">
            {displayedGalleries.length === 0 ? (
              <EmptyState />
            ) : (
              <GalleryGrid
                galleries={displayedGalleries}
                onGalleryClick={handleGalleryClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Pagination Footer */}
      <div className="bg-white border-t border-slate-200 py-8 relative z-10">
        <Pagination 
          currentPage={currentPage}
          totalPages={totalPages}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Bottom Racing Stripe */}
      <div className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-slate-900 to-red-500 opacity-30 z-50"></div>
    </div>
  );
}
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import MediaCard from './components/MediaCard'; // Adjust path if needed
import AddMediaModal from './components/AddMediaModal'; // Adjust path if needed
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination';
import FloatingActionButton from '@/components/FloatingActionButton';
import PhotoAlbum from "react-photo-album";
import "react-photo-album/styles.css";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface GalleryData {
  id: string;
  title: string;
  description?: string | null;
  visibility: string;
  slug: string;
  layoutStyle?: 'masonry' | 'row' | 'column';
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
  type: 'image' | 'video' | 'gif';
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

// --- DND Photo Components ---
function SortablePhoto({ 
  id, 
  item, 
  onRemove, 
  priority,
  wrapperStyle
}: { 
  id: string; 
  item: MediaItem; 
  onRemove: (mediaId: string) => void; 
  priority?: boolean;
  wrapperStyle?: React.CSSProperties;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    ...wrapperStyle,
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative w-full h-full">
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-3 left-3 z-20 p-2 bg-slate-900/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing backdrop-blur-sm shadow-lg"
        title="Drag to reorder"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      <div className="w-full h-full">
        <MediaCard media={item.media} onRemove={onRemove} priority={priority} />
      </div>
    </div>
  );
}

function StaticPhoto({ 
  item, 
  onRemove, 
  priority,
  wrapperStyle
}: { 
  item: MediaItem; 
  onRemove: (mediaId: string) => void; 
  priority?: boolean;
  wrapperStyle?: React.CSSProperties;
}) {
  return (
    <div style={wrapperStyle} className="group relative w-full h-full">
      <MediaCard media={item.media} onRemove={onRemove} priority={priority} />
    </div>
  );
}

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
  const [localMediaItems, setLocalMediaItems] = useState(galleryMediaItems);
  
  const [gallerySearchInput, setGallerySearchInput] = useState(initialFilters.gallerySearch);
  const [modalSearchInput, setModalSearchInput] = useState(initialFilters.search);

  // Sync local state with prop changes (e.g., after server action / URL update)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setGallerySearchInput(initialFilters.gallerySearch);
    setModalSearchInput(initialFilters.search);
    setLocalMediaItems(galleryMediaItems);
  }, [initialFilters.gallerySearch, initialFilters.search, galleryMediaItems]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const isCustomOrder = initialFilters.sortBy === 'position';

  const albumLayout: 'masonry' | 'rows' | 'columns' = 
    gallery.layoutStyle === 'row' ? 'rows' : 
    gallery.layoutStyle === 'column' ? 'columns' : 
    'masonry';

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = localMediaItems.findIndex((item) => item.mediaId === active.id);
      const newIndex = localMediaItems.findIndex((item) => item.mediaId === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newItems = arrayMove(localMediaItems, oldIndex, newIndex);
        setLocalMediaItems(newItems);
        
        try {
          const res = await fetch('/api/gallery-media/reorder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              galleryId: gallery.id, 
              orderedMediaIds: newItems.map(item => item.mediaId) 
            }),
          });
          if (!res.ok) throw new Error('Failed to reorder');
          
          router.refresh();
        } catch (error) {
          console.error('Failed to reorder media', error);
          setLocalMediaItems(galleryMediaItems);
          Swal.fire({
            icon: 'error',
            title: 'Reorder Failed',
            text: 'An error occurred while saving the new order.',
            background: '#ffffff',
            customClass: { 
              popup: 'rounded-xl shadow-2xl border border-slate-200',
              title: 'font-black text-slate-900 uppercase tracking-tight'
            }
          });
        }
      }
    }
  };

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
      params.delete('page');
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

  const handleMainSearchSubmit = useCallback(() => {
    updateMainFilters({ gallerySearch: gallerySearchInput, page: 1 });
  }, [gallerySearchInput, updateMainFilters]);

  const handleMainTypeFilter = useCallback((type: string) => {
    updateMainFilters({ type: type as 'all' | 'image' | 'video' | 'gif', page: 1 });
  }, [updateMainFilters]);

  const handleMainSortChange = useCallback((sortBy: string) => {
    updateMainFilters({ sortBy: sortBy as 'newest' | 'oldest' | 'name' | 'position', page: 1 });
  }, [updateMainFilters]);

  const handleMainPageChange = useCallback((page: number) => {
    updateMainFilters({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [updateMainFilters]);

  const handleModalSearchSubmit = useCallback(() => {
    updateModalFilters({ search: modalSearchInput, page: 1 });
  }, [modalSearchInput, updateModalFilters]);

  const handleModalTypeFilter = useCallback((type: string) => {
    updateModalFilters({ type: type as 'all' | 'image' | 'video' | 'gif', page: 1 });
  }, [updateModalFilters]);

  const handleModalSortChange = useCallback((sortBy: string) => {
    updateModalFilters({ sortBy: sortBy as 'newest' | 'oldest' | 'name', page: 1 });
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

  const albumPhotos = localMediaItems.map((item) => ({
    id: item.mediaId,
    src: item.media.thumbnailUrl,
    width: item.media.width || 400,
    height: item.media.height || 300,
    title: item.media.title || "",
    item,
  }));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-600 selection:text-white relative">
      
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.4]" 
        style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        aria-hidden="true" 
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200 transition-all duration-300">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <MediaLibraryHeader
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
            />
          </div>
        </header>

        <div className="h-px w-full bg-linear-to-r from-transparent via-red-500/40 to-transparent" aria-hidden="true" />

        <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Showing {localMediaItems.length} of {mainPagination.total} assets.
          </div>

          {localMediaItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden animate-fadeInUp">
              <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
              
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
              {!isCustomOrder && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm font-medium flex items-start gap-3 shadow-sm animate-fadeInUp">
                  <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-bold">Drag and drop is currently disabled.</p>
                    <p className="mt-1">
                      Switch to <span className="font-black">{'"Custom Order"'}</span> in the sort dropdown to enable drag-and-drop reordering.{' '}
                      <button onClick={() => handleMainSortChange('position')} className="underline font-bold hover:text-amber-900 transition-colors">
                        Switch now
                      </button>
                    </p>
                  </div>
                </div>
              )}

              <div className="animate-fadeInUp w-full">
                {isCustomOrder ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={albumPhotos.map(p => p.id)} strategy={rectSortingStrategy}>
                      <div className="w-full">
                        <PhotoAlbum
                          layout={albumLayout}
                          photos={albumPhotos}
                          spacing={24}
                          columns={(containerWidth) => {
                            if (containerWidth < 640) return 2;
                            if (containerWidth < 1024) return 3;
                            if (containerWidth < 1280) return 4;
                            if (containerWidth < 1536) return 5;
                            return 6;
                          }}
                          render={{
                            wrapper: (props, { photo, index }) => (
                              <SortablePhoto 
                                id={photo.id} 
                                item={photo.item} 
                                onRemove={handleRemoveMedia} 
                                priority={index === 0}
                                wrapperStyle={props.style}
                              />
                            )
                          }}
                        />
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="w-full">
                    <PhotoAlbum
                      layout={albumLayout}
                      photos={albumPhotos}
                      spacing={24}
                      columns={(containerWidth) => {
                        if (containerWidth < 640) return 2;
                        if (containerWidth < 1024) return 3;
                        if (containerWidth < 1280) return 4;
                        if (containerWidth < 1536) return 5;
                        return 6;
                      }}
                      render={{
                        wrapper: (props, { photo, index }) => (
                          <StaticPhoto 
                            item={photo.item} 
                            onRemove={handleRemoveMedia} 
                            priority={index === 0}
                            wrapperStyle={props.style}
                          />
                        )
                      }}
                    />
                  </div>
                )}
              </div>
              
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

        <FloatingActionButton 
          onClick={() => setIsAddModalOpen(true)}
          label="Add Asset"
        />

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
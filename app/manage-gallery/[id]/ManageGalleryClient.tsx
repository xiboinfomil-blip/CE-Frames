'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal, { SweetAlertOptions } from 'sweetalert2'; // ✅ Imported SweetAlertOptions
import MediaCard from './components/MediaCard'; 
import AddMediaModal from './components/AddMediaModal'; 
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination';
import FloatingActionButton from '@/components/FloatingActionButton';
import CardGrid from '@/components/displayGrid';

// DnD Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// --- Sortable Wrapper Component ---
function SortableMediaCard({ 
  item, 
  index, 
  onRemove, 
  onManualOrder 
}: { 
  item: MediaItem; 
  index: number; 
  onRemove: (id: string) => void;
  onManualOrder: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners} 
      className="cursor-grab active:cursor-grabbing relative group"
    >
      {/* Visual Drag Handle Indicator (appears on hover) */}
      <div className="absolute top-2 left-2 z-10 bg-black/60 text-white p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>
      
      <MediaCard 
        media={item.media} 
        onRemove={onRemove} 
        onManualOrder={onManualOrder}
        priority={index < 6} 
      />
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

  // Sync server state to local state when server data changes (e.g., after router.refresh())
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setGallerySearchInput(initialFilters.gallerySearch);
    setModalSearchInput(initialFilters.search);
    setLocalMediaItems(galleryMediaItems);
  }, [initialFilters.gallerySearch, initialFilters.search, galleryMediaItems]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // --- Shared Reorder Logic (Used by both DnD and Manual Order) ---
  const applyNewOrder = useCallback(async (newItems: MediaItem[], previousItems: MediaItem[]) => {
    setLocalMediaItems(newItems);
    const orderedMediaIds = newItems.map((item) => item.mediaId);

    try {
      const res = await fetch('/api/gallery-media/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ galleryId: gallery.id, orderedMediaIds }),
      });
      
      if (!res.ok) throw new Error('Failed to reorder');
      
    } catch (error) {
      console.error('Failed to reorder media', error);
      Swal.fire('Error', 'Failed to update order. Please try again.', 'error');
      // Revert optimistic update on failure
      setLocalMediaItems(previousItems);
    }
  }, [gallery.id]);

  // --- DnD Sensors Configuration ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- DnD Handlers ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localMediaItems.findIndex((item) => item.id === active.id);
    const newIndex = localMediaItems.findIndex((item) => item.id === over.id);

    const newItems = arrayMove(localMediaItems, oldIndex, newIndex);
    await applyNewOrder(newItems, localMediaItems);
  };

  // --- Manual Order Handler ---
  const handleManualOrder = useCallback(async (mediaId: string) => {
    const currentIndex = localMediaItems.findIndex(item => item.id === mediaId);
    if (currentIndex === -1) return;

    // ✅ Explicitly typed as SweetAlertOptions, with inputAttributes values as strings
    const swalOptions: SweetAlertOptions = {
      title: 'Set Position',
      text: `Enter a position between 1 and ${localMediaItems.length}`,
      icon: 'question',
      input: 'number',
      inputAttributes: {
        min: '1',
        max: String(localMediaItems.length),
        step: '1'
      },
      inputValue: String(currentIndex + 1),
      showCancelButton: true,
      confirmButtonText: 'Update Position',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#94a3b8',
    };

    const result = await Swal.fire(swalOptions);

    if (!result.isConfirmed || !result.value) return;

    const targetPosition = parseInt(result.value as string, 10);
    if (isNaN(targetPosition) || targetPosition < 1 || targetPosition > localMediaItems.length) {
      Swal.fire('Invalid Position', `Please enter a number between 1 and ${localMediaItems.length}.`, 'error');
      return;
    }

    const targetIndex = targetPosition - 1;
    if (targetIndex === currentIndex) return; // No change needed

    // Move item to new position (shifts other items)
    const newItems = [...localMediaItems];
    const [movedItem] = newItems.splice(currentIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);

    await applyNewOrder(newItems, localMediaItems);
    
    if (result.isConfirmed) {
      Swal.fire({
        icon: 'success',
        title: 'Position Updated',
        text: `Moved to position ${targetPosition}`,
        timer: 1500,
        showConfirmButton: false
      });
    }
  }, [localMediaItems, applyNewOrder]);

  const updateMainFilters = useCallback((updates: {
    gallerySearch?: string;
    type?: 'all' | 'image' | 'video' | 'gif';
    sortBy?: 'newest' | 'oldest' | 'name' | 'position';
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
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
    if (updates.page !== undefined) {
      params.set('page', updates.page.toString());
    } else {
      params.delete('page');
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

  const updateModalFilters = useCallback((updates: {
    search?: string;
    type?: 'all' | 'image' | 'video' | 'gif';
    sortBy?: 'newest' | 'oldest' | 'name';
    page?: number;
  }) => {
    const params = new URLSearchParams(searchParams.toString());
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
    if (updates.page !== undefined) {
      params.set('modalPage', updates.page.toString());
    } else {
      params.delete('modalPage');
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

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
      text: "Remove this asset from the gallery? This does not delete the original file.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, remove it',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`/api/gallery-media?galleryId=${gallery.id}&mediaId=${mediaId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove');
      router.refresh();
    } catch (error) {
      console.error('Failed to remove media', error);
      Swal.fire('Error', 'Failed to remove asset.', 'error');
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
      return false;
    }
  }, [gallery.id, router]);

  const handleCloseModal = useCallback(() => {
    setIsAddModalOpen(false);
    router.refresh();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md border-b border-slate-200">
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

        <main className="flex-1 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localMediaItems.map((item) => item.id)}
              strategy={rectSortingStrategy}
            >
              <CardGrid<MediaItem>
                items={localMediaItems}
                renderItem={(item, index) => (
                  <SortableMediaCard 
                    item={item} 
                    index={index} 
                    onRemove={handleRemoveMedia} 
                    onManualOrder={handleManualOrder}
                  />
                )}
                getKey={(item: MediaItem) => item.id}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900">
                      {mainPagination.total === 0 ? 'Gallery is Empty' : 'No Matches Found'}
                    </h3>
                    <p className="text-slate-500 text-sm mt-2">
                      {mainPagination.total === 0 ? 'No assets assigned to this gallery yet.' : 'Try adjusting your search.'}
                    </p>
                    {mainPagination.total === 0 && (
                      <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-6 px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors"
                      >
                        Add Asset
                      </button>
                    )}
                  </div>
                }
                className="w-full min-h-100 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6"
                ariaLabel="Gallery media items"
              />
            </SortableContext>
          </DndContext>
          
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
        </main>

        <FloatingActionButton onClick={() => setIsAddModalOpen(true)} label="Add Asset" />

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
    </div>
  );
}
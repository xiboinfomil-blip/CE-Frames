'use client';

import { useState, useCallback } from 'react';
import { MEDIA_TYPES } from '@/db/schema';
import MediaViewport from '@/components/media-viewport';
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination';
import BaseModal from '@/components/BaseModal';

// --- Types ---
interface MediaOption {
  id: string;
  thumbnailUrl: string;
  fullResUrl?: string;
  title?: string | null;
  type: 'image' | 'video' | 'gif';
  uploadedAt?: Date | string;
}

interface PaginationData {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface AddMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  availableMedia: MediaOption[];
  modalPagination: PaginationData;
  initialFilters: {
    search: string;
    type: 'all' | 'image' | 'video' | 'gif';
    sortBy: 'newest' | 'oldest' | 'name';
  };
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  onFilterChange: (type: 'all' | 'image' | 'video' | 'gif') => void;
  onSortChange: (sortBy: 'newest' | 'oldest' | 'name') => void;
  onPageChange: (page: number) => void;
  onAddMedia: (mediaId: string) => Promise<boolean>;
  onPreview?: (media: MediaOption) => void;
}

// --- Static Configurations ---
const TYPE_FILTERS: FilterOption[] = [
  { value: 'all', label: 'All Assets' },
  { value: 'image', label: 'Images' },
  { value: 'video', label: 'Videos' },
  { value: 'gif', label: 'GIFs' }
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' }
];

// --- Sub-Component: Media Card ---
interface MediaCardProps {
  media: MediaOption;
  isSelected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  isAdding: boolean;
}

function MediaCard({ media, isSelected, onToggle, onPreview, isAdding }: MediaCardProps) {
  return (
    <div className={`group/card flex flex-col gap-3 transition-all duration-300 ${isAdding ? 'opacity-50 pointer-events-none' : ''}`}>
      
      {/* 1. Media Viewport Area (Click to Preview/Lightbox) */}
      <div 
        className="relative cursor-pointer rounded-lg outline-none transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        onClick={onPreview}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPreview(); } }}
        tabIndex={0}
        role="button"
        aria-label={`Preview ${media.title || 'media asset'} in lightbox`}
      >
        <MediaViewport
          mediaType={media.type as typeof MEDIA_TYPES[number]}
          fullResUrl={media.fullResUrl || media.thumbnailUrl}
          thumbnailUrl={media.thumbnailUrl}
          caption={media.title}
          className={`${isSelected ? 'ring-2 ring-red-600 ring-offset-2 shadow-lg shadow-red-600/20' : ''}`}
        />
        
        {/* Animated Selection Badge (Top Right) */}
        <div className={`absolute top-3 right-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isSelected ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}`}>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      {/* 2. Action & Info Bar (Underneath) */}
      <div className="flex items-center justify-between gap-3 px-1">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-900">
            {media.title || 'Untitled Asset'}
          </p>
          <p className="mt-0.5 font-mono text-[10px] text-slate-400">
            {media.type.toUpperCase()} • {media.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        
        {/* Select / Unselect Button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          disabled={isAdding}
          className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            isSelected
              ? 'bg-red-600 text-white shadow-md shadow-red-600/20 hover:bg-red-700 focus:ring-red-500'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white focus:ring-slate-400'
          }`}
          aria-pressed={isSelected}
          aria-label={isSelected ? `Unselect ${media.title}` : `Select ${media.title}`}
        >
          {isSelected ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>Selected</span>
            </>
          ) : (
            <span>Select</span>
          )}
        </button>
      </div>
    </div>
  );
}

// --- Main Modal Component ---
export default function AddMediaModal({ 
  isOpen, 
  onClose,
  availableMedia,
  modalPagination,
  initialFilters,
  onSearchChange,
  onSearchSubmit,
  onFilterChange,
  onSortChange,
  onPageChange,
  onAddMedia,
  onPreview
}: AddMediaModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const [isAdding, setIsAdding] = useState(false);

  const handleReset = useCallback(() => {
    setSelectedIds(new Set());
    setSearchInput(initialFilters.search);
  }, [initialFilters.search]);

  const handleSearchSubmitLocal = useCallback(() => {
    onSearchChange(searchInput);
    onSearchSubmit();
  }, [searchInput, onSearchChange, onSearchSubmit]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const isAllSelected = availableMedia.length > 0 && selectedIds.size === availableMedia.length;

  const selectAll = useCallback(() => {
    setSelectedIds(isAllSelected ? new Set() : new Set(availableMedia.map(m => m.id)));
  }, [isAllSelected, availableMedia]);

  const handleAdd = useCallback(async () => {
    if (selectedIds.size === 0) return;
    setIsAdding(true);
    try {
      const results = await Promise.all(Array.from(selectedIds).map(onAddMedia));
      const hasFailures = results.some(r => r === false);
      if (hasFailures) console.warn('Some media items failed to add.');
      setSelectedIds(new Set());
      onClose();
    } catch (err) {
      console.error('Failed to add media items', err);
    } finally {
      setIsAdding(false);
    }
  }, [selectedIds, onAddMedia, onClose]);

  const footerActions = (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
        {selectedIds.size > 0 ? (
          <span className="text-red-600 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            {selectedIds.size} ASSETS QUEUED FOR ADDITION
          </span>
        ) : (
          <span>NO ASSETS SELECTED</span>
        )}
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => {
            handleReset();
            onClose();
          }}
          disabled={isAdding}
          className="flex-1 sm:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Abort
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding || selectedIds.size === 0}
          className="flex-1 sm:flex-none px-8 py-3 text-xs font-black uppercase tracking-widest text-white bg-slate-900 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-600/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isAdding ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          )}
          {isAdding ? 'Processing...' : 'Add to Gallery'}
        </button>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Assets"
      subtitle="ADD EXISTING MEDIA TO GALLERY"
      maxWidth="7xl"
      isLoading={isAdding}
      footer={footerActions}
    >
      <div className="space-y-0 -mx-6">
        
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 px-6 pt-2 pb-4 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
          {/* ✅ Removed unsupported props: title, subtitle, searchPlaceholder, onPageChange */}
          <MediaLibraryHeader
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmitLocal}
            activeFilter={initialFilters.type}
            onFilterChange={(val) => onFilterChange(val as 'all' | 'image' | 'video' | 'gif')}
            filters={TYPE_FILTERS}
            activeSort={initialFilters.sortBy}
            onSortChange={(val) => onSortChange(val as 'newest' | 'oldest' | 'name')}
            sorts={SORT_OPTIONS}
            totalItems={modalPagination.total}
            currentPage={modalPagination.currentPage}
            totalPages={modalPagination.totalPages}
          />
        </div>

        {/* Telemetry Toolbar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200 flex justify-between items-center">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {modalPagination.total} AVAILABLE ASSETS
          </span>
          <button 
            onClick={selectAll}
            disabled={availableMedia.length === 0 || isAdding}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50 focus:outline-none focus:underline decoration-red-600 underline-offset-4"
          >
            {isAllSelected ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        {/* Content Area */}
        <div className="relative min-h-100 bg-slate-50/30">
          
          {isAdding && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] z-40">
               <div className="flex flex-col items-center gap-3">
                 <div className="w-10 h-10 border-4 border-slate-200 border-t-red-600 rounded-full animate-spin" />
                 <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest animate-pulse">Syncing to Gallery...</span>
               </div>
             </div>
          )}

          {availableMedia.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="w-24 h-24 mb-6 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />
                <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">No Assets Found</h3>
              <p className="text-slate-500 mt-3 text-sm max-w-xs font-medium leading-relaxed">
                {initialFilters.search ? 'Try adjusting your search parameters.' : 'Upload new media in the Library first.'}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {availableMedia.map((media) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    isSelected={selectedIds.has(media.id)}
                    onToggle={() => toggleSelection(media.id)}
                    onPreview={() => onPreview?.(media)}
                    isAdding={isAdding}
                  />
                ))}
              </div>

              {modalPagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination 
                    currentPage={modalPagination.currentPage}
                    totalPages={modalPagination.totalPages}
                    hasNext={modalPagination.hasNext}
                    hasPrevious={modalPagination.hasPrevious}
                    onPageChange={onPageChange}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
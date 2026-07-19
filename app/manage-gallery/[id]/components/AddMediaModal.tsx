'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/manageHeader';
import Pagination from '@/components/Pagination';
import BaseModal from '@/components/BaseModal'; // Adjust path as needed

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
}

// Hoisted static configuration to prevent recreation on every render
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

export default function AddMediaModal({ 
  isOpen, 
  onClose, 
  galleryId,
  availableMedia,
  modalPagination,
  initialFilters,
  onSearchChange,
  onSearchSubmit,
  onFilterChange,
  onSortChange,
  onPageChange,
  onAddMedia
}: AddMediaModalProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(initialFilters.search);
  const [isAdding, setIsAdding] = useState(false);

  // Sync local search input with parent's filter state
  useEffect(() => {
    setSearchInput(initialFilters.search);
  }, [initialFilters.search]);

  // Reset selection state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedIds(new Set());
    }
  }, [isOpen]);

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
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableMedia.map(m => m.id)));
    }
  }, [isAllSelected, availableMedia]);

  const handleAdd = useCallback(async () => {
    if (selectedIds.size === 0) return;
    
    setIsAdding(true);
    try {
      const promises = Array.from(selectedIds).map(mediaId => onAddMedia(mediaId));
      const results = await Promise.all(promises);
      const failed = results.some(r => r === false);
      
      if (failed) {
        console.warn('Some media items failed to add.');
      }

      // Reset selection and close modal on success
      setSelectedIds(new Set());
      onClose();
    } catch (err) {
      console.error('Failed to add media items', err);
    } finally {
      setIsAdding(false);
    }
  }, [selectedIds, onAddMedia, onClose]);

  // Footer Actions Component
  const footerActions = (
    <>
      <div className="flex-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest self-center hidden sm:block">
        {selectedIds.size > 0 ? (
          <span className="text-red-600">{selectedIds.size} ASSETS SELECTED</span>
        ) : (
          <span>NO ASSETS SELECTED</span>
        )}
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <button
          type="button"
          onClick={onClose}
          disabled={isAdding}
          className="flex-1 sm:flex-none px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Abort
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding || selectedIds.size === 0}
          className="flex-1 sm:flex-none px-8 py-3 text-xs font-black uppercase tracking-widest text-white bg-slate-900 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/30 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          {isAdding ? (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          )}
          {isAdding ? 'Processing...' : 'Add to Gallery'}
        </button>
      </div>
    </>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Assets"
      subtitle="ADD EXISTING MEDIA TO GALLERY"
      maxWidth="6xl"
      isLoading={isAdding}
      footer={footerActions}
    >
      <div className="space-y-0 -mx-6">
        
        {/* Reusable Header Component */}
        <div className="px-6 pt-2 pb-4 border-b border-slate-100 bg-white relative z-10">
          <MediaLibraryHeader
            title="" // Title handled by BaseModal
            subtitle="" // Subtitle handled by BaseModal
            searchPlaceholder="Search assets..."
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmitLocal}
            activeFilter={initialFilters.type}
            onFilterChange={onFilterChange}
            filters={TYPE_FILTERS}
            activeSort={initialFilters.sortBy}
            onSortChange={onSortChange}
            sorts={SORT_OPTIONS}
            totalItems={modalPagination.total}
            currentPage={modalPagination.currentPage}
            totalPages={modalPagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>

        {/* Toolbar for Selection Actions */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              {modalPagination.total} AVAILABLE ASSETS
            </span>
            <button 
              onClick={selectAll}
              disabled={availableMedia.length === 0 || isAdding}
              className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-600 transition-colors disabled:opacity-50 focus:outline-none focus:underline"
              aria-label={isAllSelected ? "Deselect all assets" : "Select all available assets"}
            >
              {isAllSelected ? 'Deselect All' : 'Select All'}
            </button>
        </div>

        {/* Content Area */}
        <div className="relative min-h-[400px] bg-slate-50/50">
          
          {/* Loading Overlay (Only for the 'Add' action) */}
          {isAdding && (
             <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
               <div className="flex flex-col items-center gap-3">
                 <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest animate-pulse">Processing...</span>
               </div>
             </div>
          )}

          {availableMedia.length === 0 ? (
            <div className="relative z-10 flex flex-col items-center justify-center py-20 text-center px-4">
              <div className="w-20 h-20 mb-6 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-red-600 opacity-60" />
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">No Assets Found</h3>
              <p className="text-slate-500 mt-2 text-sm max-w-xs font-medium leading-relaxed">
                {initialFilters.search ? 'Try adjusting your search parameters.' : 'Upload new media in the Library first.'}
              </p>
            </div>
          ) : (
            <div className="relative z-10 p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {availableMedia.map((media) => {
                  const isSelected = selectedIds.has(media.id);
                  return (
                    <button
                      key={media.id}
                      onClick={() => !isAdding && toggleSelection(media.id)}
                      aria-pressed={isSelected}
                      aria-label={`${isSelected ? 'Deselect' : 'Select'} ${media.title || 'media asset'}`}
                      className={`group relative aspect-square cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200 bg-white text-left focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                        isSelected 
                          ? 'border-red-600 ring-1 ring-red-600/20' 
                          : 'border-slate-200 hover:border-slate-400 hover:shadow-lg'
                      } ${isAdding ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <Image 
                        src={media.thumbnailUrl} 
                        alt="" 
                        fill 
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                      />
                      
                      {/* Type Badge */}
                      <div className="absolute top-2 left-2 z-10">
                         <span className="flex items-center gap-1 px-1.5 py-1 rounded bg-slate-900/80 backdrop-blur-sm text-[9px] font-black uppercase tracking-wider text-white shadow-sm">
                           {media.type === 'video' && (
                             <svg className="w-2.5 h-2.5 text-red-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                           )}
                           {media.type}
                         </span>
                      </div>

                      {/* Selection Overlay */}
                      <div className={`absolute inset-0 bg-red-600/10 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                      
                      {/* Checkmark Badge */}
                      <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md border transition-all duration-200 ${
                        isSelected 
                          ? 'bg-red-600 border-red-600 scale-100' 
                          : 'bg-white/90 border-slate-200 scale-0 group-hover:scale-100'
                      }`}>
                        {isSelected ? (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 bg-slate-400 rounded-full" />
                        )}
                      </div>

                      {/* Title on Hover / Always visible if selected */}
                      <div className={`absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-slate-900/90 to-transparent transition-transform duration-300 ${isSelected ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0'}`}>
                        <p className="text-white text-[10px] font-bold uppercase tracking-wide truncate">{media.title || 'Untitled Asset'}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Pagination inside Modal */}
              {modalPagination.totalPages > 1 && (
                <div className="mt-8 flex justify-center">
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
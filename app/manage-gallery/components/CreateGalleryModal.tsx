'use client';

import { useState, useEffect, useId, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VISIBILITY_STATUSES, MEDIA_TYPES } from '@/db/schema'; // Ensure MEDIA_TYPES is imported
import BaseModal from '@/components/BaseModal'; 
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/manageHeader'; // Adjust path
import Pagination from '@/components/Pagination'; // Adjust path
import MediaViewport from '@/components/media-viewport'; // Import the new component

// --- Types ---
interface GalleryData {
  id?: string;
  title: string;
  description?: string | null;
  visibility: typeof VISIBILITY_STATUSES[number];
  password?: string;
  coverMediaId?: string | null;
  layoutStyle?: string;
}

interface MediaOption {
  id: string;
  thumbnailUrl: string;
  fullResUrl: string; // Required for MediaViewport
  title?: string | null;
  type: typeof MEDIA_TYPES[number];
  originalFilename?: string | null;
  caption?: string | null;
}

interface PaginationData {
  total: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

interface CreateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: GalleryData | null;
}

// Static Config for Filters/Sorts
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

export default function CreateGalleryModal({ isOpen, onClose, initialData = null }: CreateGalleryModalProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const formId = useId();

  // Form IDs
  const titleId = useId();
  const descId = useId();
  const visibilityId = useId();
  const passwordId = useId();

  // Form State
  const [formData, setFormData] = useState<GalleryData>({
    title: '',
    description: '',
    visibility: 'public',
    password: '',
    coverMediaId: '',
    layoutStyle: 'masonry',
  });
  
  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Media Picker State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<MediaOption[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0, currentPage: 1, totalPages: 1, hasNext: false, hasPrevious: false
  });
  const [isFetchingMedia, setIsFetchingMedia] = useState(false);
  
  // Filter State for Media Picker
  const [mediaFilters, setMediaFilters] = useState({
    search: '',
    type: 'all' as 'all' | 'image' | 'video' | 'gif',
    sortBy: 'newest' as 'newest' | 'oldest' | 'name',
    page: 1
  });

  // Initialize Form Data
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          title: initialData.title || '',
          description: initialData.description ?? '', 
          visibility: initialData.visibility || 'public',
          password: '', 
          coverMediaId: initialData.coverMediaId || '',
          layoutStyle: initialData.layoutStyle || 'masonry',
        });
      } else {
        setFormData({
          title: '',
          description: '',
          visibility: 'public',
          password: '',
          coverMediaId: '',
          layoutStyle: 'masonry',
        });
      }
      setError(null);
      // Reset media picker state when modal opens
      setMediaFilters({ search: '', type: 'all', sortBy: 'newest', page: 1 });
      setAvailableMedia([]);
    }
  }, [isOpen, initialData]);

  // Fetch Media Logic (Specific to Gallery)
  const fetchGalleryMedia = useCallback(async () => {
    if (!initialData?.id) return; 

    setIsFetchingMedia(true);
    try {
      const params = new URLSearchParams({
        galleryId: initialData.id,
        search: mediaFilters.search,
        type: mediaFilters.type,
        sortBy: mediaFilters.sortBy,
        page: mediaFilters.page.toString(),
      });

      const res = await fetch(`/api/gallery-media/available?${params}`); 
      
      if (res.ok) {
        const data = await res.json();
        setAvailableMedia(data.items || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to fetch gallery media", err);
    } finally {
      setIsFetchingMedia(false);
    }
  }, [initialData?.id, mediaFilters]);

  // Trigger fetch when filters change or modal opens
  useEffect(() => {
    if (isMediaPickerOpen && isEditMode) {
      fetchGalleryMedia();
    }
  }, [isMediaPickerOpen, isEditMode, fetchGalleryMedia]);

  // Handlers for Media Picker Controls
  const handleSearchSubmit = () => {
    setMediaFilters(prev => ({ ...prev, page: 1 }));
    fetchGalleryMedia();
  };

  const handleFilterChange = (type: 'all' | 'image' | 'video' | 'gif') => {
    setMediaFilters(prev => ({ ...prev, type, page: 1 }));
  };

  const handleSortChange = (sortBy: 'newest' | 'oldest' | 'name') => {
    setMediaFilters(prev => ({ ...prev, sortBy, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setMediaFilters(prev => ({ ...prev, page }));
  };

  // Handle Cover Selection
  const handleSelectCover = (mediaId: string) => {
    setFormData(prev => ({ ...prev, coverMediaId: mediaId }));
    setIsMediaPickerOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const url = isEditMode ? `/api/galleries/${initialData?.id}` : '/api/galleries';
      const method = isEditMode ? 'PUT' : 'POST';

      const passwordToSend = formData.visibility === 'password_protected' 
        ? (formData.password.trim() === '' ? null : formData.password) 
        : null;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          visibility: formData.visibility,
          password: passwordToSend,
          coverMediaId: formData.coverMediaId || null,
          layoutStyle: formData.layoutStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save gallery');
      }

      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Footer Actions
  const footerActions = (
    <>
      <button
        type="button"
        form={formId}
        onClick={onClose}
        disabled={isLoading}
        className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all duration-200 disabled:opacity-30 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      >
        Abort
      </button>
      <button
        type="submit"
        form={formId}
        disabled={isLoading || !formData.title.trim()}
        className="px-8 py-3 text-xs font-black uppercase tracking-widest text-white bg-slate-900 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-500/30 transition-all duration-200 active:scale-95 flex items-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing
          </>
        ) : (
          isEditMode ? 'Save Changes' : 'Create Gallery'
        )}
      </button>
    </>
  );

  // Helper to find current cover object for preview
  const currentCoverObj = availableMedia.find(m => m.id === formData.coverMediaId);

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={
          isEditMode ? (
            <>Edit<span className="text-red-600">Gallery</span></>
          ) : (
            <>New<span className="text-red-600">Gallery</span></>
          )
        }
        subtitle={isEditMode ? 'Update collection telemetry' : 'Initialize new collection'}
        maxWidth="lg"
        isLoading={isLoading}
        footer={footerActions}
      >
        <form 
          id={formId}
          onSubmit={handleSubmit} 
          className="space-y-6 relative z-10"
        >
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg text-sm text-red-800 flex items-start gap-3" role="alert">
              <svg className="w-5 h-5 shrink-0 mt-0.5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Title Field */}
          <div className="space-y-1.5">
            <label htmlFor={titleId} className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
              Gallery Title <span className="text-red-600">*</span>
            </label>
            <input
              id={titleId}
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="e.g., Summer Track Day 2024"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm font-medium"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label htmlFor={descId} className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
              Description
            </label>
            <textarea
              id={descId}
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Add context about this collection..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none text-sm font-medium"
            />
          </div>

          {/* Visibility & Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor={visibilityId} className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                Visibility
              </label>
              <div className="relative">
                <select
                  id={visibilityId}
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none appearance-none cursor-pointer transition-all text-sm font-medium"
                >
                  {VISIBILITY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status === 'public' ? 'Public' : 
                       status === 'private' ? 'Private' : 
                       status === 'password_protected' ? 'Password Protected' : 
                       status === 'unlisted' ? 'Unlisted' : status}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`space-y-1.5 transition-all duration-300 ${formData.visibility === 'password_protected' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none absolute'}`}>
              {formData.visibility === 'password_protected' && (
                <>
                  <label htmlFor={passwordId} className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
                    Access Password
                  </label>
                  <input
                    id={passwordId}
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    required={!isEditMode}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                  {isEditMode && (
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">
                      Leave empty to retain current password
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Layout Style Selector */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
              Layout Configuration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'masonry', label: 'Masonry', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
                { value: 'grid', label: 'Grid', icon: 'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z' },
                { value: 'slideshow', label: 'Slideshow', icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, layoutStyle: option.value }))}
                  className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-200 gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
                    formData.layoutStyle === option.value
                      ? 'border-red-600 bg-red-50 text-red-700 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={option.icon} />
                  </svg>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Media Selector - UPDATED LOGIC */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
              Cover Image
            </label>
            
            <div 
              onClick={() => isEditMode && setIsMediaPickerOpen(true)}
              className={`group relative w-full h-40 border-2 rounded-xl flex items-center justify-center transition-all overflow-hidden ${
                isEditMode 
                  ? 'border-dashed border-slate-300 cursor-pointer hover:border-red-500 hover:bg-red-50 bg-slate-100' 
                  : 'border-solid border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
              }`}
            >
              {formData.coverMediaId && currentCoverObj ? (
                // Preview Selected Cover using MediaViewport
                <div className="relative w-full h-full">
                   <MediaViewport
                      mediaType={currentCoverObj.type}
                      fullResUrl={currentCoverObj.fullResUrl}
                      thumbnailUrl={currentCoverObj.thumbnailUrl}
                      caption={currentCoverObj.caption}
                      originalFilename={currentCoverObj.originalFilename}
                      className="rounded-none ring-0 shadow-none h-full" // Override default styles to fit container
                   />
                   {isEditMode && (
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Change Cover</span>
                     </div>
                   )}
                </div>
              ) : (
                // Empty State
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    {isEditMode ? 'Select from Gallery Media' : 'Add Media First'}
                  </span>
                </div>
              )}
            </div>
            
            {!isEditMode && (
               <p className="text-[10px] text-amber-600 font-medium text-right">
                 * Create gallery and add media to set a cover
               </p>
            )}
          </div>

        </form>
      </BaseModal>

      {/* --- Media Picker Sub-Modal (Only for Edit Mode) --- */}
      <BaseModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        title="Select Cover"
        subtitle="CHOOSE FROM GALLERY MEDIA"
        maxWidth="6xl"
        isLoading={isFetchingMedia}
        footer={
          <div className="flex justify-end w-full">
             <button
                onClick={() => setIsMediaPickerOpen(false)}
                className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-xl transition-all"
              >
                Cancel
              </button>
          </div>
        }
      >
        <div className="space-y-0 -mx-6">
          
          {/* Integrated Header Component */}
          <div className="px-6 pt-2 pb-4 border-b border-slate-100 bg-white relative z-10">
             <MediaLibraryHeader
                searchValue={mediaFilters.search}
                onSearchChange={(val) => setMediaFilters(prev => ({ ...prev, search: val }))}
                onSearchSubmit={handleSearchSubmit}
                activeFilter={mediaFilters.type}
                onFilterChange={handleFilterChange}
                filters={TYPE_FILTERS}
                activeSort={mediaFilters.sortBy}
                onSortChange={handleSortChange}
                sorts={SORT_OPTIONS}
                totalItems={pagination.total}
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
             />
          </div>

          {/* Content Area */}
          <div className="relative min-h-[400px] bg-slate-50/50 p-6">
            {isFetchingMedia ? (
              <div className="flex justify-center py-20">
                 <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : availableMedia.length === 0 ? (
               <div className="text-center py-20 text-slate-500">
                 <p className="font-bold uppercase tracking-widest">No Media Found</p>
                 <p className="text-xs mt-2">Add media to this gallery first.</p>
               </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {availableMedia.map((media) => {
                    const isSelected = formData.coverMediaId === media.id;
                    
                    // SAFETY CHECK: Skip rendering if no thumbnail URL exists
                    if (!media.thumbnailUrl) return null;

                    return (
                      <button
                        key={media.id}
                        onClick={() => handleSelectCover(media.id)}
                        className={`group relative cursor-pointer rounded-xl overflow-hidden transition-all duration-200 bg-white ${
                          isSelected 
                            ? 'ring-4 ring-red-600 ring-offset-2 ring-offset-white shadow-xl scale-[1.02]' 
                            : 'hover:shadow-lg hover:-translate-y-1'
                        }`}
                      >
                        {/* Using MediaViewport instead of Next/Image */}
                        <MediaViewport
                          mediaType={media.type}
                          fullResUrl={media.fullResUrl}
                          thumbnailUrl={media.thumbnailUrl}
                          caption={media.caption}
                          originalFilename={media.originalFilename}
                          className="aspect-square rounded-none ring-0 shadow-none" // Override default viewport styles
                        />
                        
                        {/* Selection Overlay (Custom for Grid) */}
                        <div className={`absolute inset-0 bg-red-600/10 transition-opacity duration-200 pointer-events-none ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                        
                        {/* Checkmark Badge */}
                        <div className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md border transition-all duration-200 z-20 ${
                          isSelected 
                            ? 'bg-red-600 border-red-600 scale-100' 
                            : 'bg-white/90 border-slate-200 scale-0 group-hover:scale-100'
                        }`}>
                          {isSelected ? (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 bg-slate-400 rounded-full" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Pagination Component */}
                <Pagination 
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNext={pagination.hasNext}
                  hasPrevious={pagination.hasPrevious}
                  onPageChange={handlePageChange}
                  className="mt-8"
                />
              </>
            )}
          </div>
        </div>
      </BaseModal>
    </>
  );
}
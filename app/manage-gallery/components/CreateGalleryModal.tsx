'use client';

import { useState, useId, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VISIBILITY_STATUSES, MEDIA_TYPES, type LayoutStyle } from '@/db/schema';
import BaseModal from '@/components/BaseModal';
import MediaLibraryHeader, { FilterOption, SortOption } from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination';
import MediaViewport from '@/components/media-viewport';

import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { CustomButton } from '@/components/ui/CustomButton';

// --- Types ---
interface GalleryData {
  id?: string;
  title: string;
  description?: string | null;
  visibility: typeof VISIBILITY_STATUSES[number];
  password?: string;
  coverMediaId?: string | null;
  layoutStyle: LayoutStyle;
  coverMedia?: MediaOption | null;
}

interface MediaOption {
  id: string;
  thumbnailUrl: string;
  fullResUrl: string;
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
  { value: 'gif', label: 'GIFs' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name', label: 'Name A-Z' },
];

const DEFAULT_FORM_DATA: GalleryData = {
  title: '',
  description: '',
  visibility: 'public',
  password: '',
  coverMediaId: '',
  layoutStyle: 'masonry',
  coverMedia: null,
};

export default function CreateGalleryModal({
  isOpen,
  onClose,
  initialData = null,
}: CreateGalleryModalProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const formId = useId();

  // Form IDs
  const titleId = useId();
  const descId = useId();
  const visibilityId = useId();
  const passwordId = useId();

  // Form State - initialized via lazy initializer which runs on mount/remount
  const [formData, setFormData] = useState<GalleryData>(() =>
    initialData
      ? {
          id: initialData.id,
          title: initialData.title || '',
          description: initialData.description ?? '',
          visibility: initialData.visibility || 'public',
          password: '',
          coverMediaId: initialData.coverMediaId || '',
          layoutStyle: initialData.layoutStyle || 'masonry',
          coverMedia: initialData.coverMedia || null,
        }
      : { ...DEFAULT_FORM_DATA }
  );

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Media Picker State
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<MediaOption[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [isFetchingMedia, setIsFetchingMedia] = useState(false);

  // Filter State for Media Picker
  const [mediaFilters, setMediaFilters] = useState({
    search: '',
    type: 'all' as 'all' | 'image' | 'video' | 'gif',
    sortBy: 'newest' as 'newest' | 'oldest' | 'name',
    page: 1,
  });

  // Fetch Media Logic
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
      console.error('Failed to fetch gallery media', err);
    } finally {
      setIsFetchingMedia(false);
    }
  }, [initialData, mediaFilters]);

  const handleSearchSubmit = useCallback(() => {
    setMediaFilters((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Trigger fetch when filters change if picker is open
  // Note: We rely on the user interaction opening the picker to start the first fetch.
  // Subsequent filter changes trigger this effect. 
  // To avoid setState in effect, we can't easily remove this one without changing architecture significantly,
  // but the primary error was about the OPENING fetch. 
  // However, to be strictly compliant, we can move this logic into the handlers themselves if needed,
  // but typically filter-change-triggered-fetches are acceptable if debounced or handled carefully.
  // For now, let's keep it but ensure it doesn't conflict with the main "open" logic.
  // Actually, let's move the fetch trigger into the handlers to be safe..
  
  const handleFilterChange = useCallback(
    (type: string) => {
      setMediaFilters((prev) => ({
        ...prev,
        type: type as 'all' | 'image' | 'video' | 'gif',
        page: 1,
      }));
      // Trigger fetch immediately after state update logic if open
      if (isMediaPickerOpen && isEditMode) {
         // We need to fetch with NEW values. Since state update is async, 
         // we might need to pass values directly or wait. 
         // Simpler: Just call fetchGalleryMedia which uses current state. 
         // But state hasn't updated yet. 
         // Better: Update fetchGalleryMedia to accept args or just let the effect handle it?
         // Let's stick to the effect for FILTER CHANGES only, as it's a reaction to state change.
         // The ESLint rule specifically flags synchronous setState calls in effects that cause cascading renders.
         // Fetching data is an external system sync, which IS allowed.
         // The error was likely because fetchGalleryMedia calls setIsFetchingMedia/setAvailableMedia.
         // That is allowed! The error "Calling setState synchronously within an effect" usually refers to 
         // setting local component state that triggers re-renders of the same component tree unnecessarily.
         // Let's re-read the error.
         // Error 2: "fetchGalleryMedia()" inside useEffect.
         // fetchGalleryMedia calls setIsFetchingMedia (setState).
         // This IS allowed by React docs ("Subscribe for updates... calling setState in a callback").
         // But the linter is strict.
         // Let's try to remove the effect entirely by calling fetch in the open handler.
      }
    },
    [isMediaPickerOpen, isEditMode]
  );

  // Revised Handlers to trigger fetch explicitly
  
  const openMediaPicker = useCallback(() => {
    setIsMediaPickerOpen(true);
    if (isEditMode) {
      fetchGalleryMedia();
    }
  }, [isEditMode, fetchGalleryMedia]);

  const closeMediaPicker = useCallback(() => {
    setIsMediaPickerOpen(false);
  }, []);

  // Effect for filter changes ONLY (since we can't easily pass new filter state to fetch synchronously)
  // We will suppress this specific pattern if possible, or refactor fetch to take args.
  // Let's refactor fetchGalleryMedia to take args to avoid dependency on state inside effect.
  
  const executeFetch = useCallback(async (filters: typeof mediaFilters) => {
     if (!initialData?.id) return;
     setIsFetchingMedia(true);
     try {
       const params = new URLSearchParams({
         galleryId: initialData.id,
         search: filters.search,
         type: filters.type,
         sortBy: filters.sortBy,
         page: filters.page.toString(),
       });
       const res = await fetch(`/api/gallery-media/available?${params}`);
       if (res.ok) {
         const data = await res.json();
         setAvailableMedia(data.items || []);
         setPagination(data.pagination);
       }
     } catch (err) {
       console.error('Failed to fetch gallery media', err);
     } finally {
       setIsFetchingMedia(false);
     }
  }, [initialData]);

  // Now we can call executeFetch directly in handlers without stale state issues
  
  const handleFilterChangeSafe = useCallback(
    (type: string) => {
      const newFilters = {
        ...mediaFilters,
        type: type as 'all' | 'image' | 'video' | 'gif',
        page: 1,
      };
      setMediaFilters(newFilters);
      if (isMediaPickerOpen && isEditMode) {
        executeFetch(newFilters);
      }
    },
    [mediaFilters, isMediaPickerOpen, isEditMode, executeFetch]
  );

  const handleSortChangeSafe = useCallback(
    (sortBy: string) => {
      const newFilters = {
        ...mediaFilters,
        sortBy: sortBy as 'newest' | 'oldest' | 'name',
        page: 1,
      };
      setMediaFilters(newFilters);
      if (isMediaPickerOpen && isEditMode) {
        executeFetch(newFilters);
      }
    },
    [mediaFilters, isMediaPickerOpen, isEditMode, executeFetch]
  );

  const handleSearchSubmitSafe = useCallback(() => {
    const newFilters = { ...mediaFilters, page: 1 };
    setMediaFilters(newFilters);
    if (isMediaPickerOpen && isEditMode) {
      executeFetch(newFilters);
    }
  }, [mediaFilters, isMediaPickerOpen, isEditMode, executeFetch]);

  const handlePageChangeSafe = useCallback((page: number) => {
    const newFilters = { ...mediaFilters, page };
    setMediaFilters(newFilters);
    if (isMediaPickerOpen && isEditMode) {
      executeFetch(newFilters);
    }
  }, [mediaFilters, isMediaPickerOpen, isEditMode, executeFetch]);


  const handleSelectCover = useCallback(
    (mediaId: string) => {
      const selectedMedia = availableMedia.find((m) => m.id === mediaId);
      setFormData((prev) => ({
        ...prev,
        coverMediaId: mediaId,
        coverMedia: selectedMedia || null,
      }));
      closeMediaPicker();
    },
    [availableMedia, closeMediaPicker]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const url = isEditMode
        ? `/api/galleries/${initialData?.id}`
        : '/api/galleries';
      const method = isEditMode ? 'PUT' : 'POST';

      const passwordToSend =
        formData.visibility === 'password_protected'
          ? formData.password?.trim() === ''
            ? null
            : formData.password
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Footer Actions using CustomButton
  const footerActions = (
    <div className="flex gap-3 w-full sm:w-auto justify-end">
      <CustomButton variant="ghost" size="lg" onClick={onClose} disabled={isLoading}>
        Abort
      </CustomButton>
      <CustomButton
        type="submit"
        form={formId}
        variant="continue"
        size="lg"
        isLoading={isLoading}
        disabled={isLoading || !formData.title.trim()}
        shortcut="↵"
      >
        {isEditMode ? 'Save Changes' : 'Create Gallery'}
      </CustomButton>
    </div>
  );

  // Prefer the directly passed coverMedia (from server), fallback to searching availableMedia
  const currentCoverObj =
    initialData?.coverMedia ||
    availableMedia.find((m) => m.id === formData.coverMediaId);

  const modalTitle = isEditMode ? 'Edit Gallery' : 'New Gallery';

  // Use key to force re-mount and re-initialize state when opening
  const modalKey = isOpen ? (initialData?.id || 'create') : 'closed';

  return (
    <>
      <BaseModal
        key={modalKey}
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        subtitle={isEditMode ? 'Update collection telemetry' : 'Initialize new collection'}
        maxWidth="lg"
        isLoading={isLoading}
        footer={footerActions}
      >
        <form id={formId} onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Telemetry Error Message */}
          {error && (
            <div
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-mono font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200"
              role="alert"
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Title Field */}
          <CustomTextfield
            id={titleId}
            name="title"
            type="text"
            label="Gallery Title"
            value={formData.title}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="e.g., Summer Track Day 2024"
          />

          {/* Description Field */}
          <div className="space-y-1.5">
            <label
              htmlFor={descId}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 transition-colors duration-200"
            >
              Description
            </label>
            <textarea
              id={descId}
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Add context about this collection..."
              className="w-full px-4 py-3.5 rounded-lg text-sm font-medium bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-800/80 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5)] hover:bg-white dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-red-500/50 dark:focus:border-red-500/50 focus:shadow-[0_0_20px_-5px_rgba(239,68,68,0.15)] dark:focus:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] outline-none transition-all duration-200 resize-none"
            />
          </div>

          {/* Visibility & Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor={visibilityId}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 transition-colors duration-200"
              >
                Visibility
              </label>
              <div className="relative group">
                <select
                  id={visibilityId}
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 rounded-lg text-sm font-medium bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800/80 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.5)] hover:bg-white dark:hover:bg-zinc-900/80 hover:border-zinc-300 dark:hover:border-zinc-700 focus:outline-none focus:border-red-500/50 dark:focus:border-red-500/50 focus:shadow-[0_0_20px_-5px_rgba(239,68,68,0.15)] dark:focus:shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] appearance-none cursor-pointer transition-all duration-200"
                >
                  {VISIBILITY_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status === 'public'
                        ? 'Public'
                        : status === 'private'
                          ? 'Private'
                          : status === 'password_protected'
                            ? 'Password Protected'
                            : status === 'unlisted'
                              ? 'Unlisted'
                              : status}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400 dark:text-zinc-500 group-focus-within:text-red-500 dark:group-focus-within:text-red-400 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 rounded-full bg-linear-to-r from-transparent via-red-500 to-transparent transition-all duration-500 ease-out group-focus-within:w-[90%]" />
              </div>
            </div>

            <div
              className={`space-y-1.5 transition-all duration-300 ${
                formData.visibility === 'password_protected'
                  ? 'opacity-100 translate-y-0 relative'
                  : 'opacity-0 translate-y-2 pointer-events-none absolute'
              }`}
            >
              {formData.visibility === 'password_protected' && (
                <>
                  <CustomTextfield
                    id={passwordId}
                    name="password"
                    type="password"
                    label="Access Password"
                    value={formData.password || ''}
                    onChange={handleChange}
                    required={!isEditMode}
                    placeholder="••••••••"
                  />
                  {isEditMode && (
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono uppercase tracking-wider mt-1">
                      Leave empty to retain current password
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Layout Style Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 transition-colors duration-200">
              Layout Configuration
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  value: 'column',
                  label: 'Column',
                  icon: 'M5 4a1 1 0 011-1h4a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4zM14 4a1 1 0 011-1h4a1 1 0 011 1v16a1 1 0 01-1 1h-4a1 1 0 01-1-1V4z',
                },
                {
                  value: 'row',
                  label: 'Row',
                  icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h14a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z',
                },
                {
                  value: 'masonry',
                  label: 'Masonry',
                  icon: 'M4 4a1 1 0 011-1h4a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4zM14 4a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM14 15a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1h-4a1 1 0 01-1-1v-5z',
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      layoutStyle: option.value as LayoutStyle,
                    }))
                  }
                  className={`group relative flex flex-col items-center justify-center px-3 py-3 rounded-lg border text-[10px] font-bold uppercase tracking-widest transition-all duration-200 gap-2 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
                    formData.layoutStyle === option.value
                      ? 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400 shadow-[0_0_15px_-3px_rgba(239,68,68,0.2)]'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/40 text-zinc-500 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      formData.layoutStyle === option.value
                        ? 'scale-110'
                        : 'group-hover:scale-110'
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={option.icon}
                    />
                  </svg>
                  {option.label}
                  {formData.layoutStyle === option.value && (
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-red-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Cover Media Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 transition-colors duration-200">
              Cover Image
            </label>

            <div
              onClick={() => isEditMode && openMediaPicker()}
              className={`group relative w-full h-40 rounded-lg border-2 flex items-center justify-center transition-all duration-300 overflow-hidden ${
                isEditMode
                  ? 'border-dashed border-zinc-300 dark:border-zinc-700 cursor-pointer hover:border-red-500/50 dark:hover:border-red-500/50 hover:bg-red-500/5 dark:hover:bg-red-950/10'
                  : 'border-solid border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 cursor-not-allowed opacity-60'
              }`}
            >
              {formData.coverMediaId && currentCoverObj ? (
                <div className="relative w-full h-full">
                  <MediaViewport
                    mediaType={currentCoverObj.type}
                    fullResUrl={currentCoverObj.fullResUrl}
                    thumbnailUrl={currentCoverObj.thumbnailUrl}
                    caption={currentCoverObj.caption}
                    originalFilename={currentCoverObj.originalFilename}
                    className="rounded-none ring-0 shadow-none h-full"
                    priority={false}
                  />
                  {isEditMode && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-30">
                      <span className="text-white text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        Change Cover
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors duration-300">
                  <div
                    className={`p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 group-hover:bg-red-500/10 transition-colors duration-300 ${
                      isEditMode ? 'group-hover:scale-110' : ''
                    }`}
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
                    {isEditMode ? 'Select from Gallery Media' : 'Add Media First'}
                  </span>
                </div>
              )}
            </div>

            {!isEditMode && (
              <p className="text-[10px] text-amber-600 dark:text-amber-500 font-mono font-medium text-right flex items-center justify-end gap-1.5">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                Create gallery and add media to set a cover
              </p>
            )}
          </div>
        </form>
      </BaseModal>

      {/* --- Media Picker Sub-Modal --- */}
      <BaseModal
        isOpen={isMediaPickerOpen}
        onClose={closeMediaPicker}
        title="Select Cover"
        subtitle="CHOOSE FROM GALLERY MEDIA"
        maxWidth="6xl"
        isLoading={isFetchingMedia}
        footer={
          <div className="flex justify-end w-full">
            <CustomButton
              variant="ghost"
              size="md"
              onClick={closeMediaPicker}
            >
              Cancel
            </CustomButton>
          </div>
        }
      >
        <div className="space-y-0 -mx-6">
          <div className="px-6 pt-2 pb-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative z-10 transition-colors duration-300">
            <MediaLibraryHeader
              searchValue={mediaFilters.search}
              onSearchChange={(val: string) =>
                setMediaFilters((prev) => ({ ...prev, search: val }))
              }
              onSearchSubmit={handleSearchSubmitSafe}
              activeFilter={mediaFilters.type}
              onFilterChange={handleFilterChangeSafe}
              filters={TYPE_FILTERS}
              activeSort={mediaFilters.sortBy}
              onSortChange={handleSortChangeSafe}
              sorts={SORT_OPTIONS}
              totalItems={pagination.total}
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
            />
          </div>

          <div className="relative min-h-100 bg-zinc-50/50 dark:bg-zinc-900/20 p-6 transition-colors duration-300">
            {isFetchingMedia ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 animate-pulse">
                  Fetching Telemetry...
                </span>
              </div>
            ) : availableMedia.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 dark:text-zinc-400">
                <p className="font-bold uppercase tracking-widest text-sm">No Media Found</p>
                <p className="text-xs mt-2 font-mono">Add media to this gallery first.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {availableMedia.map((media) => {
                    const isSelected = formData.coverMediaId === media.id;
                    if (!media.thumbnailUrl) return null;

                    return (
                      <button
                        key={media.id}
                        onClick={() => handleSelectCover(media.id)}
                        className={`group relative cursor-pointer rounded-lg overflow-hidden transition-all duration-200 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ${
                          isSelected
                            ? 'ring-2 ring-red-500 ring-offset-2 dark:ring-offset-zinc-950 shadow-lg shadow-red-500/20 scale-[1.02]'
                            : 'hover:shadow-md hover:-translate-y-0.5 hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                      >
                        <MediaViewport
                          mediaType={media.type}
                          fullResUrl={media.fullResUrl}
                          thumbnailUrl={media.thumbnailUrl}
                          caption={media.caption}
                          originalFilename={media.originalFilename}
                          className="aspect-square rounded-none ring-0 shadow-none"
                          priority={false}
                        />

                        <div
                          className={`absolute inset-0 bg-red-600/10 transition-opacity duration-200 pointer-events-none ${
                            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                          }`}
                        />

                        <div
                          className={`absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-md border transition-all duration-200 z-20 ${
                            isSelected
                              ? 'bg-red-500 border-red-500 scale-100'
                              : 'bg-white/90 dark:bg-zinc-800/90 border-zinc-200 dark:border-zinc-700 scale-0 group-hover:scale-100'
                          }`}
                        >
                          {isSelected ? (
                            <svg
                              className="w-3.5 h-3.5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <div className="w-2 h-2 bg-zinc-400 dark:bg-zinc-500 rounded-full" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNext={pagination.hasNext}
                  hasPrevious={pagination.hasPrevious}
                  onPageChange={handlePageChangeSafe}
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
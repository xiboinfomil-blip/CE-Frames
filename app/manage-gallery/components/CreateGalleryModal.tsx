'use client';

import { useState, useId, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import {
  VISIBILITY_STATUSES,
  MEDIA_TYPES,
  type LayoutStyle,
} from '@/db/schema';

import BaseModal from '@/components/BaseModal';
import MediaLibraryHeader, {
  FilterOption,
  SortOption,
} from '@/components/SearchSortFilter';
import InfiniteScroll from '@/components/InfiniteScroll';
import MediaViewport from '@/components/media-viewport';
import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { CustomButton } from '@/components/ui/CustomButton';

import {
  HiChevronDown,
  HiExclamationCircle,
  HiPhoto,
  HiCheck,
  HiInformationCircle,
  HiArrowPath,
  HiOutlineViewColumns,
  HiOutlineListBullet,
  HiSquaresPlus,
} from 'react-icons/hi2';

interface GalleryData {
  id?: string;
  title: string;
  description?: string | null;
  eventDate?: string | null;
  visibility: typeof VISIBILITY_STATUSES[number];
  password?: string;
  coverMediaId?: string | null;
  layoutStyle?: LayoutStyle;
  coverMedia?: MediaOption | null;
}

interface MediaOption {
  id: string;
  thumbnailUrl: string;
  fullResUrl?: string | null;
  title?: string | null;
  type: typeof MEDIA_TYPES[number];
  originalFilename?: string | null;
  caption?: string | null;
  isUnused?: boolean;
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

const TYPE_FILTERS: FilterOption[] = [
  { value: 'all', label: 'Toutes les médias' },
  { value: 'image', label: 'Photos' },
  { value: 'video', label: 'Vidéos' },
  { value: 'gif', label: 'GIFs' },
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'name', label: 'Nom A-Z' },
];

const DEFAULT_FORM_DATA: GalleryData = {
  title: '',
  description: '',
  eventDate: '',
  visibility: 'public',
  password: '',
  coverMediaId: '',
  layoutStyle: 'masonry',
  coverMedia: null,
};

const DEFAULT_FILTERS = {
  search: '',
  type: 'all' as 'all' | 'image' | 'video' | 'gif',
  sortBy: 'newest' as 'newest' | 'oldest' | 'name',
  page: 1,
};

export default function CreateGalleryModal({
  isOpen,
  onClose,
  initialData = null,
}: CreateGalleryModalProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const titleId = useId();
  const descId = useId();
  const visibilityId = useId();
  const passwordId = useId();

  const buildInitialFormData = useCallback(
    (data: GalleryData | null) => {
      if (!data) return DEFAULT_FORM_DATA;

      return {
        id: data.id,
        title: data.title || '',
        description: data.description ?? '',
        eventDate: data.eventDate ?? '',
        visibility: data.visibility || 'public',
        password: '',
        coverMediaId: data.coverMediaId || '',
        layoutStyle: data.layoutStyle || 'masonry',
        coverMedia: data.coverMedia || null,
      };
    },
    []
  );

  const [formData, setFormData] =
    useState<GalleryData>(() => buildInitialFormData(initialData));

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [availableMedia, setAvailableMedia] = useState<MediaOption[]>([]);

  const [pagination, setPagination] =
    useState<PaginationData>({
      total: 0,
      currentPage: 1,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false,
    });

  const [isFetchingMedia, setIsFetchingMedia] =
    useState(false);

  const [mediaFilters, setMediaFilters] =
    useState(DEFAULT_FILTERS);

  const initialGalleryId = initialData?.id;

  const executeFetch = useCallback(
    async (filters: typeof mediaFilters, append = false) => {
      if (!initialGalleryId) return;

      setIsFetchingMedia(true);

      try {
        const params = new URLSearchParams({
          galleryId: initialGalleryId,
          search: filters.search,
          type: filters.type,
          sortBy: filters.sortBy,
          page: filters.page.toString(),
        });

        const res = await fetch(
          `/api/gallery-media/available?${params}`
        );

        if (res.ok) {
          const data = await res.json();

          setAvailableMedia((current) =>
            append ? [...current, ...(data.items || [])] : (data.items || [])
          );
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error(
          'Erreur lors du chargement des médias',
          err
        );
      } finally {
        setIsFetchingMedia(false);
      }
    },
    [initialGalleryId]
  );

  const openMediaPicker = useCallback(() => {
    setIsMediaPickerOpen(true);

    if (isEditMode && initialData?.id) {
      executeFetch(mediaFilters);
    }
  }, [
    isEditMode,
    initialData?.id,
    mediaFilters,
    executeFetch,
  ]);

  const closeMediaPicker = useCallback(
    () => setIsMediaPickerOpen(false),
    []
  );

  const handleFilterChangeSafe = useCallback(
    (type: string) => {
      const newFilters = {
        ...mediaFilters,
        type: type as typeof mediaFilters.type,
        page: 1,
      };

      setMediaFilters(newFilters);

      if (isMediaPickerOpen && isEditMode) {
        executeFetch(newFilters);
      }
    },
    [
      mediaFilters,
      isMediaPickerOpen,
      isEditMode,
      executeFetch,
    ]
  );

  const handleSortChangeSafe = useCallback(
    (sortBy: string) => {
      const newFilters = {
        ...mediaFilters,
        sortBy: sortBy as typeof mediaFilters.sortBy,
        page: 1,
      };

      setMediaFilters(newFilters);

      if (isMediaPickerOpen && isEditMode) {
        executeFetch(newFilters);
      }
    },
    [
      mediaFilters,
      isMediaPickerOpen,
      isEditMode,
      executeFetch,
    ]
  );

  const handleSearchSubmitSafe = useCallback(() => {
    const newFilters = {
      ...mediaFilters,
      page: 1,
    };

    setMediaFilters(newFilters);

    if (isMediaPickerOpen && isEditMode) {
      executeFetch(newFilters);
    }
  }, [
    mediaFilters,
    isMediaPickerOpen,
    isEditMode,
    executeFetch,
  ]);

  const loadMoreMedia = useCallback(() => {
    if (!pagination.hasNext || isFetchingMedia) return;
    const nextFilters = {
      ...mediaFilters,
      page: pagination.currentPage + 1,
    };
    setMediaFilters(nextFilters);
    executeFetch(nextFilters, true);
  }, [executeFetch, isFetchingMedia, mediaFilters, pagination.currentPage, pagination.hasNext]);

  const handleSelectCover = useCallback(
    (mediaId: string) => {
      const selectedMedia = availableMedia.find(
        (m) => m.id === mediaId
      );

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || null,
          eventDate: formData.eventDate || null,
          visibility: formData.visibility,
          password: passwordToSend,
          coverMediaId: formData.coverMediaId || null,
          layoutStyle: formData.layoutStyle || 'masonry',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.message ||
            "Impossible d'enregistrer la galerie"
        );
      }

      onClose();
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite"
      );
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

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const footerActions = (
    <div className="flex gap-3 w-full sm:w-auto justify-end">
      <CustomButton
        variant="ghost"
        size="lg"
        onClick={onClose}
        disabled={isLoading}
      >
        Annuler
      </CustomButton>

      <CustomButton
        type="submit"
        form="gallery-form-id"
        variant="primary"
        size="lg"
        isLoading={isLoading}
        disabled={
          isLoading || !formData.title.trim()
        }
      >
        {isEditMode
          ? 'Enregistrer les modifications'
          : 'Créer la galerie'}
      </CustomButton>
    </div>
  );

  const currentCoverObj =
    initialData?.coverMedia ||
    availableMedia.find(
      (m) => m.id === formData.coverMediaId
    );

  const modalTitle = isEditMode
    ? "Éditer l'album CE"
    : 'Nouvel album CE';

  return (
    <>
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title={modalTitle}
        subtitle={
          isEditMode
            ? "Mettre à jour les informations de l'album"
            : "Créer un nouvel album d'activités ou d'événements"
        }
        maxWidth="2xl"
        isLoading={isLoading}
        footer={footerActions}
      >
        <form
          id="gallery-form-id"
          onSubmit={handleSubmit}
          className="space-y-8 relative z-10"
        >
          {/* Error */}
          {error && (
            <div
              className="
                p-4
                rounded-xl
                bg-red-50
                border
                border-red-200
                text-red-700
                text-sm
                flex
                items-start
                gap-3
                animate-in
                fade-in
                slide-in-from-top-2
              "
              role="alert"
            >
              <HiExclamationCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />

              <span className="font-medium">
                {error}
              </span>
            </div>
          )}

          <div className="space-y-6">
            {/* Title */}
            <CustomTextfield
              id={titleId}
              name="title"
              type="text"
              label="Titre de l'événement / album"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="ex: Arbre de Noël 2026, Voyage au Japon, Billetterie..."
            />

            <CustomTextfield
              name="eventDate"
              type="date"
              label="Date de l'événement"
              value={formData.eventDate || ''}
              onChange={handleChange}
            />

            {/* Description */}
            <div className="space-y-1.5">
              <label
                htmlFor={descId}
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#64748B]
                  pl-1
                "
              >
                Description & Détails
              </label>

              <textarea
                id={descId}
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Précisez le contexte, la date, la commission concernée ou les modalités pour les salariés..."
                className="
                  w-full
                  px-4
                  py-3.5
                  rounded-2xl
                  text-sm
                  bg-[#F5F7FA]
                  text-[#172033]
                  placeholder:text-[#94A3B8]
                  border
                  border-[#E2E8F0]
                  dark:bg-[#0E1C2D]
                  dark:text-white
                  dark:border-white/10
                  hover:border-[#004A87]/40
                  focus:outline-none
                  focus-visible:ring-4
                  focus-visible:ring-[#FF8201]/15
                  focus:border-[#004A87]
                  transition-all
                  duration-300
                  resize-none
                  shadow-sm
                "
              />
            </div>

            {/* Visibility */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label
                  htmlFor={visibilityId}
                  className="
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-[#64748B]
                    pl-1
                  "
                >
                  Accès & Visibilité
                </label>

                <div className="relative group">
                  <select
                    id={visibilityId}
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleChange}
                    className="
                      w-full
                      px-4
                      py-3.5
                      rounded-2xl
                      text-sm
                      bg-[#F5F7FA]
                      text-[#172033]
                      border
                      border-[#E2E8F0]
                      dark:bg-[#0E1C2D]
                      dark:text-white
                      dark:border-white/10
                      hover:border-[#004A87]/40
                      focus:outline-none
                      focus-visible:ring-4
                      focus-visible:ring-[#FF8201]/15
                      focus:border-[#004A87]
                      appearance-none
                      cursor-pointer
                      transition-all
                      duration-300
                      shadow-sm
                    "
                  >
                    {VISIBILITY_STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status === 'public'
                          ? 'Tous les salariés (Public)'
                          : status === 'private'
                            ? 'Membres du CE uniquement'
                            : status ===
                                'password_protected'
                              ? 'Protégé par mot de passe'
                              : status === 'unlisted'
                                ? 'Lien direct uniquement'
                                : status}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#64748B]">
                    <HiChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div
                className={`
                  space-y-1.5
                  transition-all
                  duration-300
                  ${
                    formData.visibility ===
                    'password_protected'
                      ? 'opacity-100 translate-y-0 relative'
                      : 'opacity-0 translate-y-2 pointer-events-none absolute'
                  }
                `}
              >
                {formData.visibility ===
                  'password_protected' && (
                  <>
                    <CustomTextfield
                      id={passwordId}
                      name="password"
                      type="password"
                      label="Code d'accès"
                      value={formData.password || ''}
                      onChange={handleChange}
                      required={!isEditMode}
                      placeholder="••••••••"
                    />

                    {isEditMode && (
                      <p className="text-xs text-[#64748B] mt-1 pl-1">
                        Laissez vide pour conserver le code actuel
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Layout Options */}
            <div className="space-y-3">
              <span
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#64748B]
                  pl-1
                  block
                "
              >
                Style d&apos;affichage des photos
              </span>

              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    value: 'column',
                    label: 'Colonnes',
                    icon: (
                      <HiOutlineViewColumns className="w-6 h-6" />
                    ),
                  },
                  {
                    value: 'row',
                    label: 'Liste',
                    icon: (
                      <HiOutlineListBullet className="w-6 h-6" />
                    ),
                  },
                  {
                    value: 'masonry',
                    label: 'Mosaïque',
                    icon: (
                      <HiSquaresPlus className="w-6 h-6" />
                    ),
                  },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        layoutStyle:
                          option.value as LayoutStyle,
                      }))
                    }
                    className={`
                      group
                      relative
                      flex
                      flex-col
                      items-center
                      justify-center
                      p-4
                      rounded-2xl
                      border
                      transition-all
                      duration-300
                      gap-3
                      focus:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-[#FF8201]
                      focus-visible:ring-offset-2
                      ${
                        formData.layoutStyle ===
                        option.value
                          ? `
                            border-[#004A87]
                            bg-[#EAF4FB]
                            text-[#004A87]
                            shadow-md
                            scale-[1.02]
                          `
                          : `
                            border-[#E2E8F0]
                            bg-white
                            text-[#64748B]
                            hover:bg-[#EAF4FB]/60
                            hover:border-[#004A87]/40
                            hover:text-[#004A87]
                          `
                      }
                    `}
                  >
                    <span
                      className="
                        transition-transform
                        duration-300
                        group-hover:scale-110
                        text-[#64748B]
                        group-hover:text-[#004A87]
                      "
                    >
                      {option.icon}
                    </span>

                    <span className="text-xs font-bold uppercase tracking-wider">
                      {option.label}
                    </span>

                    {formData.layoutStyle ===
                      option.value && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#004A87] flex items-center justify-center">
                        <HiCheck className="w-3 h-3 text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cover Picker */}
            <div className="space-y-3">
              <span
                className="
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#64748B]
                  pl-1
                  block
                "
              >
                Image de couverture / Affiche
              </span>

              <button
                type="button"
                disabled={!isEditMode}
                onClick={() =>
                  isEditMode && openMediaPicker()
                }
                className={`
                  group
                  relative
                  w-full
                  h-48
                  rounded-2xl
                  border-2
                  flex
                  items-center
                  justify-center
                  transition-all
                  duration-300
                  overflow-hidden
                  text-left
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                  ${
                    isEditMode
                      ? `
                        border-dashed
                        border-[#E2E8F0]
                        cursor-pointer
                        hover:border-[#004A87]
                        hover:bg-[#EAF4FB]/50
                      `
                      : `
                        border-solid
                        border-[#E2E8F0]
                        bg-[#F5F7FA]
                        cursor-not-allowed
                        opacity-60
                      `
                  }
                `}
              >
                {formData.coverMediaId &&
                currentCoverObj ? (
                  <div className="relative w-full h-full">
                    <MediaViewport
                      mediaType={currentCoverObj.type}
                      fullResUrl={
                        currentCoverObj.fullResUrl ||
                        currentCoverObj.thumbnailUrl
                      }
                      thumbnailUrl={
                        currentCoverObj.thumbnailUrl
                      }
                      caption={currentCoverObj.caption}
                      originalFilename={
                        currentCoverObj.originalFilename
                      }
                      className="rounded-none ring-0 shadow-none h-full object-cover"
                      priority={false}
                    />

                    {isEditMode && (
                      <div className="absolute inset-0 bg-[#00345F]/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-30">
                        <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2 bg-[#00345F]/80 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                          <HiPhoto className="w-4 h-4 text-[#FF8201]" />
                          Changer la couverture
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      gap-3
                      text-[#64748B]
                      group-hover:text-[#004A87]
                      transition-colors
                      duration-300
                    "
                  >
                    <div
                      className={`
                        p-4
                        rounded-full
                        bg-[#EAF4FB]
                        text-[#004A87]
                        transition-all
                        duration-300
                        ${
                          isEditMode
                            ? 'group-hover:scale-110 group-hover:bg-[#FFF1E5] group-hover:text-[#FF8201]'
                            : ''
                        }
                      `}
                    >
                      <HiPhoto className="w-6 h-6" />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-widest text-center px-4">
                      {isEditMode
                        ? "Choisir depuis l&apos;album"
                        : "Ajoutez des photos avant de choisir une couverture"}
                    </span>
                  </div>
                )}
              </button>

              {!isEditMode && (
                <p className="text-xs text-[#64748B] text-right flex items-center justify-end gap-1.5">
                  <HiInformationCircle className="w-3.5 h-3.5 text-[#004A87]" />
                  Créez d&apos;abord l&apos;album puis ajoutez des médias pour définir une couverture
                </p>
              )}
            </div>
          </div>
        </form>
      </BaseModal>

      {/* --- Media Picker Sub-Modal --- */}
      <BaseModal
        isOpen={isMediaPickerOpen}
        onClose={closeMediaPicker}
        title="Sélectionner la couverture"
        subtitle="Choisissez une photo ou illustration dans la galerie de cet événement"
        maxWidth="6xl"
        isLoading={isFetchingMedia}
        footer={
          <div className="flex justify-end w-full">
            <CustomButton
              variant="ghost"
              size="md"
              onClick={closeMediaPicker}
            >
              Fermer
            </CustomButton>
          </div>
        }
      >
        <div className="space-y-0 -mx-6">
          {/* Picker Header */}
          <div className="px-6 pt-2 pb-4 border-b border-[#E2E8F0] bg-white relative z-10">
            <MediaLibraryHeader
              searchValue={mediaFilters.search}
              onSearchChange={(val: string) =>
                setMediaFilters((prev) => ({
                  ...prev,
                  search: val,
                }))
              }
              onSearchSubmit={handleSearchSubmitSafe}
              activeFilter={mediaFilters.type}
              onFilterChange={handleFilterChangeSafe}
              filters={TYPE_FILTERS}
              activeSort={mediaFilters.sortBy}
              onSortChange={handleSortChangeSafe}
              sorts={SORT_OPTIONS}
              totalItems={pagination.total}
            />
          </div>

          {/* Picker Content */}
          <div className="relative min-h-100 bg-[#F5F7FA] p-6">
            {isFetchingMedia ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <HiArrowPath className="w-8 h-8 text-[#004A87] animate-spin" />

                <span className="text-xs font-bold uppercase tracking-widest text-[#64748B]">
                  Chargement des photos...
                </span>
              </div>
            ) : availableMedia.length === 0 ? (
              <div className="text-center py-20 text-[#64748B]">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#EAF4FB] flex items-center justify-center">
                  <HiPhoto className="w-6 h-6 text-[#004A87]" />
                </div>

                <p className="font-bold text-sm uppercase tracking-widest text-[#172033]">
                  Aucun média trouvé
                </p>

                <p className="text-xs mt-2 font-medium text-[#64748B]">
                  Ajoutez des fichiers à cet album d&apos;abord.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {availableMedia.map((media) => {
                    const isSelected =
                      formData.coverMediaId === media.id;

                    if (!media.thumbnailUrl) {
                      return null;
                    }

                    return (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() =>
                          handleSelectCover(media.id)
                        }
                        className={`
                          group
                          relative
                          cursor-pointer
                          rounded-xl
                          overflow-hidden
                          transition-all
                          duration-300
                          bg-white
                          border
                          ${
                            isSelected
                              ? `
                                ring-2
                                ring-[#FF8201]
                                ring-offset-2
                                shadow-lg
                                scale-[1.02]
                                z-10
                                border-[#004A87]
                              `
                              : `
                                border-[#E2E8F0]
                                hover:shadow-md
                                hover:-translate-y-1
                                hover:border-[#004A87]/50
                              `
                          }
                        `}
                      >
                        {media.isUnused && (
                          <span className="absolute left-[-2.6rem] top-5 z-30 w-32 -rotate-45 bg-[#FF8201] py-1 text-center text-[9px] font-black tracking-[0.18em] text-white shadow-md">
                            UNUSED
                          </span>
                        )}
                        <MediaViewport
                          mediaType={media.type}
                          fullResUrl={
                            media.fullResUrl ||
                            media.thumbnailUrl
                          }
                          thumbnailUrl={
                            media.thumbnailUrl
                          }
                          caption={media.caption}
                          originalFilename={
                            media.originalFilename
                          }
                          className="aspect-square rounded-none ring-0 shadow-none object-cover"
                          priority={false}
                        />

                        {/* Selection Indicator */}
                        <div
                          className={`
                            absolute
                            top-3
                            right-3
                            w-6
                            h-6
                            rounded-full
                            flex
                            items-center
                            justify-center
                            shadow-sm
                            border
                            transition-all
                            duration-300
                            z-20
                            ${
                              isSelected
                                ? `
                                  bg-[#004A87]
                                  border-[#004A87]
                                  scale-100
                                `
                                : `
                                  bg-white/90
                                  border-[#E2E8F0]
                                  scale-0
                                  group-hover:scale-100
                                `
                            }
                          `}
                        >
                          {isSelected ? (
                            <HiCheck className="w-3.5 h-3.5 text-white" />
                          ) : (
                            <div className="w-2 h-2 bg-[#94A3B8] rounded-full" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <InfiniteScroll
                  hasMore={pagination.hasNext}
                  isLoading={isFetchingMedia}
                  onLoadMore={loadMoreMedia}
                  className="mt-8 h-16"
                />
              </>
            )}
          </div>
        </div>
      </BaseModal>
    </>
  );
}


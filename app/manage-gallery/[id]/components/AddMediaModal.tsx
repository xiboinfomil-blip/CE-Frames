'use client';

import { useState, useCallback, useMemo, memo } from 'react';

import { MEDIA_TYPES } from '@/db/schema';
import MediaViewport from '@/components/media-viewport';
import MediaLibraryHeader, {
  FilterOption,
  SortOption,
} from '@/components/SearchSortFilter';
import Pagination from '@/components/Pagination';
import BaseModal from '@/components/BaseModal';
import { CustomButton } from '@/components/ui/CustomButton';

import {
  HiCheck,
  HiPlus,
  HiPhoto,
} from 'react-icons/hi2';

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
  onFilterChange: (
    type: 'all' | 'image' | 'video' | 'gif'
  ) => void;
  onSortChange: (
    sortBy: 'newest' | 'oldest' | 'name'
  ) => void;
  onPageChange: (page: number) => void;
  onAddMedia: (
    mediaId: string
  ) => Promise<boolean>;
  onPreview?: (
    media: MediaOption
  ) => void;
}

// --- Static Configurations ---
const TYPE_FILTERS: FilterOption[] = [
  {
    value: 'all',
    label: 'Tous les médias',
  },
  {
    value: 'image',
    label: 'Images',
  },
  {
    value: 'video',
    label: 'Vidéos',
  },
  {
    value: 'gif',
    label: 'GIFs',
  },
];

const SORT_OPTIONS: SortOption[] = [
  {
    value: 'newest',
    label: 'Plus récents',
  },
  {
    value: 'oldest',
    label: 'Plus anciens',
  },
  {
    value: 'name',
    label: 'Nom (A-Z)',
  },
];

// --- Sub-Component: Media Card ---
interface MediaCardProps {
  media: MediaOption;
  isSelected: boolean;
  onToggle: () => void;
  onPreview: () => void;
  isAdding: boolean;
}

const MediaCard = memo(function MediaCard({
  media,
  isSelected,
  onToggle,
  onPreview,
  isAdding,
}: MediaCardProps) {
  return (
    <div
      className={`
        group/card
        flex
        flex-col
        gap-3
        transition-all
        duration-300
        ${isAdding
          ? 'opacity-50 pointer-events-none'
          : ''}
      `}
    >
      {/* =====================================================
          1. Media Viewport Area
      ====================================================== */}
      <div
        className="
          relative
          cursor-pointer
          rounded-xl
          overflow-hidden
          border
          border-[#E2E8F0]
          bg-white
          dark:border-white/10
          dark:bg-[#102238]
          shadow-sm
          hover:shadow-[0_8px_20px_rgba(0,52,95,0.10)]
          hover:-translate-y-1
          transition-all
          duration-300
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#FF8201]
          focus-visible:ring-offset-2
          dark:focus-visible:ring-offset-[#102238]
        "
        onClick={onPreview}
        onKeyDown={(e) => {
          if (
            e.key === 'Enter' ||
            e.key === ' '
          ) {
            e.preventDefault();
            onPreview();
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`Aperçu de ${
          media.title || 'élément média'
        }`}
      >
        <div className="aspect-4/3 relative">
          <MediaViewport
            mediaType={
              media.type as typeof MEDIA_TYPES[number]
            }
            fullResUrl={
              media.fullResUrl ||
              media.thumbnailUrl
            }
            thumbnailUrl={media.thumbnailUrl}
            caption={media.title}
            className="w-full h-full object-cover"
          />

          {/* Overlay Gradient */}
          <div
            className="
              absolute
              inset-0
              bg-[#00345F]/0
              group-hover/card:bg-[#00345F]/10
              transition-colors
              duration-300
            "
          />
        </div>

        {/* ===================================================
            Animated Selection Badge
        ==================================================== */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`
            absolute
            top-3
            right-3
            z-20
            flex
            h-6
            w-6
            items-center
            justify-center
            rounded-full
            border
            shadow-sm
            transition-all
            duration-300
            ease-out
            cursor-pointer

            focus:outline-none

            ${
              isSelected
                ? `
                  bg-[#004A87]
                  border-[#004A87]
                  text-white
                  scale-100
                  shadow-[0_2px_8px_rgba(0,74,135,0.25)]
                `
                : `
                  bg-white/95
                  border-white
                  text-transparent
                  scale-90
                  hover:scale-100
                  hover:border-[#FF8201]
                  hover:bg-[#FFF1E5]
                `
            }
          `}
          role="checkbox"
          aria-checked={isSelected}
          aria-label={
            isSelected
              ? 'Désélectionner ce média'
              : 'Sélectionner ce média'
          }
        >
          <HiCheck className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* =====================================================
          2. Action & Info Bar
      ====================================================== */}
      <div className="flex items-center justify-between px-1">
        <div className="min-w-0 flex-1 pr-2">
          <p
            className="
              truncate
              text-xs
              font-bold
              text-[#172033]
              tracking-tight
            "
          >
            {media.title ||
              'Média sans titre'}
          </p>

          <p
            className="
              mt-0.5
              font-mono
              text-[10px]
              text-[#64748B]
              uppercase
              tracking-wider
            "
          >
            {media.type} •{' '}
            {media.id
              ? media.id.slice(0, 6)
              : 'N/A'}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          disabled={isAdding}
          className={`
            shrink-0
            px-3
            py-1.5
            rounded-lg
            text-[10px]
            font-bold
            uppercase
            tracking-widest
            transition-all
            duration-200
            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#FF8201]
            focus-visible:ring-offset-1

            ${
              isSelected
                ? `
                  bg-[#004A87]
                  text-white
                  shadow-sm
                  hover:bg-[#00345F]
                `
                : `
                  bg-[#F5F7FA]
                  text-[#64748B]
                  border
                  border-[#E2E8F0]
                  hover:bg-[#EAF4FB]
                  hover:text-[#004A87]
                  hover:border-[#004A87]/20
                `
            }
          `}
        >
          {isSelected
            ? 'Sélectionné'
            : 'Sélectionner'}
        </button>
      </div>
    </div>
  );
});

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
  onPreview,
}: AddMediaModalProps) {
  const [selectedIds, setSelectedIds] =
    useState<Set<string>>(new Set());

  const [searchInput, setSearchInput] =
    useState(initialFilters.search);

  const [isAdding, setIsAdding] =
    useState(false);

  const handleReset = useCallback(() => {
    setSelectedIds(new Set());
    setSearchInput(
      initialFilters.search
    );
  }, [initialFilters.search]);

  const handleSearchSubmitLocal =
    useCallback(() => {
      onSearchChange(searchInput);
      onSearchSubmit();
    }, [
      searchInput,
      onSearchChange,
      onSearchSubmit,
    ]);

  const toggleSelection = useCallback(
    (id: string) => {
      if (!id) return;

      setSelectedIds((prev) => {
        const newSet = new Set(prev);

        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }

        return newSet;
      });
    },
    []
  );

  const isAllSelected = useMemo(
    () =>
      availableMedia.length > 0 &&
      selectedIds.size === availableMedia.length,
    [availableMedia.length, selectedIds.size]
  );

  const selectAll = useCallback(() => {
    const validIds = availableMedia
      .filter((m) => m.id)
      .map((m) => m.id);

    setSelectedIds(
      isAllSelected
        ? new Set()
        : new Set(validIds)
    );
  }, [
    isAllSelected,
    availableMedia,
  ]);

  const handleAdd = useCallback(
    async () => {
      if (selectedIds.size === 0) return;

      setIsAdding(true);

      try {
        const results = await Promise.all(
          Array.from(selectedIds).map(
            onAddMedia
          )
        );

        const hasFailures =
          results.some(
            (r) => r === false
          );

        if (hasFailures) {
          console.warn(
            "Certains médias n'ont pas pu être ajoutés."
          );
        }

        setSelectedIds(new Set());
        onClose();
      } catch (err) {
        console.error(
          "Échec de l'ajout des médias",
          err
        );
      } finally {
        setIsAdding(false);
      }
    },
    [
      selectedIds,
      onAddMedia,
      onClose,
    ]
  );

  const footerActions = (
    <div
      className="
        flex
        flex-col
        sm:flex-row
        items-center
        justify-between
        gap-4
        w-full
      "
    >
      <div
        className="
          text-[10px]
          font-mono
          font-bold
          text-[#64748B]
          uppercase
          tracking-widest
          self-center
          hidden
          sm:block
        "
      >
        {selectedIds.size > 0 ? (
          <span
            className="
              text-[#00345F]
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                w-1.5
                h-1.5
                rounded-full
                bg-[#FF8201]
                animate-pulse
              "
            />

            {selectedIds.size}{' '}
            ÉLÉMENT(S) SÉLECTIONNÉ(S)
          </span>
        ) : (
          <span>
            AUCUN ÉLÉMENT SÉLECTIONNÉ
          </span>
        )}
      </div>

      <div
        className="
          flex
          gap-3
          w-full
          sm:w-auto
        "
      >
        <CustomButton
          variant="ghost"
          size="lg"
          onClick={() => {
            handleReset();
            onClose();
          }}
          disabled={isAdding}
          className="
            flex-1
            sm:flex-none
          "
        >
          Annuler
        </CustomButton>

        <CustomButton
          variant="primary"
          size="lg"
          onClick={handleAdd}
          disabled={
            isAdding ||
            selectedIds.size === 0
          }
          isLoading={isAdding}
          leftIcon={
            !isAdding && (
              <HiPlus className="w-4 h-4" />
            )
          }
          className="
            flex-1
            sm:flex-none
          "
        >
          {isAdding
            ? 'Traitement...'
            : "Ajouter à l'album"}
        </CustomButton>
      </div>
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Sélectionner des médias"
      subtitle="AJOUTER DES MÉDIAS À L'ALBUM CE"
      maxWidth="7xl"
      isLoading={isAdding}
      footer={footerActions}
    >
      <div
        className="
          space-y-0
          -mx-6
        "
      >
        {/* ===================================================
            Sticky Header
        ==================================================== */}
        <div
          className="
            sticky
            top-0
            z-30
            px-6
            pt-2
            pb-4
            border-b
            border-[#E2E8F0]/80
            bg-white/85
            backdrop-blur-xl
          "
        >
          <MediaLibraryHeader
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={
              handleSearchSubmitLocal
            }
            activeFilter={
              initialFilters.type
            }
            onFilterChange={(val) =>
              onFilterChange(
                val as
                  | 'all'
                  | 'image'
                  | 'video'
                  | 'gif'
              )
            }
            filters={TYPE_FILTERS}
            activeSort={
              initialFilters.sortBy
            }
            onSortChange={(val) =>
              onSortChange(
                val as
                  | 'newest'
                  | 'oldest'
                  | 'name'
              )
            }
            sorts={SORT_OPTIONS}
            totalItems={
              modalPagination.total
            }
            currentPage={
              modalPagination.currentPage
            }
            totalPages={
              modalPagination.totalPages
            }
          />
        </div>

        {/* ===================================================
            Collection Toolbar
        ==================================================== */}
        <div
          className="
            px-6
            py-3
            bg-[#F5F7FA]
            border-b
            border-[#E2E8F0]
            flex
            justify-between
            items-center
          "
        >
          <span
            className="
              text-[10px]
              font-mono
              font-bold
              text-[#64748B]
              uppercase
              tracking-widest
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                w-1.5
                h-1.5
                rounded-full
                bg-[#004A87]
              "
            />

            {modalPagination.total}{' '}
            MÉDIAS DISPONIBLES
          </span>

          <button
            onClick={selectAll}
            disabled={
              availableMedia.length === 0 ||
              isAdding
            }
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-widest
              text-[#64748B]
              hover:text-[#004A87]
              transition-colors
              disabled:opacity-50
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#FF8201]
              focus-visible:ring-offset-2
              rounded-sm
            "
          >
            {isAllSelected
              ? 'Tout désélectionner'
              : 'Tout sélectionner'}
          </button>
        </div>

        {/* ===================================================
            Content Area
        ==================================================== */}
        <div
          className="
            relative
            min-h-100
            bg-white
          "
        >
          {availableMedia.length === 0 ? (
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-24
                text-center
                px-4
              "
            >
              <div
                className="
                  w-20
                  h-20
                  mb-6
                  rounded-2xl
                  bg-[#EAF4FB]
                  flex
                  items-center
                  justify-center
                  border
                  border-[#E2E8F0]
                  shadow-sm
                "
              >
                <HiPhoto
                  className="
                    w-8
                    h-8
                    text-[#004A87]
                  "
                />
              </div>

              <h3
                className="
                  text-lg
                  font-bold
                  text-[#172033]
                  tracking-tight
                "
              >
                Aucun média trouvé
              </h3>

              <p
                className="
                  text-[#64748B]
                  mt-2
                  text-sm
                  max-w-xs
                  font-medium
                "
              >
                {initialFilters.search
                  ? 'Essayez de modifier vos critères de recherche.'
                  : "Téléversez d'abord de nouveaux médias dans la médiathèque."}
              </p>
            </div>
          ) : (
            <div className="p-6">
              <div
                className="
                  grid
                  grid-cols-2
                  sm:grid-cols-3
                  lg:grid-cols-4
                  xl:grid-cols-5
                  gap-6
                "
              >
                {availableMedia.map(
                  (media, index) => (
                    <MediaCard
                      key={
                        media.id &&
                        media.id !== ''
                          ? media.id
                          : `media-item-${index}`
                      }
                      media={media}
                      isSelected={selectedIds.has(
                        media.id
                      )}
                      onToggle={() =>
                        toggleSelection(
                          media.id
                        )
                      }
                      onPreview={() =>
                        onPreview?.(media)
                      }
                      isAdding={isAdding}
                    />
                  )
                )}
              </div>

              {modalPagination.totalPages >
                1 && (
                <div
                  className="
                    mt-10
                    flex
                    justify-center
                  "
                >
                  <Pagination
                    currentPage={
                      modalPagination.currentPage
                    }
                    totalPages={
                      modalPagination.totalPages
                    }
                    hasNext={
                      modalPagination.hasNext
                    }
                    hasPrevious={
                      modalPagination.hasPrevious
                    }
                    onPageChange={
                      onPageChange
                    }
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


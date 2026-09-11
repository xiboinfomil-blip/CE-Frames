'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';
import { getVideoMimeType } from '@/lib/utils';

import MediaCard from './components/MediaCard';
import AddMediaModal from './components/AddMediaModal';
import ReorderMediaModal from './components/ReorderMediaModal';
import MediaLibraryHeader, {
  FilterOption,
  SortOption,
} from '@/components/SearchSortFilter';
import InfiniteScroll from '@/components/InfiniteScroll';
import FloatingActionButton from '@/components/FloatingActionButton';
import BulkActionsMenu from '@/components/BulkActionsMenu';
import CardGrid from '@/components/displayGrid';
import { CustomButton } from '@/components/ui/CustomButton';
import GalleryLightbox, { type MediaItem as LightboxMediaItem } from '@/components/GalleryLightbox';

import { FolderOpen } from 'lucide-react';

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
    originalFilename?: string | null;
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
    sortBy:
      | 'newest'
      | 'oldest'
      | 'name'
      | 'position';
  };
}

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
    value: 'position',
    label: 'Ordre personnalisé',
  },
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

// ============================================================
// Main Component
// ============================================================

export default function ManageGalleryClient({
  gallery,
  galleryMediaItems,
  availableMedia,
  mainPagination,
  modalPagination,
  initialFilters,
}: ManageGalleryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isAddModalOpen, setIsAddModalOpen] =
    useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] =
    useState(false);

  // Use the server-provided values as the initial state for this client view.
  // The page refreshes on mutation, so we avoid extra render-churn sync loops here.
  const [gallerySearchInput, setGallerySearchInput] =
    useState(() => initialFilters.gallerySearch);
  const [modalSearchInput, setModalSearchInput] =
    useState(() => initialFilters.search);
  const [localMediaItems, setLocalMediaItems] =
    useState(() => galleryMediaItems);
  const [localAvailableMedia, setLocalAvailableMedia] =
    useState(() => availableMedia);
  const [mainNextPage, setMainNextPage] = useState(mainPagination.currentPage + 1);
  const [modalNextPage, setModalNextPage] = useState(modalPagination.currentPage + 1);
  const [mainHasMore, setMainHasMore] = useState(mainPagination.hasNext);
  const [modalHasMore, setModalHasMore] = useState(modalPagination.hasNext);
  const [isLoadingMain, setIsLoadingMain] = useState(false);
  const [isLoadingModal, setIsLoadingModal] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [availableLightboxIndex, setAvailableLightboxIndex] = useState(-1);
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([]);

  const lightboxSlides = localMediaItems.map((item) => ({
    type: item.media.type === 'video' ? 'video' : 'image',
    src: item.media.type === 'video' ? undefined : item.media.fullResUrl,
    sources: item.media.type === 'video' ? [{ src: item.media.fullResUrl, type: getVideoMimeType(item.media.fullResUrl, item.media.mimeType) }] : undefined,
    poster: item.media.type === 'video' ? item.media.thumbnailUrl : undefined,
    width: item.media.width || 800,
    height: item.media.height || 600,
    alt: item.media.originalFilename || item.media.title || 'Média',
    title: item.media.originalFilename || item.media.title || undefined,
    mediaId: item.media.id,
  })) as LightboxMediaItem[];

  const availableLightboxSlides = localAvailableMedia.map((item) => ({
    type: item.type === 'video' ? 'video' : 'image',
    src: item.type === 'video' ? undefined : item.fullResUrl,
    sources: item.type === 'video' ? [{ src: item.fullResUrl, type: getVideoMimeType(item.fullResUrl, item.mimeType) }] : undefined,
    poster: item.type === 'video' ? item.thumbnailUrl : undefined,
    width: 1200,
    height: 800,
    alt: item.title || 'Média',
    title: item.title || undefined,
    mediaId: item.id,
  })) as LightboxMediaItem[];

  const loadMoreMain = useCallback(async () => {
    if (isLoadingMain || !mainHasMore) return;
    setIsLoadingMain(true);
    try {
      const params = new URLSearchParams({
        galleryId: gallery.id,
        page: String(mainNextPage),
        gallerySearch: initialFilters.gallerySearch,
        sortBy: initialFilters.sortBy,
        type: initialFilters.type,
      });
      const response = await fetch(`/api/gallery-media?${params}`);
      if (!response.ok) throw new Error('Failed to load gallery media');
      const data = await response.json();
      setLocalMediaItems((current) => [...current, ...data.items]);
      setMainHasMore(data.pagination?.hasNext ?? false);
      setMainNextPage((page) => page + 1);
    } catch (error) {
      console.error('Failed to load gallery media:', error);
    } finally {
      setIsLoadingMain(false);
    }
  }, [gallery.id, initialFilters, isLoadingMain, mainHasMore, mainNextPage]);

  const loadMoreModal = useCallback(async () => {
    if (isLoadingModal || !modalHasMore) return;
    setIsLoadingModal(true);
    try {
      const params = new URLSearchParams({
        galleryId: gallery.id,
        page: String(modalNextPage),
        search: initialFilters.search,
        type: initialFilters.type,
        sortBy: initialFilters.sortBy === 'position' ? 'newest' : initialFilters.sortBy,
      });
      const response = await fetch(`/api/gallery-media/available?${params}`);
      if (!response.ok) throw new Error('Failed to load available media');
      const data = await response.json();
      setLocalAvailableMedia((current) => [...current, ...data.items]);
      setModalHasMore(data.pagination?.hasNext ?? false);
      setModalNextPage((page) => page + 1);
    } catch (error) {
      console.error('Failed to load available media:', error);
    } finally {
      setIsLoadingModal(false);
    }
  }, [gallery.id, initialFilters, isLoadingModal, modalHasMore, modalNextPage]);

  // ==========================================================
  // Shared Reorder Logic
  // ==========================================================

  const applyNewOrder = useCallback(
    async (
      orderedMediaIds: string[]
    ) => {
      setLocalMediaItems((current) =>
        [...current].sort(
          (a, b) =>
            orderedMediaIds.indexOf(a.mediaId) -
            orderedMediaIds.indexOf(b.mediaId)
        )
      );

      try {
        const res = await fetch(
          '/api/gallery-media/reorder',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body: JSON.stringify({
              galleryId: gallery.id,
              orderedMediaIds,
            }),
          }
        );

        if (!res.ok) {
          throw new Error(
            'Échec du réordonnancement'
          );
        }
      } catch (error) {
        console.error(
          "Échec de la modification de l'ordre des médias",
          error
        );

        Swal.fire({
          title: 'Erreur',
          text: "Impossible de mettre à jour l'ordre. Veuillez réessayer.",
          icon: 'error',
          confirmButtonText: 'Fermer',
          confirmButtonColor:
            '#004A87',
          background: 'var(--page-background)',
          color: 'var(--page-foreground)',
          customClass: {
            popup:
              'rounded-2xl shadow-2xl border border-[#E2E8F0]',
            confirmButton:
              'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[#00345F]',
          },
        });

        router.refresh();
      }
    },
    [gallery.id, router]
  );

  const handleSaveReorder = useCallback(
    async (orderedMediaIds: string[]) => {
      await applyNewOrder(orderedMediaIds);
    },
    [applyNewOrder]
  );

  // ==========================================================
  // Main Filters
  // ==========================================================

  const updateMainFilters =
    useCallback(
      (updates: {
        gallerySearch?: string;
        type?:
          | 'all'
          | 'image'
          | 'video'
          | 'gif';
        sortBy?:
          | 'newest'
          | 'oldest'
          | 'name'
          | 'position';
        page?: number;
      }) => {
        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        if (
          updates.gallerySearch !==
          undefined
        ) {
          if (
            updates.gallerySearch
          ) {
            params.set(
              'gallerySearch',
              updates.gallerySearch
            );
          } else {
            params.delete(
              'gallerySearch'
            );
          }
        }

        if (
          updates.type !==
          undefined
        ) {
          if (
            updates.type !== 'all'
          ) {
            params.set(
              'type',
              updates.type
            );
          } else {
            params.delete('type');
          }
        }

        if (
          updates.sortBy !==
          undefined
        ) {
          if (
            updates.sortBy !==
            'position'
          ) {
            params.set(
              'sortBy',
              updates.sortBy
            );
          } else {
            params.delete(
              'sortBy'
            );
          }
        }

        if (
          updates.page !==
          undefined
        ) {
          params.set(
            'page',
            updates.page.toString()
          );
        } else {
          params.delete('page');
        }

        router.push(
          `?${params.toString()}`,
          { scroll: false }
        );
      },
      [router, searchParams]
    );

  const handleMainSearchSubmit =
    useCallback(() => {
      updateMainFilters({
        gallerySearch:
          gallerySearchInput,
        page: 1,
      });
    }, [
      gallerySearchInput,
      updateMainFilters,
    ]);

  const handleMainTypeFilter =
    useCallback(
      (type: string) => {
        updateMainFilters({
          type: type as
            | 'all'
            | 'image'
            | 'video'
            | 'gif',
          page: 1,
        });
      },
      [updateMainFilters]
    );

  const handleMainSortChange =
    useCallback(
      (sortBy: string) => {
        updateMainFilters({
          sortBy: sortBy as
            | 'newest'
            | 'oldest'
            | 'name'
            | 'position',
          page: 1,
        });
      },
      [updateMainFilters]
    );

  // ==========================================================
  // Modal Filters
  // ==========================================================

  const updateModalFilters =
    useCallback(
      (updates: {
        search?: string;
        type?:
          | 'all'
          | 'image'
          | 'video'
          | 'gif';
        sortBy?:
          | 'newest'
          | 'oldest'
          | 'name';
        page?: number;
      }) => {
        const params =
          new URLSearchParams(
            searchParams.toString()
          );

        if (
          updates.search !==
          undefined
        ) {
          if (updates.search) {
            params.set(
              'search',
              updates.search
            );
          } else {
            params.delete(
              'search'
            );
          }
        }

        if (
          updates.type !==
          undefined
        ) {
          if (
            updates.type !== 'all'
          ) {
            params.set(
              'type',
              updates.type
            );
          } else {
            params.delete('type');
          }
        }

        if (
          updates.sortBy !==
          undefined
        ) {
          if (
            updates.sortBy !==
            'newest'
          ) {
            params.set(
              'sortBy',
              updates.sortBy
            );
          } else {
            params.delete(
              'sortBy'
            );
          }
        }

        if (
          updates.page !==
          undefined
        ) {
          params.set(
            'modalPage',
            updates.page.toString()
          );
        } else {
          params.delete(
            'modalPage'
          );
        }

        router.push(
          `?${params.toString()}`,
          { scroll: false }
        );
      },
      [router, searchParams]
    );

  const handleModalSearchSubmit =
    useCallback(() => {
      updateModalFilters({
        search:
          modalSearchInput,
        page: 1,
      });
    }, [
      modalSearchInput,
      updateModalFilters,
    ]);

  const handleModalTypeFilter =
    useCallback(
      (type: string) => {
        updateModalFilters({
          type: type as
            | 'all'
            | 'image'
            | 'video'
            | 'gif',
          page: 1,
        });
      },
      [updateModalFilters]
    );

  const handleModalSortChange =
    useCallback(
      (sortBy: string) => {
        updateModalFilters({
          sortBy: sortBy as
            | 'newest'
            | 'oldest'
            | 'name',
          page: 1,
        });
      },
      [updateModalFilters]
    );

  // ==========================================================
  // Remove Media
  // ==========================================================

  const handleToggleMediaSelect = useCallback((mediaId: string) => {
    setSelectedMediaIds((current) =>
      current.includes(mediaId)
        ? current.filter((id) => id !== mediaId)
        : [...current, mediaId]
    );
  }, []);

  const handleSelectAllMedia = useCallback(() => {
    setSelectedMediaIds((current) =>
      current.length === localMediaItems.length
        ? []
        : localMediaItems.map((item) => item.mediaId)
    );
  }, [localMediaItems]);

  const handleBulkRemoveMedia = useCallback(async () => {
    if (selectedMediaIds.length === 0) return;

    const result = await Swal.fire({
      title: `Retirer ${selectedMediaIds.length} média(s) ?`,
      text: 'Cette action retire les médias sélectionnés de l’album sans les supprimer de la médiathèque.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#EAF4FB',
      confirmButtonText: 'Retirer',
      cancelButtonText: 'Annuler',
      background: 'var(--page-background)',
      color: 'var(--page-foreground)',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-[#E2E8F0]',
        title: 'font-semibold text-[#172033] dark:text-white',
        htmlContainer: 'text-[#64748B] dark:text-white/70 font-medium',
      },
    });

    if (!result.isConfirmed) return;

    try {
      const responses = await Promise.all(
        selectedMediaIds.map((mediaId) =>
          fetch(`/api/gallery-media?galleryId=${gallery.id}&mediaId=${mediaId}`, { method: 'DELETE' })
        )
      );

      const failed = responses.some((response) => !response.ok);
      if (failed) {
        throw new Error('Une ou plusieurs suppressions ont échoué.');
      }

      setLocalMediaItems((current) =>
        current.filter((item) => !selectedMediaIds.includes(item.mediaId))
      );
      setSelectedMediaIds([]);
      router.refresh();
    } catch (error) {
      console.error('Bulk remove media failed:', error);
      await Swal.fire({
        title: 'Retrait impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        icon: 'error',
        confirmButtonColor: '#004A87',
        background: 'var(--page-background)',
        color: 'var(--page-foreground)',
      });
    }
  }, [gallery.id, router, selectedMediaIds]);

  const handleRemoveMedia =
    useCallback(
      async (mediaId: string) => {
        const result =
          await Swal.fire({
            title:
              'Confirmer la suppression',

            text:
              "Retirer ce média de l'album CE ? Cela ne supprimera pas le fichier d'origine de la médiathèque.",

            icon: 'warning',

            showCancelButton: true,

            confirmButtonColor:
              '#dc2626',

            cancelButtonColor:
              '#EAF4FB',

            confirmButtonText:
              'Oui, retirer',

            cancelButtonText:
              'Annuler',

            background: 'var(--page-background)',
            color: 'var(--page-foreground)',

            customClass: {
              popup:
                'rounded-2xl shadow-2xl border border-[#E2E8F0]',

              title:
                'font-semibold text-[#172033]',

              confirmButton:
                'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500',

              cancelButton:
                'px-5 py-2.5 rounded-xl text-sm font-medium text-[#00345F] hover:bg-[#DCEEF9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201]',
            },
          });

        if (
          !result.isConfirmed
        ) {
          return false;
        }

        try {
          const res =
            await fetch(
              `/api/gallery-media?galleryId=${gallery.id}&mediaId=${mediaId}`,
              {
                method: 'DELETE',
              }
            );

          if (!res.ok) {
            throw new Error(
              'Échec du retrait'
            );
          }

          setLocalMediaItems((current) => current.filter((item) => item.mediaId !== mediaId));
          setSelectedMediaIds((current) => current.filter((id) => id !== mediaId));
          router.refresh();
          return true;
        } catch (error) {
          console.error(
            'Échec du retrait du média',
            error
          );

          Swal.fire({
            title: 'Erreur',
            text: 'Impossible de retirer le média.',
            icon: 'error',
            confirmButtonText:
              'Fermer',
            confirmButtonColor:
              '#004A87',
            background: 'var(--page-background)',
            color: 'var(--page-foreground)',
            customClass: {
              popup:
                'rounded-2xl shadow-2xl border border-[#E2E8F0]',
              confirmButton:
                'px-5 py-2.5 rounded-xl text-sm font-semibold',
            },
          });
          return false;
        }
      },
      [gallery.id, router]
    );

  // ==========================================================
  // Add Media
  // ==========================================================

  const handleAddMediaToGallery =
    useCallback(
      async (mediaId: string) => {
        try {
          const res =
            await fetch(
              '/api/gallery-media',
              {
                method: 'POST',
                headers: {
                  'Content-Type':
                    'application/json',
                },
                body: JSON.stringify({
                  galleryId:
                    gallery.id,
                  mediaId,
                }),
              }
            );

          if (!res.ok) {
            throw new Error(
              "Échec de l'ajout du média"
            );
          }

          const addedMedia = localAvailableMedia.find((item) => item.id === mediaId);
          if (addedMedia) {
            setLocalAvailableMedia((current) => current.filter((item) => item.id !== mediaId));
            setLocalMediaItems((current) => [
              ...current,
              {
                id: addedMedia.id,
                mediaId: addedMedia.id,
                position: current.length,
                media: {
                  id: addedMedia.id,
                  thumbnailUrl: addedMedia.thumbnailUrl,
                  fullResUrl: addedMedia.fullResUrl,
                  title: addedMedia.title,
                  originalFilename: addedMedia.title,
                  type: addedMedia.type,
                  width: null,
                  height: null,
                },
              },
            ]);
          }

          router.refresh();

          return true;
        } catch (error) {
          console.error(
            "Échec de l'ajout du média",
            error
          );

          return false;
        }
      },
      [gallery.id, localAvailableMedia, router]
    );

  // ==========================================================
  // Close Add Modal
  // ==========================================================

  const handleCloseModal =
    useCallback(() => {
      setIsAddModalOpen(false);
    }, []);

  // ==========================================================
  // Render
  // ==========================================================

  return (
    <div
      className="
        min-h-screen
        bg-[#F5F7FA]
        text-[#172033]
        font-sans
        relative
        selection:bg-[#FF8201]/30
        selection:text-[#00345F]
      "
    >
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ===================================================
            Sticky Header
        ==================================================== */}
        <header
          className="
            sticky
            top-0
            z-40
            bg-white/85
            backdrop-blur-xl
            border-b
            border-[#E2E8F0]/80
            transition-all
            duration-300
          "
        >
          <div
            className="
              max-w-[1600px]
              mx-auto
              px-4
              sm:px-6
              lg:px-8
              py-4
            "
          >
            <MediaLibraryHeader
              searchValue={
                gallerySearchInput
              }
              onSearchChange={
                setGallerySearchInput
              }
              onSearchSubmit={
                handleMainSearchSubmit
              }
              activeFilter={
                initialFilters.type
              }
              onFilterChange={
                handleMainTypeFilter
              }
              filters={TYPE_FILTERS}
              activeSort={
                initialFilters.sortBy
              }
              onSortChange={
                handleMainSortChange
              }
              sorts={SORT_OPTIONS}
              totalItems={
                mainPagination.total
              }
              actions={
                <BulkActionsMenu
                  selectedCount={selectedMediaIds.length}
                  totalCount={localMediaItems.length}
                  onSelectAll={handleSelectAllMedia}
                  onBulkAction={handleBulkRemoveMedia}
                  actionLabel="Retirer"
                  selectedLabel="sélectionnés"
                  onReorder={() => setIsReorderModalOpen(true)}
                />
              }
            />
          </div>
        </header>

        {/* ===================================================
            Main Content
        ==================================================== */}
        <main
          className="
            flex-1
            max-w-[1600px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
            w-full
          "
        >
                <CardGrid<MediaItem>
                  items={localMediaItems}
                  renderItem={(
                    item,
                    index
                  ) => (
                    <MediaCard
                      media={item.media}
                      onRemove={handleRemoveMedia}
                      onPreview={() => setLightboxIndex(index)}
                      isSelected={selectedMediaIds.includes(item.mediaId)}
                      onSelect={handleToggleMediaSelect}
                    />
                  )}
                  getKey={(
                    item: MediaItem
                  ) => item.id}
                  emptyState={
                    <div
                      className="
                        flex
                        flex-col
                        items-center
                        justify-center
                        py-24
                        text-center
                        bg-white
                        rounded-3xl
                        border
                        border-[#E2E8F0]
                        shadow-[0_4px_16px_rgba(0,52,95,0.05)]
                      "
                    >
                      <div
                        className="
                          w-20
                          h-20
                          bg-[#EAF4FB]
                          rounded-2xl
                          flex
                          items-center
                          justify-center
                          mb-6
                          border
                          border-[#E2E8F0]
                        "
                      >
                        <FolderOpen
                          className="
                            w-8
                            h-8
                            text-[#004A87]
                          "
                        />
                      </div>

                      <h3
                        className="
                          text-xl
                          font-bold
                          text-[#172033]
                          tracking-tight
                        "
                      >
                        {mainPagination.total ===
                        0
                          ? "L'album CE est vide"
                          : 'Aucun résultat trouvé'}
                      </h3>
                      <p
                        className="
                          text-[#64748B]
                          text-sm
                          mt-2
                          max-w-xs
                          font-medium
                        "
                      >
                        {mainPagination.total ===
                        0
                          ? 'Commencez la gestion en ajoutant votre premier média.'
                          : "Essayez d'ajuster vos critères de recherche."}
                      </p>
                      {mainPagination.total ===
                        0 && (
                        <CustomButton
                          variant="primary"
                          size="lg"
                          onClick={() =>
                            setIsAddModalOpen(
                              true
                            )
                          }
                          className="mt-8"
                          leftIcon={
                            <FolderOpen className="w-4 h-4" />
                          }
                        >
                          Ajouter un média
                        </CustomButton>
                      )}
                    </div>
                  }
                  className="
                    w-full
                    min-h-100
                    grid-cols-2
                    sm:grid-cols-3
                    md:grid-cols-4
                    lg:grid-cols-5
                    xl:grid-cols-6
                    gap-4
                    sm:gap-6
                  "
                  ariaLabel="Médias de l'album"
                />
                <InfiniteScroll
                  hasMore={mainHasMore}
                  isLoading={isLoadingMain}
                  onLoadMore={loadMoreMain}
                  className="mt-12 h-16"
                />
        </main>

        {/* ===================================================
            Floating Action Button
        ==================================================== */}
        <FloatingActionButton
          onClick={() =>
            setIsAddModalOpen(true)
          }
          label="Ajouter des médias"
        />

        {/* ===================================================
            Add Media Modal
        ==================================================== */}
        <AddMediaModal
          isOpen={isAddModalOpen}
          onClose={
            handleCloseModal
          }
          galleryId={gallery.id}
          availableMedia={localAvailableMedia}
          modalPagination={
            modalPagination
          }
          initialFilters={{
            search:
              initialFilters.search,

            type:
              initialFilters.type,

            sortBy:
              initialFilters.sortBy ===
              'position'
                ? 'newest'
                : initialFilters.sortBy,
          }}
          onSearchChange={
            setModalSearchInput
          }
          onSearchSubmit={
            handleModalSearchSubmit
          }
          onFilterChange={
            handleModalTypeFilter
          }
          onSortChange={
            handleModalSortChange
          }
          onLoadMore={loadMoreModal}
          isLoadingMore={isLoadingModal}
          onAddMedia={
            handleAddMediaToGallery
          }
          onPreview={(media) => {
            const previewIndex = localAvailableMedia.findIndex((item) => item.id === media.id);
            if (previewIndex >= 0) setAvailableLightboxIndex(previewIndex);
          }}
        />

        <ReorderMediaModal
          isOpen={isReorderModalOpen}
          onClose={() => setIsReorderModalOpen(false)}
          galleryId={gallery.id}
          initialItems={localMediaItems}
          onSave={handleSaveReorder}
        />

        <GalleryLightbox
          key={lightboxIndex}
          index={lightboxIndex}
          slides={lightboxSlides}
          onClose={() => setLightboxIndex(-1)}
          onDelete={async (slide) => {
            const mediaId = (slide as LightboxMediaItem & { mediaId?: string }).mediaId;
            if (!mediaId) return false;
            const openedIndex = lightboxIndex;
            setLightboxIndex(-1);
            const removed = await handleRemoveMedia(mediaId);
            if (removed && localMediaItems.length > 1) {
              setLightboxIndex(Math.min(openedIndex, localMediaItems.length - 2));
            } else if (!removed) {
              setLightboxIndex(openedIndex);
            }
            return removed;
          }}
        />

        <GalleryLightbox
          key={`available-${availableLightboxIndex}`}
          index={availableLightboxIndex}
          slides={availableLightboxSlides}
          onClose={() => setAvailableLightboxIndex(-1)}
        />
      </div>
    </div>
  );
}


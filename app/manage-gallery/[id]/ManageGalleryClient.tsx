'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Swal, { SweetAlertOptions } from 'sweetalert2';

import MediaCard from './components/MediaCard';
import AddMediaModal from './components/AddMediaModal';
import MediaLibraryHeader, {
  FilterOption,
  SortOption,
} from '@/components/SearchSortFilter';
import InfiniteScroll from '@/components/InfiniteScroll';
import FloatingActionButton from '@/components/FloatingActionButton';
import CardGrid from '@/components/displayGrid';
import { CustomButton } from '@/components/ui/CustomButton';

import {
  FolderOpen,
  GripVertical,
} from 'lucide-react';

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
// Sortable Wrapper Component
// ============================================================

function SortableMediaCard({
  item,
  index,
  onRemove,
  onManualOrder,
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
  } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(
      transform
    ),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative
        group
        ${isDragging
          ? 'cursor-grabbing'
          : 'cursor-grab'}
      `}
    >
      {/* Visual Drag Handle Indicator */}
      <div
        {...attributes}
        {...listeners}
        className="
          absolute
          top-3
          left-3
          z-20
          p-1.5
          rounded-lg
          bg-[#00345F]/75
          backdrop-blur-md
          text-white
          opacity-0
          group-hover:opacity-100
          transition-all
          duration-200
          hover:bg-[#004A87]/90
          cursor-grab
          active:cursor-grabbing
          touch-none
          shadow-md
        "
        aria-label="Glisser pour réordonner"
      >
        <GripVertical className="w-4 h-4" />
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
      newItems: MediaItem[],
      previousItems: MediaItem[]
    ) => {
      setLocalMediaItems(newItems);

      const orderedMediaIds =
        newItems.map(
          (item) => item.mediaId
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

        setLocalMediaItems(
          previousItems
        );
      }
    },
    [gallery.id]
  );

  // ==========================================================
  // DnD Sensors Configuration
  // ==========================================================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),

    useSensor(KeyboardSensor, {
      coordinateGetter:
        sortableKeyboardCoordinates,
    })
  );

  // ==========================================================
  // DnD Handlers
  // ==========================================================

  const handleDragEnd = async (
    event: DragEndEvent
  ) => {
    const { active, over } = event;

    if (
      !over ||
      active.id === over.id
    ) {
      return;
    }

    const oldIndex =
      localMediaItems.findIndex(
        (item) =>
          item.id === active.id
      );

    const newIndex =
      localMediaItems.findIndex(
        (item) =>
          item.id === over.id
      );

    if (
      oldIndex === -1 ||
      newIndex === -1
    ) {
      return;
    }

    const newItems = arrayMove(
      localMediaItems,
      oldIndex,
      newIndex
    );

    await applyNewOrder(
      newItems,
      localMediaItems
    );
  };

  // ==========================================================
  // Manual Order Handler
  // ==========================================================

  const handleManualOrder = useCallback(
    async (mediaId: string) => {
      const currentIndex =
        localMediaItems.findIndex(
          (item) =>
            item.id === mediaId
        );

      if (currentIndex === -1) {
        return;
      }

      const swalOptions: SweetAlertOptions =
        {
          title: 'Définir la position',
          text: `Saisissez une position entre 1 et ${localMediaItems.length}`,
          icon: 'question',

          input: 'number',

          inputAttributes: {
            min: '1',
            max: String(
              localMediaItems.length
            ),
            step: '1',
          },

          inputValue: String(
            currentIndex + 1
          ),

          showCancelButton: true,

          confirmButtonText:
            'Mettre à jour',

          cancelButtonText:
            'Annuler',

          confirmButtonColor:
            '#004A87',

          cancelButtonColor:
            '#EAF4FB',

          background: 'var(--page-background)',
          color: 'var(--page-foreground)',

          customClass: {
            popup:
              'rounded-2xl shadow-2xl border border-[#E2E8F0]',

            title:
              'font-semibold text-[#172033] dark:text-white',

            input:
              'border-[#E2E8F0] dark:border-white/10 bg-white dark:bg-[#0E1C2D] text-[#172033] dark:text-white rounded-xl focus:border-[#004A87] focus:ring-[#FF8201]',

            confirmButton:
              'px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:bg-[#00345F] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201]',

            cancelButton:
              'px-5 py-2.5 rounded-xl text-sm font-medium text-[#00345F] dark:text-white hover:bg-[#EAF4FB] dark:hover:bg-white/[0.06] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201]',
          },
        };

      const result =
        await Swal.fire(
          swalOptions
        );

      if (
        !result.isConfirmed ||
        !result.value
      ) {
        return;
      }

      const targetPosition =
        parseInt(
          result.value as string,
          10
        );

      if (
        isNaN(targetPosition) ||
        targetPosition < 1 ||
        targetPosition >
          localMediaItems.length
      ) {
        Swal.fire({
          title: 'Position invalide',
          text: `Veuillez saisir un nombre entre 1 et ${localMediaItems.length}.`,
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
              'px-5 py-2.5 rounded-xl text-sm font-semibold',
          },
        });

        return;
      }

      const targetIndex =
        targetPosition - 1;

      if (
        targetIndex === currentIndex
      ) {
        return;
      }

      const newItems = [
        ...localMediaItems,
      ];

      const [movedItem] =
        newItems.splice(
          currentIndex,
          1
        );

      newItems.splice(
        targetIndex,
        0,
        movedItem
      );

      await applyNewOrder(
        newItems,
        localMediaItems
      );

      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title:
            'Position mise à jour',
          text: `Déplacé à la position ${targetPosition}`,
          timer: 1500,
          showConfirmButton: false,
          background: 'var(--page-background)',
          color: 'var(--page-foreground)',
          customClass: {
            popup:
              'rounded-2xl shadow-2xl border border-[#E2E8F0]',
          },
        });
      }
    },
    [
      localMediaItems,
      applyNewOrder,
    ]
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

  const handleMainPageChange =
    useCallback(
      (page: number) => {
        updateMainFilters({
          page,
        });

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
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

  const handleModalPageChange =
    useCallback(
      (page: number) => {
        updateModalFilters({
          page,
        });
      },
      [updateModalFilters]
    );

  // ==========================================================
  // Remove Media
  // ==========================================================

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
          return;
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

          router.refresh();
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
      [gallery.id, router]
    );

  // ==========================================================
  // Close Add Modal
  // ==========================================================

  const handleCloseModal =
    useCallback(() => {
      setIsAddModalOpen(false);
      router.refresh();
    }, [router]);

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
              currentPage={
                mainPagination.currentPage
              }
              totalPages={
                mainPagination.totalPages
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
          <DndContext
            sensors={sensors}
            collisionDetection={
              closestCenter
            }
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localMediaItems.map(
                (item) => item.id
              )}
              strategy={
                rectSortingStrategy
              }
            >
              <CardGrid<MediaItem>
                items={localMediaItems}
                renderItem={(
                  item,
                  index
                ) => (
                  <SortableMediaCard
                    item={item}
                    index={index}
                    onRemove={
                      handleRemoveMedia
                    }
                    onManualOrder={
                      handleManualOrder
                    }
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
            </SortableContext>
          </DndContext>

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
          label="Ajouter un média"
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
          onAddMedia={
            handleAddMediaToGallery
          }
        />
      </div>
    </div>
  );
}


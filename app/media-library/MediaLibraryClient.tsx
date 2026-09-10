'use client';

import dynamic from 'next/dynamic';
import { useState, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Swal from 'sweetalert2';

import MediaCard, { MediaSchema } from '@/app/media-library/components/MediaCard';
import EditMediaModal from '@/app/media-library/components/EditMediaModal';
const UploadModal = dynamic(
  () => import('@/app/media-library/components/UploadModal'),
  { ssr: false, loading: () => null }
);
import MediaLibraryHeader, {
  FilterOption,
  SortOption,
} from '@/components/SearchSortFilter';
import InfiniteScroll from '@/components/InfiniteScroll';
import FloatingActionButton from '@/components/FloatingActionButton';
import type { MediaItem } from '@/components/GalleryLightbox';
import CardGrid from '@/components/displayGrid';
import { MEDIA_TYPES } from '@/db/schema';
import { HiPhoto } from 'react-icons/hi2';

const GalleryLightbox = dynamic(
  () => import('@/components/GalleryLightbox'),
  { ssr: false, loading: () => null }
);

interface MediaLibraryClientProps {
  initialMedia: MediaSchema[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    limit: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  filters: {
    search: string;
    type?: typeof MEDIA_TYPES[number];
    sortBy?: 'newest' | 'oldest' | 'name';
  };
}

const FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'Tous les éléments' },
  ...MEDIA_TYPES.map((type) => ({
    value: type,
    label:
      type === 'image'
        ? 'Images'
        : type === 'video'
          ? 'Vidéos'
          : 'GIFs',
  })),
];

const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'oldest', label: 'Plus anciens' },
  { value: 'name', label: 'Nom A-Z' },
];

const MEDIA_CARD_SIZES =
  '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw';

export default function MediaLibraryClient({
  initialMedia,
  pagination,
  filters,
}: MediaLibraryClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(() => filters.search || '');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingMedia, setEditingMedia] = useState<MediaSchema | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [media, setMedia] = useState(initialMedia);
  const [nextPage, setNextPage] = useState(pagination.currentPage + 1);
  const [hasMore, setHasMore] = useState(pagination.hasNext);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Transform media array to lightbox slide format
  const slides = useMemo(
    (): MediaItem[] =>
      media.map((item) => {
        const isVideo = item.type === 'video';

        return {
          type: isVideo ? 'video' : 'image',
          mediaId: item.id,
          src: !isVideo ? item.fullResUrl : undefined,
          sources: isVideo
            ? [
                {
                  src: item.fullResUrl,
                  type: 'video/mp4' as const,
                },
              ]
            : undefined,
          poster: isVideo ? item.thumbnailUrl : undefined,
          width: item.width || 800,
          height: item.height || 600,
          alt: item.originalFilename || 'Media asset',
          title: item.originalFilename || undefined,
          description: item.caption || undefined,
        } as MediaItem;
      }),
    [media]
  );

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        search: filters.search,
        sortBy: filters.sortBy || 'newest',
      });
      if (filters.type) params.set('type', filters.type);
      const response = await fetch(`/api/media?${params}`);
      if (!response.ok) throw new Error('Failed to load more media');
      const data = await response.json();
      setMedia((current) => [...current, ...data.items]);
      setHasMore(data.pagination?.hasNext ?? false);
      setNextPage((page) => page + 1);
    } catch (error) {
      console.error('Failed to load more media:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters.search, filters.sortBy, filters.type, hasMore, isLoadingMore, nextPage]);

  const updateSearchParams = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(searchParams.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      if (
        params.search !== undefined ||
        params.type !== undefined ||
        params.sortBy !== undefined
      ) {
        newParams.set('page', '1');
      }

      router.push(`${pathname}?${newParams.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateSearchParams({
      search: searchInput.trim() || undefined,
    });
  }, [searchInput, updateSearchParams]);

  const handleTypeFilter = useCallback(
    (type: string) => {
      updateSearchParams({
        type:
          type === 'all'
            ? undefined
            : (type as typeof MEDIA_TYPES[number]),
      });
    },
    [updateSearchParams]
  );

  const handleSort = useCallback(
    (sortBy: string) => {
      updateSearchParams({ sortBy });
    },
    [updateSearchParams]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      const result = await Swal.fire({
        title: 'Supprimer cet élément ?',
        text: 'Cette action supprimera définitivement cet élément de votre bibliothèque.',
        icon: 'warning',
        showCancelButton: true,

        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#64748B',

        confirmButtonText: 'Supprimer',
        cancelButtonText: 'Annuler',

        background: 'var(--page-background)',
        color: 'var(--page-foreground)',

        customClass: {
          popup:
            'rounded-2xl shadow-xl border border-[#E2E8F0]',
          title:
            'font-semibold text-[#172033] dark:text-white text-lg',
          htmlContainer:
            'text-[#64748B] dark:text-white/60 font-medium',

          confirmButton:
            'font-semibold px-4 py-2.5 rounded-xl transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500',

          cancelButton:
            'font-semibold px-4 py-2.5 rounded-xl transition-colors hover:bg-[#EAF4FB] dark:hover:bg-white/[0.06] text-[#00345F] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF8201]',
        },
      });

      if (!result.isConfirmed) return false;

      setIsDeleting(id);

      try {
        const res = await fetch(`/api/media?id=${id}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('Échec de la suppression de l’élément');
        }

        await Swal.fire({
          icon: 'success',
          title: 'Supprimé',
          text: 'L’élément a été supprimé.',
          timer: 1500,
          showConfirmButton: false,

          background: 'var(--page-background)',
          color: 'var(--page-foreground)',

          customClass: {
            popup:
              'rounded-2xl shadow-xl border border-[#E2E8F0]',
            title:
              'font-semibold text-[#172033] dark:text-white',
          },
        });

        setMedia((current) => current.filter((item) => item.id !== id));
        router.refresh();
        return true;
      } catch (error) {
        console.error('Failed to delete media:', error);

        await Swal.fire({
          icon: 'error',
          title: 'Échec de la suppression',
          text: 'Une erreur est survenue lors de la suppression de l’élément. Veuillez réessayer.',

          background: 'var(--page-background)',
          color: 'var(--page-foreground)',

          customClass: {
            popup:
              'rounded-2xl shadow-xl border border-[#E2E8F0]',
            title:
              'font-semibold text-[#172033]',
          },
        });
        return false;
      } finally {
        setIsDeleting(null);
      }
    },
    [router]
  );

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    setSelectedIds((current) =>
      current.size === media.length
        ? new Set()
        : new Set(media.map((item) => item.id))
    );
  }, [media]);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    const result = await Swal.fire({
      title: `Supprimer ${ids.length} éléments ?`,
      text: 'Cette action supprimera définitivement les éléments sélectionnés de votre bibliothèque.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      background: 'var(--page-background)',
      color: 'var(--page-foreground)',
    });

    if (!result.isConfirmed) return;

    setIsDeleting('bulk');
    try {
      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) throw new Error('Échec de la suppression des éléments');

      setMedia((current) => current.filter((item) => !selectedIds.has(item.id)));
      setSelectedIds(new Set());
      router.refresh();
      await Swal.fire({
        icon: 'success',
        title: 'Supprimés',
        text: `${ids.length} éléments ont été supprimés.`,
        timer: 1500,
        showConfirmButton: false,
        background: 'var(--page-background)',
        color: 'var(--page-foreground)',
      });
    } catch (error) {
      console.error('Failed to delete media:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Échec de la suppression',
        text: 'Une erreur est survenue lors de la suppression des éléments. Veuillez réessayer.',
        background: 'var(--page-background)',
        color: 'var(--page-foreground)',
      });
    } finally {
      setIsDeleting(null);
    }
  }, [router, selectedIds]);

  const handleResetFilters = useCallback(() => {
    setSearchInput('');

    updateSearchParams({
      search: undefined,
      type: undefined,
      sortBy: undefined,
    });
  }, [updateSearchParams]);

  const handleCloseUpload = useCallback(() => {
    setIsUploadOpen(false);
  }, []);

  const handleOpenLightbox = useCallback(
    (index: number) => {
      if (index >= 0 && index < media.length) {
        setLightboxIndex(index);
      }
    },
    [media.length]
  );

  const handleCloseLightbox = useCallback(
    () => setLightboxIndex(-1),
    []
  );

  const handleMediaSaved = useCallback((updatedMedia: Pick<MediaSchema, 'id' | 'caption' | 'locationName'>) => {
    setMedia((current) =>
      current.map((item) =>
        item.id === updatedMedia.id ? { ...item, ...updatedMedia } : item
      )
    );
  }, []);

  const currentFilter = filters.type || 'all';
  const currentSort = filters.sortBy || 'newest';

  const mediaEmptyState = (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center bg-white dark:bg-[#102238] rounded-3xl border border-[#E2E8F0] dark:border-white/10 shadow-sm">
      <div className="w-20 h-20 bg-[#EAF4FB] rounded-2xl flex items-center justify-center mb-6 border border-[#D8EAF6]">
        <HiPhoto className="w-8 h-8 text-[#004A87]" />
      </div>

      <h3 className="text-xl font-bold text-[#172033] dark:text-white tracking-tight">
        Aucun élément trouvé
      </h3>

      <p className="text-[#64748B] dark:text-white/60 text-sm mt-2 max-w-xs font-medium">
        Aucun élément ne correspond à vos filtres actuels. Essayez d’ajuster votre recherche ou d’ajouter de nouveaux médias.
      </p>

      <button
        type="button"
        onClick={handleResetFilters}
        className="
          mt-8
          px-6
          py-3
          bg-[#004A87]
          text-white
          text-sm
          font-bold
          uppercase
          tracking-widest
          rounded-xl
          hover:bg-[#00345F]
          transition-all
          duration-300
          active:scale-95
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#FF8201]
          focus-visible:ring-offset-2
        "
      >
        Effacer les filtres
      </button>
    </div>
  );

  return (
    <div
      className="
        min-h-screen
        bg-[#F5F7FA] dark:bg-[#091522]
        text-[#172033] dark:text-white
        font-sans
        selection:bg-[#FF8201]/30
        selection:text-[#00345F]
        relative
      "
    >
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Sticky Header */}
        <header className="sticky top-0 z-40">
          <MediaLibraryHeader
            searchValue={searchInput}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearch}
            activeFilter={currentFilter}
            onFilterChange={handleTypeFilter}
            filters={FILTER_OPTIONS}
            activeSort={currentSort}
            onSortChange={handleSort}
            sorts={SORT_OPTIONS}
            totalItems={pagination.totalItems}
          />
        </header>

        <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px]">
          <div
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            Affichage de {initialMedia.length} sur {pagination.totalItems} éléments.
          </div>

          {media.length > 0 && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm dark:border-white/10 dark:bg-[#102238]">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-sm font-semibold text-[#004A87] hover:text-[#FF8201]"
              >
                {selectedIds.size === media.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={isDeleting === 'bulk'}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting === 'bulk' ? 'Suppression...' : `Supprimer ${selectedIds.size}`}
                </button>
              )}
            </div>
          )}

          <CardGrid
            items={media}
            ariaLabel="Éléments de la médiathèque"
            emptyState={mediaEmptyState}
            renderItem={(item, index) => (
              <MediaCard
                key={item.id}
                media={item}
                onDelete={handleDelete}
                onEdit={() => setEditingMedia(item)}
                onOpenLightbox={() =>
                  handleOpenLightbox(index)
                }
                onSelect={toggleSelection}
                isSelected={selectedIds.has(item.id)}
                isDeleting={isDeleting === item.id}
                priority={index < 4}
                sizes={MEDIA_CARD_SIZES}
              />
            )}
          />

          {media.length > 0 && (
            <InfiniteScroll
              hasMore={hasMore}
              isLoading={isLoadingMore}
              onLoadMore={loadMore}
            />
          )}
        </main>

        <FloatingActionButton
          onClick={() => setIsUploadOpen(true)}
          label="Téléverser un média"
        />

        <UploadModal
          isOpen={isUploadOpen}
          onClose={handleCloseUpload}
        />

        <EditMediaModal
          media={editingMedia}
          onClose={() => setEditingMedia(null)}
          onSaved={handleMediaSaved}
        />
      </div>

      <GalleryLightbox
        key={lightboxIndex}
        index={lightboxIndex}
        slides={slides}
        onClose={handleCloseLightbox}
        onDelete={async (slide) => {
          const mediaId = (slide as MediaItem & { mediaId?: string }).mediaId;
          if (!mediaId) return false;
          const openedIndex = lightboxIndex;
          setLightboxIndex(-1);
          const deleted = await handleDelete(mediaId);
          if (deleted && media.length > 1) {
            setLightboxIndex(Math.min(openedIndex, media.length - 2));
          } else if (!deleted) {
            setLightboxIndex(openedIndex);
          }
          return deleted;
        }}
      />
    </div>
  );
}


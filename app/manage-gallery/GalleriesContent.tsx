'use client';

import { useState, useCallback } from 'react';
import {
  useRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation';

import GalleryGrid from './components/GalleryGrid';
import CreateGalleryModal from '@/app/manage-gallery/components/CreateGalleryModal';
import MediaLibraryHeader, {
  FilterOption,
  SortOption,
} from '@/components/SearchSortFilter';
import InfiniteScroll from '@/components/InfiniteScroll';
import FloatingActionButton from '@/components/FloatingActionButton';

import { VISIBILITY_STATUSES } from '@/db/schema';
import { GallerySummary } from '@/types/types';
import { Images } from 'lucide-react';

interface GalleriesContentProps {
  initialGalleries: GallerySummary[];

  pagination: {
    total: number;
    currentPage?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    limit?: number;
  };

  filters: {
    search: string;
    sortBy?: 'newest' | 'oldest' | 'name';
    visibility?: typeof VISIBILITY_STATUSES[number];
  };
}

const VISIBILITY_FILTERS: FilterOption[] = [
  {
    value: 'all',
    label: 'Toutes les galeries',
  },

  ...VISIBILITY_STATUSES.map((status) => ({
    value: status,
    label:
      status === 'public'
        ? 'Public'
        : status === 'private'
        ? 'Privé'
        : status === 'password_protected'
        ? 'Protégé'
        : status === 'unlisted'
        ? 'Non listé'
        : status,
  })),
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

export default function GalleriesContent({
  initialGalleries,
  pagination,
  filters,
}: GalleriesContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] =
    useState<GallerySummary | null>(null);
  const [searchInput, setSearchInput] =
    useState(filters.search);
  const [galleries, setGalleries] = useState(initialGalleries);
  const [nextPage, setNextPage] = useState((pagination.currentPage || 1) + 1);
  const [hasMore, setHasMore] = useState(pagination.hasNext ?? false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        search: filters.search,
        sortBy: filters.sortBy || 'newest',
        visibility: filters.visibility || '',
      });
      const response = await fetch(`/api/galleries?${params}`);
      if (!response.ok) throw new Error('Failed to load more galleries');
      const data = await response.json();
      setGalleries((current) => [...current, ...data.items]);
      setHasMore(data.pagination?.hasNext ?? false);
      setNextPage((page) => page + 1);
    } catch (error) {
      console.error('Failed to load more galleries:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [filters.search, filters.sortBy, filters.visibility, hasMore, isLoadingMore, nextPage]);

  const updateSearchParams = useCallback(
    (params: Record<string, string | undefined>) => {
      const newParams = new URLSearchParams(
        searchParams.toString()
      );

      Object.entries(params).forEach(
        ([key, value]) => {
          if (value === undefined || value === '') {
            newParams.delete(key);
          } else {
            newParams.set(key, value);
          }
        }
      );

      // Reset to page 1 when filters change
      if (
        params.search !== undefined ||
        params.sortBy !== undefined ||
        params.visibility !== undefined
      ) {
        newParams.set('page', '1');
      }

      router.push(
        `${pathname}?${newParams.toString()}`,
        { scroll: false }
      );
    },
    [router, pathname, searchParams]
  );

  const handleSearch = useCallback(() => {
    updateSearchParams({
      search: searchInput || undefined,
    });
  }, [searchInput, updateSearchParams]);

  const handleSort = useCallback(
    (sortBy: string) => {
      updateSearchParams({ sortBy });
    },
    [updateSearchParams]
  );

  const handleVisibilityFilter = useCallback(
    (visibility: string) => {
      updateSearchParams({
        visibility:
          visibility === 'all'
            ? undefined
            : (visibility as typeof VISIBILITY_STATUSES[number]),
      });
    },
    [updateSearchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      updateSearchParams({
        page: newPage.toString(),
      });

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    },
    [updateSearchParams]
  );

  const handleResetFilters = useCallback(() => {
    setSearchInput('');

    updateSearchParams({
      search: undefined,
      sortBy: undefined,
      visibility: undefined,
    });
  }, [updateSearchParams]);

  const handleOpenCreateModal = useCallback(() => {
    setEditingGallery(null);
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback(
    (gallery: GallerySummary) => {
      setEditingGallery(gallery);
      setIsModalOpen(true);
    },
    []
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingGallery(null);
    router.refresh();
  }, [router]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(
          `/api/galleries/${id}`,
          {
            method: 'DELETE',
          }
        );

        if (!response.ok) {
          throw new Error(
            'Échec de la suppression de la galerie'
          );
        }

        router.refresh();
      } catch (error) {
        console.error(
          'Erreur lors de la suppression de la galerie:',
          error
        );
      }
    },
    [router]
  );

  const currentVisibility =
    filters.visibility || 'all';

  const currentSort =
    filters.sortBy || 'newest';

  const displayPage =
    pagination.currentPage || 1;

  const displayTotalPages =
    pagination.totalPages || 1;

  const hasNext =
    pagination.hasNext ??
    (displayPage < displayTotalPages);

  const hasPrevious =
    pagination.hasPrevious ??
    (displayPage > 1);

  return (
    <div
      className="
        min-h-screen
        bg-[#F5F7FA]
        text-[#172033]
        dark:bg-[#091522]
        dark:text-white
        font-sans
        selection:bg-[#FF8201]/30
        selection:text-[#00345F]
        relative
      "
    >
      <div className="relative z-10 flex flex-col min-h-screen">

        {/* =====================================================
            Glassmorphic Header
        ====================================================== */}
        <header
          className="
            sticky
            top-0
            z-40
            bg-white/80
            backdrop-blur-2xl
            border-b
            border-[#E2E8F0]/80
            transition-all
            duration-300
            supports-[backdrop-filter]:bg-white/70
            dark:bg-[#0B1624]/80
            dark:border-white/10
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
              md:py-5
            "
          >
            <MediaLibraryHeader
              searchValue={searchInput}
              onSearchChange={setSearchInput}
              onSearchSubmit={handleSearch}
              activeFilter={currentVisibility}
              onFilterChange={handleVisibilityFilter}
              filters={VISIBILITY_FILTERS}
              activeSort={currentSort}
              onSortChange={handleSort}
              sorts={SORT_OPTIONS}
              totalItems={pagination.total}
              currentPage={displayPage}
              totalPages={displayTotalPages}
            />
          </div>
        </header>

        {/* =====================================================
            Main Content Area
        ====================================================== */}
        <main
          className="
            flex-1
            w-full
            max-w-[1600px]
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-8
            md:py-12
          "
        >

          {/* Live Region for Screen Readers */}
          <div
            className="sr-only"
            aria-live="polite"
            aria-atomic="true"
          >
            Affichage de {initialGalleries.length} sur{' '}
            {pagination.total} galeries.
          </div>

          {initialGalleries.length === 0 ? (

            /* =================================================
               Filtered Empty State
            ================================================== */
            <div
              className="
                flex
                flex-col
                items-center
                justify-center
                py-24
                md:py-40
                text-center
                w-full
                animate-in
                fade-in
                zoom-in-95
                duration-500
              "
            >
              {/* Empty State Icon */}
              <div
                className="
                  w-24
                  h-24
                  md:w-32
                  md:h-32
                  bg-white
                  rounded-[2rem]
                  flex
                  items-center
                  justify-center
                  mb-8
                  ring-1
                  ring-[#E2E8F0]
                  shadow-[0_4px_16px_rgba(0,52,95,0.06)]
                "
              >
                <Images
                  className="
                    w-10
                    h-10
                    md:w-12
                    md:h-12
                    text-[#004A87]
                  "
                />
              </div>

              {/* Title */}
              <h3
                className="
                  text-2xl
                  md:text-3xl
                  font-light
                  text-[#172033]
                  tracking-tight
                "
              >
                Aucun résultat trouvé
              </h3>

              {/* Description */}
              <p
                className="
                  text-[#64748B]
                  text-base
                  md:text-lg
                  mt-4
                  max-w-md
                  mx-auto
                  font-light
                  leading-relaxed
                "
              >
                Aucun album ne correspond à vos critères
                de recherche actuels. Essayez de modifier
                vos filtres ou de les réinitialiser.
              </p>

              {/* Reset Button */}
              <button
                onClick={handleResetFilters}
                className="
                  mt-8
                  px-8
                  py-3.5
                  bg-[#004A87]
                  text-white
                  text-base
                  font-medium
                  rounded-2xl
                  hover:bg-[#00345F]
                  transition-all
                  duration-300
                  active:scale-[0.98]
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                  focus-visible:ring-offset-2
                  shadow-sm
                  hover:shadow-md
                "
              >
                Réinitialiser les filtres
              </button>
            </div>

          ) : (

            /* =================================================
               Gallery Results
            ================================================== */
            <div
              className="
                space-y-10
                md:space-y-12
                animate-in
                fade-in
                slide-in-from-bottom-4
                duration-500
              "
            >
              <GalleryGrid
                galleries={galleries}
                onEdit={handleOpenEditModal}
                onDelete={handleDelete}
              />

              <InfiniteScroll
                hasMore={hasMore}
                isLoading={isLoadingMore}
                onLoadMore={loadMore}
                className="h-24"
              />
            </div>
          )}
        </main>

        {/* =====================================================
            Floating Action Button
        ====================================================== */}
        <div
          className="
            fixed
            bottom-6
            right-6
            md:bottom-10
            md:right-10
            z-50
          "
        >
          <FloatingActionButton
            onClick={handleOpenCreateModal}
            label="Nouvel album"
            aria-label="Créer un nouvel album photo CE"
          />
        </div>

        {/* =====================================================
            Create / Edit Gallery Modal
        ====================================================== */}
        {isModalOpen && (
          <CreateGalleryModal
            key={editingGallery?.id ?? 'new-gallery'}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            initialData={editingGallery}
          />
        )}
      </div>
    </div>
  );
}


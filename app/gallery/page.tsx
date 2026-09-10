import { galleryHelpers } from '@/lib/db-helpers';
import GalleryClient from './GalleryClient';
import { GallerySummary } from '@/types/types'; 
import { Suspense } from 'react';
import Skeleton from '@/components/Skeleton';

export const revalidate = 300;

interface SearchParams {
  search?: string;
  sort?: 'newest' | 'oldest' | 'name';
  filter?: 'all' | 'public' | 'password_protected';
  page?: string;
}

type FindPublicResult = {
  items: GallerySummary[];
  total: number;
  hasMore: boolean;
};

function GalleryPageLoading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#091522] px-6 lg:px-12 py-12">
      {/* Skeleton d'en-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="h-10 w-64 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Skeleton de la grille */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {[...Array(12)].map((_, i) => (
          <Skeleton key={i} variant="grid-card" />
        ))}
      </div>
    </div>
  );
}

async function GalleryContent({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const limit = 12; // Nombre d'éléments par page
  const offset = (currentPage - 1) * limit;
  
  let result: FindPublicResult = { items: [], total: 0, hasMore: false };
  
  try {
    const res = await galleryHelpers.findPublic({
      limit,
      offset,
      search: params.search,
       sortBy: params.sort === 'name' ? 'title' : params.sort || 'newest',
      filter: params.filter || 'all'
    });
    
    result = res as FindPublicResult; 
  } catch (err) {
    console.error('Erreur lors de la récupération des galeries CE:', err);
  }

  const totalPages = Math.ceil(result.total / limit);

  return (
    <GalleryClient 
      key={`${params.search || ''}-${params.sort || 'newest'}-${params.filter || 'all'}-${currentPage}`}
      initialGalleries={result.items} 
      totalGalleries={result.total}
      currentPage={currentPage}
      totalPages={totalPages}
      hasNext={result.hasMore}
      hasPrevious={currentPage > 1}
      initialParams={{
        search: params.search || '',
        sort: params.sort || 'newest',
        filter: params.filter || 'all'
      }}
    />
  );
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return (
    <Suspense fallback={<GalleryPageLoading />}>
      <GalleryContent searchParams={searchParams} />
    </Suspense>
  );
}
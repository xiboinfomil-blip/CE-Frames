import { galleryHelpers } from '@/lib/db-helpers';
import GalleryClient from './GalleryClient';

export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  sort?: 'newest' | 'oldest' | 'title';
  filter?: 'all' | 'public' | 'password_protected';
  page?: string;
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const limit = 12; // Items per page
  const offset = (currentPage - 1) * limit;
  
  let result = { items: [], total: 0, hasMore: false };
  
  try {
    result = await galleryHelpers.findPublic({
      limit,
      offset,
      search: params.search,
      sortBy: params.sort || 'newest',
      visibility: params.filter as any || 'all'
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
  }

  const totalPages = Math.ceil(result.total / limit);

  return (
    <GalleryClient 
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
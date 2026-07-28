import { galleryHelpers } from '@/lib/db-helpers';
import GalleryClient from './GalleryClient';
import { Gallery } from '@/types/gallery';

export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  sort?: 'newest' | 'oldest' | 'title';
  filter?: 'all' | 'public' | 'password_protected';
  page?: string;
}

type FindPublicResult = {
  items: Gallery[];
  total: number;
  hasMore: boolean;
};

export default async function GalleryPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  
  const currentPage = Number(params.page) || 1;
  const limit = 12; // Items per page
  const offset = (currentPage - 1) * limit;
  
  let result: FindPublicResult = { items: [], total: 0, hasMore: false };
  
  try {
    const res = await galleryHelpers.findPublic({
      limit,
      offset,
      search: params.search,
      sortBy: params.sort || 'newest',
      filter: params.filter || 'all' // ✅ Fixed: changed 'visibility' to 'filter' and removed 'as any'
    });
    
    // Cast to our expected shape (EnrichedGallery usually extends Gallery)
    result = res as unknown as FindPublicResult;
  } catch (err) {
    console.error('Error fetching galleries:', err);
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
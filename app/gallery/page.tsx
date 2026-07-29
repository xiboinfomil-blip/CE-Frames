import { galleryHelpers } from '@/lib/db-helpers';
import GalleryClient from './GalleryClient';
// ✅ Updated Import: Using GallerySummary instead of the old Gallery type
import { GallerySummary } from '@/types/types'; 

export const dynamic = 'force-dynamic';

interface SearchParams {
  search?: string;
  sort?: 'newest' | 'oldest' | 'title';
  filter?: 'all' | 'public' | 'password_protected';
  page?: string;
}

// ✅ Updated Result Type to match GallerySummary
type FindPublicResult = {
  items: GallerySummary[];
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
      filter: params.filter || 'all'
    });
    
    // ✅ Safe Assignment: Assuming galleryHelpers returns a shape compatible with GallerySummary
    // If your helper returns Prisma objects directly, you might need a small mapping function here
    // to ensure dates are Date objects and not strings, and nested objects match the interface.
    result = res as FindPublicResult; 
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
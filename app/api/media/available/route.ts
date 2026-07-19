import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { mediaHelpers, galleryMediaHelpers } from '@/lib/db-helpers';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const galleryId = searchParams.get('galleryId');
  const search = searchParams.get('search') || undefined;
  const type = searchParams.get('type') === 'all' ? undefined : (searchParams.get('type') as any);
  const sortBy = (searchParams.get('sortBy') as any) || 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  if (!galleryId) {
    return NextResponse.json({ error: 'Gallery ID required' }, { status: 400 });
  }

  try {
    // 1. Get IDs of media already in this gallery to exclude them
    const existingItems = await galleryMediaHelpers.getGalleryMediaWithDetails(galleryId);
    const existingIds = existingItems.map(item => item.mediaId);

    // 2. Fetch all user media with filters
    // Note: mediaHelpers.findAll doesn't natively support "exclude IDs" yet, 
    // so we fetch a larger batch and filter client-side OR update helper. 
    // For performance, let's assume we fetch standard list and filter here for simplicity 
    // or ideally update db-helpers to accept `excludeIds`.
    
    // For this example, we'll use the existing helper and filter the result 
    // (In production, add `excludeIds` to your Drizzle query for better performance)
    const { items: allMedia, total } = await mediaHelpers.findAll({
      search,
      type,
      sortBy,
      limit: limit + existingIds.length, // Fetch extra to account for exclusions
      offset: 0 // We filter manually then slice for pagination
    });

    // Filter out existing items
    const availableMedia = allMedia.filter(m => !existingIds.includes(m.id));

    // Manual Pagination after filtering
    const paginatedMedia = availableMedia.slice(offset, offset + limit);
    const filteredTotal = availableMedia.length;
    const totalPages = Math.ceil(filteredTotal / limit);

    return NextResponse.json({
      items: paginatedMedia.map(m => ({
        id: m.id,
        thumbnailUrl: m.thumbnailUrl,
        fullResUrl: m.fullResUrl,
        title: m.originalFilename || m.caption || 'Untitled',
        type: m.type,
        uploadedAt: m.uploadedAt
      })),
      pagination: {
        total: filteredTotal,
        currentPage: page,
        totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
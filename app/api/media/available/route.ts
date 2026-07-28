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
  
  // Safely type the filter parameter without using 'any'
  const typeParam = searchParams.get('type');
  const filter = typeParam === 'all' ? undefined : (typeParam as 'image' | 'video' | 'gif' | undefined);
  
  // Safely type the sortBy parameter without using 'any'
  const sortByParam = searchParams.get('sortBy');
  const sortBy = (sortByParam === 'newest' || sortByParam === 'oldest' || sortByParam === 'name') 
    ? sortByParam 
    : 'newest';
    
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

    // 2. Fetch available media, excluding those already in the gallery.
    // mediaHelpers.findAll now natively supports `excludeIds` and `filter`, 
    // handling the exclusion and pagination efficiently at the database level.
    const { items: availableMedia, total: filteredTotal } = await mediaHelpers.findAll({
      search,
      filter,
      sortBy,
      limit,
      offset,
      excludeIds: existingIds.length > 0 ? existingIds : undefined
    });

    const totalPages = Math.ceil(filteredTotal / limit);

    return NextResponse.json({
      items: availableMedia.map(m => ({
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
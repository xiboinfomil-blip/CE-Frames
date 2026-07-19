import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryMediaHelpers } from '@/lib/db-helpers';
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
    // 1. Get media items associated with this gallery
    const existingItems = await galleryMediaHelpers.getGalleryMediaWithDetails(galleryId);
    
    // DEBUG: Check the structure of the first item if you are still having issues
    // console.log("Sample Item:", existingItems[0]);

    let filteredMedia = existingItems.map(item => {
      // DRIZZLE JOIN FIX: 
      // Depending on your helper, the media data might be nested in 'item.media' 
      // or flat on 'item'. We check both to be safe.
      const mediaData = item.media || item; 
      
      return {
        id: mediaData.id,
        // Ensure we get the string URL. Fallback to empty string if missing.
        thumbnailUrl: mediaData.thumbnailUrl || '',
        fullResUrl: mediaData.fullResUrl || '',
        title: mediaData.originalFilename || mediaData.caption || 'Untitled',
        type: mediaData.type,
        uploadedAt: mediaData.uploadedAt,
        originalFilename: mediaData.originalFilename,
        caption: mediaData.caption
      };
    });

    // Apply Type Filter
    if (type) {
      filteredMedia = filteredMedia.filter(m => m.type === type);
    }

    // Apply Search Filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredMedia = filteredMedia.filter(m => 
        (m.originalFilename && m.originalFilename.toLowerCase().includes(lowerSearch)) ||
        (m.caption && m.caption.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply Sorting
    filteredMedia.sort((a, b) => {
      const dateA = new Date(a.uploadedAt).getTime();
      const dateB = new Date(b.uploadedAt).getTime();
      
      if (sortBy === 'oldest') return dateA - dateB;
      if (sortBy === 'name') return (a.originalFilename || '').localeCompare(b.originalFilename || '');
      return dateB - dateA; // Newest
    });

    // Manual Pagination
    const total = filteredMedia.length;
    const paginatedMedia = filteredMedia.slice(offset, offset + limit);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      items: paginatedMedia,
      pagination: {
        total,
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
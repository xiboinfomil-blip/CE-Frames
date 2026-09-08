import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryMediaHelpers } from '@/lib/db-helpers';
import { NextResponse } from 'next/server';

type MediaType = 'image' | 'video' | 'gif';
type SortBy = 'newest' | 'oldest' | 'name';
interface MediaItem {
  id: string;
  thumbnailUrl: string;
  fullResUrl: string;
  title: string;
  type: MediaType;
  uploadedAt: string | Date;
  originalFilename: string | null;
  caption: string | null;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const galleryId = searchParams.get('galleryId');
  const search = searchParams.get('search') || undefined;
  const requestedType = searchParams.get('type');
  const type: MediaType | undefined = requestedType && requestedType !== 'all'
    ? (['image', 'video', 'gif'].includes(requestedType) ? requestedType as MediaType : undefined)
    : undefined;
  const requestedSort = searchParams.get('sortBy');
  const sortBy: SortBy = requestedSort === 'oldest' || requestedSort === 'name' ? requestedSort : 'newest';
  const page = Number(searchParams.get('page')) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  if (!galleryId) {
    return NextResponse.json({ error: 'Gallery ID required' }, { status: 400 });
  }

  try {
    // 1. Get media items associated with this gallery
    const existingItems = await galleryMediaHelpers.getGalleryMediaWithDetails(galleryId);
    
    let filteredMedia: MediaItem[] = existingItems.map((item) => {
      const itemRecord = item as typeof item & { media?: typeof item };
      // The media data might be nested in 'item.media' or flat on 'item'.
      const mediaData = itemRecord.media || itemRecord;
      
      return {
        id: mediaData.id,
        thumbnailUrl: mediaData.thumbnailUrl || '',
        fullResUrl: mediaData.fullResUrl || '',
        // Safely access originalFilename, fallback to caption or 'Untitled'
        title: mediaData.originalFilename || mediaData.caption || 'Untitled',
        type: mediaData.type,
        // Safely access uploadedAt, fallback to current date if missing
        uploadedAt: mediaData.uploadedAt || new Date().toISOString(),
        originalFilename: mediaData.originalFilename || null,
        caption: mediaData.caption
      };
    });

    // Apply Type Filter
    if (type) {
      filteredMedia = filteredMedia.filter((m) => m.type === type);
    }

    // Apply Search Filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      filteredMedia = filteredMedia.filter((m) =>
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
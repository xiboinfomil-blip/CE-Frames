import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryMediaHelpers, mediaHelpers } from '@/lib/db-helpers';
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
  isUnused: boolean;
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
    // Exclude media already attached to this gallery before paginating.
    const existingItems = await galleryMediaHelpers.getGalleryMediaWithDetails(galleryId);
    const { items, total, hasMore } = await mediaHelpers.findAll({
      search,
      filter: type,
      sortBy,
      limit,
      offset,
      excludeIds: existingItems.map((item) => item.mediaId),
    });

    const paginatedMedia: MediaItem[] = items.map((item) => ({
      id: item.id,
      thumbnailUrl: item.thumbnailUrl,
      fullResUrl: item.fullResUrl,
      title: item.originalFilename || item.caption || 'Untitled',
      type: item.type,
      uploadedAt: item.uploadedAt,
      originalFilename: item.originalFilename,
      caption: item.caption,
      isUnused: item.isUnused,
    }));

    return NextResponse.json({
      items: paginatedMedia,
      pagination: {
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        hasNext: hasMore,
        hasPrevious: page > 1
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
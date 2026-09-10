// app/api/gallery-media/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryMediaHelpers } from '@/lib/db-helpers';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin' && session.user.role !== 'president') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const galleryId = searchParams.get('galleryId');
  if (!galleryId) {
    return NextResponse.json({ error: 'Gallery ID required' }, { status: 400 });
  }

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = 12;
  const sortParam = searchParams.get('sortBy');
  const sortBy = sortParam === 'newest' || sortParam === 'oldest' || sortParam === 'name'
    ? sortParam
    : 'position';
  const result = await galleryMediaHelpers.findByGalleryId(galleryId, {
    limit,
    offset: (page - 1) * limit,
    search: searchParams.get('gallerySearch') || undefined,
    filter: searchParams.get('type') || undefined,
    sortBy,
  });

  return NextResponse.json({
    items: result.items.map((item) => ({
      id: item.media.id,
      mediaId: item.media.id,
      position: item.position,
      media: {
        id: item.media.id,
        thumbnailUrl: item.media.thumbnailUrl,
        fullResUrl: item.media.fullResUrl || '',
        title: item.media.originalFilename || item.media.caption || 'Sans titre',
        type: item.media.type,
        width: item.media.width,
        height: item.media.height,
      },
    })),
    pagination: {
      total: result.total,
      currentPage: page,
      hasNext: result.hasMore,
    },
  });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin' && session.user.role !== 'president') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { galleryId, mediaId } = await req.json();

  try {
    await galleryMediaHelpers.addMediaToGalleryEnd(galleryId, mediaId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add media' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin' && session.user.role !== 'president') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const galleryId = searchParams.get('galleryId');
  const mediaId = searchParams.get('mediaId');

  if (!galleryId || !mediaId) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    await galleryMediaHelpers.removeMediaFromGallery(galleryId, mediaId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to remove media' }, { status: 500 });
  }
}
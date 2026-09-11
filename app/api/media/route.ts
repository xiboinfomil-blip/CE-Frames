import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { mediaHelpers } from '@/lib/db-helpers';
import { db } from '@/lib/db';
import { eq, inArray } from 'drizzle-orm';
import { media } from '@/db/schema';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin' && session.user.role !== 'president') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = 20;
  const search = searchParams.get('search') || undefined;
  const type = searchParams.get('type');
  const filter = type && type !== 'all' ? type : undefined;
  const sortParam = searchParams.get('sortBy');
  const sortBy = sortParam === 'oldest' || sortParam === 'name'
    ? sortParam
    : 'newest';

  const result = await mediaHelpers.findAll({
    limit,
    offset: (page - 1) * limit,
    search,
    filter,
    sortBy,
  });

  return NextResponse.json({
    items: result.items,
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

  try {
    const data = await req.json();
    
    const {
      cloudinaryPublicId,
      url,
      thumbnailUrl,
      width,
      height,
      title,
      locationName,
      coordinates,
      originalFilename,
      mimeType,
      exifData, // ✅ Added: Destructure EXIF data from request
    } = data;

    if (!cloudinaryPublicId || !url) {
      return NextResponse.json({ error: 'Missing Cloudinary data' }, { status: 400 });
    }

    // Parse coordinates for Postgres Point [longitude, latitude]
    let parsedCoordinates: [number, number] | null = null;
    if (coordinates) {
      const parts = String(coordinates).split(',').map((p: string) => p.trim());
      if (parts.length === 2) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        if (!isNaN(x) && !isNaN(y)) {
          parsedCoordinates = [x, y];
        }
      }
    }

    // Create database record
    const newMedia = await mediaHelpers.create({
      type: mimeType?.startsWith('video') ? 'video' : 'image',
      thumbnailUrl,
      fullResUrl: url,
      originalFilename,
      mimeType,
      caption: title || null,
      width: parseInt(width, 10) || null,
      height: parseInt(height, 10) || null,
      durationSeconds: null, 
      exifData: exifData || null, // ✅ Save EXIF data to database
      locationName: locationName || null,
      coordinates: parsedCoordinates,
    });

    return NextResponse.json(newMedia[0], { status: 201 });

  } catch (error) {
    console.error('Media save error:', error);
    return NextResponse.json({ error: 'Failed to save media metadata' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (session.user.role !== 'admin' && session.user.role !== 'president') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { id, caption, locationName } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const mediaItem = await db.query.media.findFirst({
      where: eq(media.id, id),
    });

    if (!mediaItem) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    const updatedMedia = await mediaHelpers.update(id, {
      caption: typeof caption === 'string' ? caption.trim() || null : mediaItem.caption,
      locationName:
        typeof locationName === 'string'
          ? locationName.trim() || null
          : mediaItem.locationName,
    });

    return NextResponse.json(updatedMedia[0]);
  } catch (error) {
    console.error('Media update error:', error);
    return NextResponse.json({ error: 'Failed to update media metadata' }, { status: 500 });
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

  try {
    const { searchParams } = new URL(req.url);
    let ids: string[] = [];
    const body = await req.json().catch(() => null);

    if (Array.isArray(body?.ids)) {
      ids = body.ids.filter((id: unknown): id is string => typeof id === 'string');
    } else {
      const id = searchParams.get('id');
      if (id) ids = [id];
    }

    ids = [...new Set(ids)];
    if (ids.length === 0) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const mediaItems = await db.query.media.findMany({
      where: inArray(media.id, ids),
    });

    if (mediaItems.length === 0) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Track which deletions succeeded - delete from Cloudinary first
    const cloudinaryErrors: string[] = [];
    const successfulIds: string[] = [];

    for (const item of mediaItems) {
      try {
        await mediaHelpers.delete(item.id);
        successfulIds.push(item.id);
      } catch (error) {
        cloudinaryErrors.push(item.id);
        console.error(`Failed to delete media ${item.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      deleted: successfulIds.length,
      failed: cloudinaryErrors.length,
      failedIds: cloudinaryErrors.length > 0 ? cloudinaryErrors : undefined
    });
  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json({ 
      error: 'Failed to delete media', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
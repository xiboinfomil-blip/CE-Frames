import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { mediaHelpers } from '@/lib/db-helpers';
import { db } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { media } from '@/db/schema';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    
    // Removed unused 'format' and 'fileSize' to satisfy ESLint
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
      durationSeconds: null, // Can be added if needed from Cloudinary response
      exifData: null, // Extracted client-side or skipped
      locationName: locationName || null,
      coordinates: parsedCoordinates,
    });

    return NextResponse.json(newMedia[0], { status: 201 });

  } catch (error) {
    console.error('Media save error:', error);
    return NextResponse.json({ error: 'Failed to save media metadata' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
  }

  try {
    // Query directly since findById was removed from mediaHelpers
    const mediaItem = await db.query.media.findFirst({
      where: eq(media.id, id)
    });
    
    if (!mediaItem) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete from Cloudinary (uncomment and implement when ready)
    // const resourceType = mediaItem.type === 'video' ? 'video' : 'image';
    // if (mediaItem.cloudinaryPublicId) {
    //    await deleteFromCloudinary(mediaItem.cloudinaryPublicId, resourceType);
    // }

    await mediaHelpers.delete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
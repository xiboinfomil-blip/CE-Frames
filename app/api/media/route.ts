import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { mediaHelpers } from '@/lib/db-helpers';

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
      format,
      fileSize,
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
    let parsedCoordinates = null;
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
      userId: session.user.id,
      type: mimeType?.startsWith('video') ? 'video' : 'image',
      thumbnailUrl,
      fullResUrl: url,
      originalFilename,
      mimeType,
      caption: title || null,
      width: parseInt(width) || null,
      height: parseInt(height) || null,
      durationSeconds: null, // Can be added if needed from Cloudinary response
      exifData: null, // Extracted client-side or skipped
      locationName: locationName || null,
      coordinates: parsedCoordinates,
      fileSize: parseInt(fileSize) || null,
      format,
      cloudinaryPublicId,
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
    const media = await mediaHelpers.findById(id);
    
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    if (media.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete from Cloudinary
    const resourceType = media.type === 'video' ? 'video' : 'image';
    if (media.cloudinaryPublicId) {
       // You'll need to import deleteFromCloudinary in your helpers or here
       // await deleteFromCloudinary(media.cloudinaryPublicId, resourceType);
    }

    await mediaHelpers.delete(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
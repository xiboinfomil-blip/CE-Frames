import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { galleryMediaHelpers } from '@/lib/db-helpers'; // Adjust this import path to match your actual helpers file location
import { authOptions } from '@/lib/auth'; // Adjust path to your auth options

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'admin' && session.user.role !== 'president') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { galleryId, orderedMediaIds } = await request.json();

    if (!galleryId || !Array.isArray(orderedMediaIds)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Optional: Verify that the gallery belongs to the authenticated user
    // This depends on your database structure
    // const gallery = await db.gallery.findFirst({
    //   where: { id: galleryId, userId: session.user.id }
    // });
    // if (!gallery) {
    //   return NextResponse.json({ error: 'Gallery not found or access denied' }, { status: 403 });
    // }

    // Uses the helper you already defined in your db file
    await galleryMediaHelpers.reorderGallery(galleryId, orderedMediaIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder gallery media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { galleryMediaHelpers } from '@/lib/db-helpers'; // Adjust this import path to match your actual helpers file location

export async function POST(request: NextRequest) {
  try {
    const { galleryId, orderedMediaIds } = await request.json();

    if (!galleryId || !Array.isArray(orderedMediaIds)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // Uses the helper you already defined in your db file
    await galleryMediaHelpers.reorderGallery(galleryId, orderedMediaIds);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reorder gallery media:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
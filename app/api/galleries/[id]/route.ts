import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const gallery = await galleryHelpers.findById(id);

    if (!gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    // Optional: Check if private and user is not owner
    if (gallery.visibility === 'private') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json({ gallery });
  } catch (error) {
    console.error('Error fetching gallery:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// This handles password verification for a specific gallery
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password required' }, { status: 400 });
    }

    const result = await galleryHelpers.verifyGalleryPassword(id, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Invalid password' }, { status: 401 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying password:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, eventDate, visibility, password, coverMediaId, layoutStyle } = body;

    // ✅ Robust Password Hash Logic
    let passwordHash: string | null | undefined = undefined;

    if (visibility === 'password_protected') {
      if (password && password.trim().length > 0) {
        // User provided a new password: hash it
        const bcrypt = await import('bcryptjs');
        passwordHash = await bcrypt.default.hash(password.trim(), 10);
      }
      // If empty, passwordHash remains `undefined`. 
      // Drizzle will ignore `undefined` fields, safely retaining the existing hash.
    } else {
      // Visibility changed to public/private/unlisted: we MUST clear the old hash
      passwordHash = null; 
    }

    const updatedGallery = await galleryHelpers.update(id, {
      title,
      description,
      eventDate: eventDate || null,
      visibility,
      passwordHash,
      coverMediaId,
      layoutStyle,
    });

    return NextResponse.json(updatedGallery);
  } catch (error) {
    console.error('Error updating gallery:', error);
    return NextResponse.json(
      { message: 'Failed to update gallery' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await galleryHelpers.delete(id);

    return NextResponse.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    console.error('Error deleting gallery:', error);
    return NextResponse.json(
      { message: 'Failed to delete gallery' },
      { status: 500 }
    );
  }
}
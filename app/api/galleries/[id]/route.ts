import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import { protectGalleryMedia } from '@/lib/gallery-media-proxy';

const ACCESS_COOKIE_PREFIX = 'gallery-access-';
const ACCESS_DURATION_SECONDS = 60 * 60 * 8;

function accessSignature(galleryId: string, expiresAt: number) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not configured');

  return createHmac('sha256', secret)
    .update(`${galleryId}:${expiresAt}`)
    .digest('hex');
}

function hasGalleryAccess(request: NextRequest, galleryId: string) {
  const value = request.cookies.get(`${ACCESS_COOKIE_PREFIX}${galleryId}`)?.value;
  if (!value) return false;

  const [expiresAtValue, signature] = value.split('.');
  const expiresAt = Number(expiresAtValue);
  if (!Number.isSafeInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000) || !signature) {
    return false;
  }

  const expected = accessSignature(galleryId, expiresAt);
  const actualBuffer = Buffer.from(signature, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

async function hasManagementAccess() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin' || session?.user?.role === 'president';
}

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

    if (gallery.visibility === 'password_protected' && !hasGalleryAccess(request, id)) {
      return NextResponse.json({ error: 'Password required' }, { status: 401 });
    }

    if (gallery.visibility === 'private') {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const safeGallery = Object.fromEntries(
      Object.entries(gallery).filter(([key]) => key !== 'passwordHash')
    );

    safeGallery.items = gallery.items.map((item) => ({
      ...item,
      media: item.media ? protectGalleryMedia(item.media, gallery.id) : item.media,
    }));

    return NextResponse.json({ gallery: safeGallery });
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

    const gallery = await galleryHelpers.findById(id);
    if (!gallery || gallery.visibility !== 'password_protected') {
      return NextResponse.json({ error: 'Gallery is not password protected' }, { status: 400 });
    }

    const result = await galleryHelpers.verifyGalleryPassword(id, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Invalid password' }, { status: 401 });
    }

    const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_DURATION_SECONDS;
    const response = NextResponse.json({ success: true });
    response.cookies.set(`${ACCESS_COOKIE_PREFIX}${id}`, `${expiresAt}.${accessSignature(id, expiresAt)}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: ACCESS_DURATION_SECONDS,
      path: '/',
    });

    return response;
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
    if (!(await hasManagementAccess())) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
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
    if (!(await hasManagementAccess())) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
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
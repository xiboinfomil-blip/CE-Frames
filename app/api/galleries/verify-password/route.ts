import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { galleries } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { galleryId, password } = await request.json();

    if (!galleryId || !password) {
      return NextResponse.json(
        { success: false, message: 'Gallery ID and password are required' },
        { status: 400 }
      );
    }

    // Fetch gallery with password hash
    const gallery = await db.query.galleries.findFirst({
      where: eq(galleries.id, galleryId),
      columns: {
        id: true,
        passwordHash: true,
        visibility: true,
      },
    });

    if (!gallery) {
      return NextResponse.json(
        { success: false, message: 'Gallery not found' },
        { status: 404 }
      );
    }

    if (gallery.visibility !== 'password_protected') {
      return NextResponse.json(
        { success: false, message: 'This gallery is not password protected' },
        { status: 400 }
      );
    }

    if (!gallery.passwordHash) {
      return NextResponse.json(
        { success: false, message: 'Gallery has no password set' },
        { status: 400 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, gallery.passwordHash);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Incorrect password' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password verified successfully',
      galleryId: gallery.id,
    });
  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
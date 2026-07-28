import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import { slugify } from '@/lib/utils';
import bcrypt from 'bcryptjs'; // ✅ Import bcryptjs

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'You must be logged in to create a gallery' },
        { status: 401 }
      );
    }

    const body = await request.json();
    // ✅ 1. Destructure password and other missing fields
    const { title, description, visibility, password, coverMediaId, layoutStyle } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    const baseSlug = slugify(title);
    const slug = `${baseSlug}-${Date.now().toString(36)}`;

    // ✅ 2. Hash the password ONLY if visibility is password_protected and a password is provided
    let hashedPassword: string | null = null;
    if (visibility === 'password_protected' && password && password.trim()) {
      hashedPassword = await bcrypt.hash(password.trim(), 10);
    }

    // ✅ 3. Pass it as `passwordHash` to match your Drizzle schema
    const [newGallery] = await galleryHelpers.create({
      title: title.trim(),
      description: description?.trim() || null,
      slug,
      visibility: visibility || 'public',
      passwordHash: hashedPassword, 
      coverMediaId: coverMediaId || null,
      layoutStyle: layoutStyle || 'masonry'
    });

    return NextResponse.json(newGallery, { status: 201 });
  } catch (error) {
    console.error('Error creating gallery:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Failed to create gallery' },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import { slugify } from '@/lib/utils';
import bcrypt from 'bcryptjs'; // ✅ Import bcryptjs

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limit = 12;
  const search = searchParams.get('search') || undefined;
  const sortParam = searchParams.get('sort') || searchParams.get('sortBy');
  const sort = sortParam === 'oldest'
    ? 'oldest'
    : sortParam === 'name'
      ? 'title'
      : 'newest';
  const filter = searchParams.get('filter') || searchParams.get('visibility') || undefined;
  const isPublic = searchParams.get('public') === 'true';
  const result = isPublic
    ? await galleryHelpers.findPublic({ limit, offset: (page - 1) * limit, search, sortBy: sort, filter })
    : await galleryHelpers.findAll({ limit, offset: (page - 1) * limit, search, sortBy: sort === 'title' ? 'name' : sort, filter });

  return NextResponse.json({
    items: result.items,
    pagination: {
      total: result.total,
      currentPage: page,
      hasNext: result.hasMore,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'You must be logged in to create a gallery' },
        { status: 401 }
      );
    }
    if (session.user.role !== 'admin' && session.user.role !== 'editor') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    // ✅ 1. Destructure password and other missing fields
    const { title, description, eventDate, visibility, password, coverMediaId, layoutStyle } = body;

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
      eventDate: eventDate || null,
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
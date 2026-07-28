import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import GalleriesContent from './GalleriesContent';
import { Suspense } from 'react';
import { Gallery } from '@/types/gallery';

export const metadata = {
  title: 'My Galleries',
  description: 'Manage and view your personal galleries',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'name';
    visibility?: 'public' | 'private' | 'password_protected' | 'unlisted';
  }>;
}

// Loading fallback
function GalleriesLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse">Loading Telemetry...</p>
      </div>
    </div>
  );
}

// ✅ Strictly typed to match the exact canonical Gallery interface provided
function transformGalleryToComponentFormat(gallery: Record<string, unknown>, userId: string): Gallery {
  const coverMedia = gallery.coverMedia as Record<string, unknown> | null | undefined;
  const randomMedia = gallery.randomMedia as Record<string, unknown> | null | undefined;
  const dbUser = gallery.user as Record<string, unknown> | null | undefined;
  const count = gallery._count as Record<string, unknown> | null | undefined;

  return {
    id: String(gallery.id),
    title: String(gallery.title),
    slug: String(gallery.slug),
    // ✅ Enforce string | null (no undefined)
    description: (gallery.description as string | null) ?? null,
    visibility: gallery.visibility as 'public' | 'unlisted' | 'password_protected' | 'private',
    // ✅ Enforce Date object
    createdAt: gallery.createdAt instanceof Date 
      ? gallery.createdAt 
      : new Date(String(gallery.createdAt)),
    userId: String(gallery.userId || userId),
    // ✅ Enforce string | null (no undefined)
    coverMediaId: (gallery.coverMediaId as string | null) ?? null,
    // ✅ Match exact { username, avatarUrl } shape
    user: dbUser ? {
      username: String(dbUser.username || ''),
      avatarUrl: (dbUser.avatarUrl as string | null) ?? null,
    } : undefined,
    // ✅ Match exact shape (removed invalid 'url' and 'title' properties)
    coverMedia: coverMedia ? {
      id: String(coverMedia.id),
      thumbnailUrl: String(coverMedia.thumbnailUrl || ''),
      type: coverMedia.type as 'image' | 'video' | 'gif',
      fullResUrl: coverMedia.fullResUrl ? String(coverMedia.fullResUrl) : undefined,
    } : undefined,
    // ✅ Match exact shape (removed invalid 'url' and 'title' properties)
    randomMedia: randomMedia ? {
      id: String(randomMedia.id),
      thumbnailUrl: String(randomMedia.thumbnailUrl || ''),
      type: randomMedia.type as 'image' | 'video' | 'gif',
      fullResUrl: randomMedia.fullResUrl ? String(randomMedia.fullResUrl) : undefined,
    } : null,
    // ✅ Include _count if it exists in the DB response
    _count: count ? {
      galleryMedia: Number(count.galleryMedia || 0),
      comments: Number(count.comments || 0),
    } : undefined,
  };
}

async function GalleriesPageContent({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const session = await getServerSession(authOptions);
  
  const currentPage = Number(params.page) || 1;
  const limit = 12;
  const offset = (currentPage - 1) * limit;

  if (!session?.user?.id) {
    return (
      <GalleriesContent 
        initialGalleries={[]} 
        pagination={{ total: 0, currentPage: 1, totalPages: 1, hasNext: false, hasPrevious: false }} 
        filters={{ search: '', sortBy: 'newest' }} 
      />
    );
  }

  const userId = session.user.id;

  // ✅ Changed 'visibility' to 'filter' to match galleryHelpers.findAll signature
  const { items: galleries, total } = await galleryHelpers.findAll({
    search: params.search,
    sortBy: params.sortBy || 'newest',
    filter: params.visibility,
    limit,
    offset
  });

  // Transform galleries to match the expected Gallery type
  const transformedGalleries = galleries.map((g: Record<string, unknown>) => 
    transformGalleryToComponentFormat(g, userId)
  );

  const totalPages = Math.ceil(total / limit);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return (
    <GalleriesContent 
      initialGalleries={transformedGalleries} 
      pagination={{ 
        total, 
        currentPage, 
        totalPages, 
        hasNext, 
        hasPrevious,
        limit 
      }}
      filters={{
        search: params.search || '',
        sortBy: params.sortBy || 'newest',
        visibility: params.visibility
      }}
    />
  );
}

export default async function GalleriesPage(props: PageProps) {
  return (
    <Suspense fallback={<GalleriesLoading />}>
      <GalleriesPageContent {...props} />
    </Suspense>
  );
}
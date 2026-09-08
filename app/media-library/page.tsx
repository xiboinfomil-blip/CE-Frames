import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { mediaHelpers } from '@/lib/db-helpers';
import MediaLibraryClient from './MediaLibraryClient';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { MediaSchema } from '@/app/media-library/components/MediaCard';
import { MEDIA_TYPES } from '@/db/schema';
import Skeleton from '@/components/Skeleton';

export const metadata = {
  title: 'Media Library | Racecar Portfolio',
  description: 'Manage your uploaded photos and videos',
};

interface SearchParams {
  page?: string;
  limit?: string;
  search?: string;
  type?: typeof MEDIA_TYPES[number];
  sortBy?: 'newest' | 'oldest' | 'name';
}

interface MediaLibraryPageProps {
  searchParams: Promise<SearchParams>;
}

// Internal Server Component for Streaming Data Fetching
async function MediaLibraryData({ params }: { params: SearchParams }) {
  const parsedPage = parseInt(params.page || '1', 10);
  const parsedLimit = parseInt(params.limit || '20', 10);

  const page = Math.max(1, Number.isNaN(parsedPage) ? 1 : parsedPage);
  const limit = Math.min(100, Math.max(10, Number.isNaN(parsedLimit) ? 20 : parsedLimit));
  const offset = (page - 1) * limit;

  const search = params.search || '';
  const sortBy = params.sortBy === 'oldest' || params.sortBy === 'name' ? params.sortBy : 'newest';

  // Validate filter parameter against MEDIA_TYPES
  const type = MEDIA_TYPES.includes(params.type as typeof MEDIA_TYPES[number])
    ? params.type
    : undefined;

  const result = await mediaHelpers.findAll({ 
    limit, 
    offset,
    search: search || undefined,
    filter: type,
    sortBy
  });

  const items = result?.items || [];
  const safeMedia: MediaSchema[] = items.map((m) => ({
    id: m.id,
    type: m.type as typeof MEDIA_TYPES[number],
    thumbnailUrl: m.thumbnailUrl,
    fullResUrl: m.fullResUrl,
    originalFilename: m.originalFilename,
    mimeType: m.mimeType,
    width: m.width,
    height: m.height,
    durationSeconds: m.durationSeconds,
    exifData: (m.exifData as Record<string, unknown> | null) ?? null,
    caption: m.caption,
    locationName: m.locationName,
    coordinates: m.coordinates 
      ? [Number(m.coordinates[0]), Number(m.coordinates[1])] as [number, number] 
      : null,
    uploadedAt: m.uploadedAt,
  }));

  const total = result?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <MediaLibraryClient 
      initialMedia={safeMedia}
      pagination={{
        currentPage: page,
        totalPages,
        totalItems: total,
        limit,
        hasNext: result?.hasMore ?? false,
        hasPrevious: page > 1
      }}
      filters={{
        search,
        type,
        sortBy
      }}
    />
  );
}

export default async function MediaLibraryPage({ searchParams }: MediaLibraryPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const params = await searchParams;

  return (
    <Suspense fallback={<MediaLibrarySkeleton />}>
      <MediaLibraryData params={params} />
    </Suspense>
  );
}

function MediaLibrarySkeleton() {
  return (
    <div className="w-full px-6 lg:px-12 py-12">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="h-10 w-64 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
          <div className="h-10 w-32 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} variant="grid-card" />
        ))}
      </div>
    </div>
  );
}
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { mediaHelpers } from '@/lib/db-helpers';
import MediaLibraryClient from './MediaLibraryClient';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import type { MediaSchema } from '@/app/media-library/components/MediaCard';
import { MEDIA_TYPES } from '@/db/schema'; // Import MEDIA_TYPES

export const metadata = {
  title: 'Media Library | Racecar Portfolio',
  description: 'Manage your uploaded photos and videos',
};

interface MediaLibraryPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    type?: typeof MEDIA_TYPES[number]; // Use the derived type
    sortBy?: 'newest' | 'oldest' | 'name';
  }>;
}

export default async function MediaLibraryPage({ searchParams }: MediaLibraryPageProps) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const params = await searchParams;

  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = Math.min(100, Math.max(10, parseInt(params.limit || '20', 10)));
  const offset = (page - 1) * limit;
  const search = params.search || '';
  const type = params.type;
  const sortBy = params.sortBy || 'newest';

  const result = await mediaHelpers.findAll({ 
    limit, 
    offset,
    search: search || undefined,
    type: type || undefined,
    sortBy: sortBy as 'newest' | 'oldest' | 'name'
  });

  const safeMedia: MediaSchema[] = result.items.map((m: any) => ({
    id: m.id,
    type: m.type as typeof MEDIA_TYPES[number], // Use the derived type
    thumbnailUrl: m.thumbnailUrl,
    fullResUrl: m.fullResUrl,
    originalFilename: m.originalFilename,
    mimeType: m.mimeType,
    width: m.width,
    height: m.height,
    durationSeconds: m.durationSeconds,
    exifData: m.exifData as Record<string, any> | null,
    caption: m.caption,
    locationName: m.locationName,
    coordinates: m.coordinates ? [Number(m.coordinates.x), Number(m.coordinates.y)] as [number, number] : null,
    uploadedAt: m.uploadedAt,
  }));

  const totalPages = Math.ceil(result.total / limit);

  return (
    <Suspense fallback={<MediaLibrarySkeleton />}>
      <MediaLibraryClient 
        initialMedia={safeMedia}
        pagination={{
          currentPage: page,
          totalPages,
          totalItems: result.total,
          limit,
          hasNext: result.hasMore,
          hasPrevious: page > 1
        }}
        filters={{
          search,
          type,
          sortBy
        }}
      />
    </Suspense>
  );
}

function MediaLibrarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}
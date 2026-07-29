import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import GalleriesContent from './GalleriesContent';
import { Suspense } from 'react';
// ✅ Updated Import
import { GallerySummary, MediaSummary } from '@/types/types';
import { VISIBILITY_STATUSES, MediaType } from '@/db/schema';

export const metadata = {
  title: 'My Galleries',
  description: 'Manage and view your personal galleries',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'name';
    visibility?: typeof VISIBILITY_STATUSES[number];
  }>;
}

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

// ✅ Transformation Function: Maps EnrichedGallery (DB shape) to GallerySummary (UI shape)
function mapToGallerySummary(gallery: any): GallerySummary {
  // Map randomMedia if it exists in the DB response
  const randomMedia: MediaSummary | null = gallery.randomMedia ? {
    id: String(gallery.randomMedia.id),
    type: gallery.randomMedia.type as MediaType,
    thumbnailUrl: String(gallery.randomMedia.thumbnailUrl || ''),
    fullResUrl: gallery.randomMedia.fullResUrl ? String(gallery.randomMedia.fullResUrl) : null,
    caption: gallery.randomMedia.caption || null,
    width: gallery.randomMedia.width ? Number(gallery.randomMedia.width) : null,
    height: gallery.randomMedia.height ? Number(gallery.randomMedia.height) : null,
    durationSeconds: gallery.randomMedia.durationSeconds ? Number(gallery.randomMedia.durationSeconds) : null,
    originalFilename: gallery.randomMedia.originalFilename || null,
    uploadedAt: gallery.randomMedia.uploadedAt instanceof Date 
      ? gallery.randomMedia.uploadedAt 
      : new Date(String(gallery.randomMedia.uploadedAt)),
    exifData: gallery.randomMedia.exifData || undefined,
    locationName: gallery.randomMedia.locationName || null,
  } : null;

  // Map owner/user info
  const owner = gallery.user ? {
    id: String(gallery.user.id),
    username: String(gallery.user.username || ''),
    avatarUrl: gallery.user.avatarUrl ? String(gallery.user.avatarUrl) : null,
  } : undefined;

  return {
    id: String(gallery.id),
    title: String(gallery.title),
    slug: String(gallery.slug),
    description: gallery.description ? String(gallery.description) : null,
    visibility: gallery.visibility,
    layoutStyle: gallery.layoutStyle, // Ensure this field exists in DB response
    coverMediaId: gallery.coverMediaId ? String(gallery.coverMediaId) : null,
    createdAt: gallery.createdAt instanceof Date 
      ? gallery.createdAt 
      : new Date(String(gallery.createdAt)),
    updatedAt: gallery.updatedAt ? (
      gallery.updatedAt instanceof Date 
        ? gallery.updatedAt 
        : new Date(String(gallery.updatedAt))
    ) : undefined,
    mediaCount: gallery._count?.galleryMedia ? Number(gallery._count.galleryMedia) : undefined,
    randomMedia,
    owner,
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

  // Fetch galleries - returns PaginatedResponse<EnrichedGallery>
  const response = await galleryHelpers.findAll({
    search: params.search,
    sortBy: params.sortBy || 'newest',
    filter: params.visibility,
    limit,
    offset,
  });

  // ✅ Transform each gallery to match GallerySummary interface
  const transformedGalleries: GallerySummary[] = response.items.map(mapToGallerySummary);

  const totalPages = Math.ceil(response.total / limit);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return (
    <GalleriesContent 
      initialGalleries={transformedGalleries} 
      pagination={{ 
        total: response.total, 
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
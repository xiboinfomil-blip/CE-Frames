import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryHelpers } from '@/lib/db-helpers';
import GalleriesContent from './GalleriesContent';
import { Suspense } from 'react';
import Skeleton from '@/components/Skeleton';
import { GallerySummary, MediaSummary, PaginatedResponse } from '@/types/types';
import { VISIBILITY_STATUSES, MediaType, LayoutStyle } from '@/db/schema';

export const metadata = {
  title: 'Galeries Média CE',
  description: 'Gérez et consultez les albums médias et événements de votre CE',
};

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    sortBy?: 'newest' | 'oldest' | 'name';
    visibility?: typeof VISIBILITY_STATUSES[number];
  }>;
}

interface EnrichedGallery {
  id: string | number;
  title: string;
  slug: string;
  description: string | null;
  visibility: typeof VISIBILITY_STATUSES[number];
  layoutStyle: LayoutStyle;
  coverMediaId: string | number | null;
  coverMedia?: {
    id: string | number;
    type: MediaType;
    thumbnailUrl: string;
    fullResUrl: string | null;
    caption: string | null;
    originalFilename: string | null;
  } | null;
  createdAt: Date | string;
  updatedAt?: Date | string | null; 
  _count?: {
    galleryMedia: number;
  };
  randomMedia?: {
    id: string | number;
    type: MediaType;
    thumbnailUrl: string;
    fullResUrl: string | null;
    caption: string | null;
    width: number | string | null;
    height: number | string | null;
    durationSeconds: number | string | null;
    originalFilename: string | null;
    uploadedAt: Date | string;
    exifData?: Record<string, unknown>;
    locationName: string | null;
  } | null;
  user?: {
    id: string | number;
    username: string;
    avatarUrl: string | null;
  } | null;
}

function GalleriesLoading() {
  return (
    <div className="min-h-screen bg-white text-[#172033] dark:bg-[#091522] dark:text-white">
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B1624]/80 backdrop-blur-md border-b border-zinc-100 dark:border-white/10 py-6 px-6 lg:px-12 mb-8">
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-3">
            <div className="h-10 w-48 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
              <div className="absolute inset-0 skeleton-shimmer" />
            </div>
            <div className="h-5 w-32 rounded-md bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden relative">
              <div className="absolute inset-0 skeleton-shimmer" />
            </div>
          </div>
          <div className="hidden md:block h-4 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-12 flex-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 w-28 rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
                <div className="absolute inset-0 skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="w-full px-6 lg:px-12 py-12 min-h-[60vh]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(320px,1fr))] gap-6 xl:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} variant="grid-card" />
          ))}
        </div>
      </main>
    </div>
  );
}

function mapToGallerySummary(gallery: EnrichedGallery): GallerySummary {
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

  return {
    id: String(gallery.id),
    title: String(gallery.title),
    slug: String(gallery.slug),
    description: gallery.description ? String(gallery.description) : null,
    visibility: gallery.visibility,
    layoutStyle: gallery.layoutStyle,
    coverMediaId: gallery.coverMediaId ? String(gallery.coverMediaId) : null,
    coverMedia: gallery.coverMedia ? {
      id: String(gallery.coverMedia.id),
      thumbnailUrl: String(gallery.coverMedia.thumbnailUrl || ''),
      fullResUrl: gallery.coverMedia.fullResUrl
        ? String(gallery.coverMedia.fullResUrl)
        : null,
      type: gallery.coverMedia.type,
      originalFilename: gallery.coverMedia.originalFilename || null,
      caption: gallery.coverMedia.caption || null,
    } : null,
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
    owner: undefined,
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

  const response = await galleryHelpers.findAll({
    search: params.search,
    sortBy: params.sortBy || 'newest',
    filter: params.visibility,
    limit,
    offset,
  }) as PaginatedResponse<EnrichedGallery>;

  const transformedGalleries: GallerySummary[] = response.items.map(mapToGallerySummary);

  const totalPages = Math.ceil(response.total / limit);
  const hasNext = currentPage < totalPages;
  const hasPrevious = currentPage > 1;

  return (
    <GalleriesContent 
      key={`${params.search || ''}-${params.sortBy || 'newest'}-${params.visibility || 'all'}-${currentPage}`}
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
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { galleryHelpers, mediaHelpers, galleryMediaHelpers } from '@/lib/db-helpers';
import { db } from '@/lib/db'; // Ensure db is imported
import { galleryMedia } from '@/db/schema'; // Ensure schema is imported
import { eq } from 'drizzle-orm'; // Ensure eq is imported
import ManageGalleryClient from './ManageGalleryClient';
import { notFound, redirect } from 'next/navigation';
import { Suspense } from 'react';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ 
    page?: string;          // Main gallery list page
    modalPage?: string;     // Available media modal page
    search?: string;        // Available media search
    gallerySearch?: string; // Main gallery list search
    sortBy?: 'newest' | 'oldest' | 'name' | 'position'; 
    type?: 'all' | 'image' | 'video' | 'gif';
  }>;
}

function ManageGalleryLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-mono text-sm uppercase tracking-widest animate-pulse">Loading Gallery Telemetry...</p>
      </div>
    </div>
  );
}

async function ManageGalleryContent({ params, searchParams }: PageProps) {
  const { id } = await params;
  const filters = await searchParams;
  
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const galleryResult = await galleryHelpers.findById(id);
  
  if (!galleryResult) {
    notFound();
  }

  if (galleryResult.userId !== session.user.id) {
    redirect('/manage-gallery');
  }

  // 1. Fetch ALL existing media IDs in this gallery (lightweight query for accurate exclusion)
  const existingMediaRelations = await db.select({ mediaId: galleryMedia.mediaId })
    .from(galleryMedia)
    .where(eq(galleryMedia.galleryId, id));
  
  const existingMediaIds = existingMediaRelations.map(row => row.mediaId);

  // 2. Fetch Paginated/Filtered Gallery Media Items (Main List)
  const mainPage = Number(filters.page) || 1;
  const mainLimit = 12;
  const mainOffset = (mainPage - 1) * mainLimit;

  const { items: galleryMediaItemsRaw, total: totalGalleryMedia } = await galleryMediaHelpers.findByGalleryId(id, {
    limit: mainLimit,
    offset: mainOffset,
    search: filters.gallerySearch,
    sortBy: filters.sortBy || 'position'
  });

  const formattedGalleryMedia = galleryMediaItemsRaw.map(item => ({
    id: item.id, 
    mediaId: item.mediaId,
    position: item.position,
    media: {
      id: item.media.id,
      thumbnailUrl: item.media.thumbnailUrl,
      fullResUrl: item.media.fullResUrl,
      title: item.media.originalFilename || item.media.caption || 'Untitled',
      type: item.media.type,
      width: item.media.width,
      height: item.media.height,
    }
  }));

  // 3. Fetch Available Media for the "Add" Modal (With strict DB-level exclusion)
  const modalPage = Number(filters.modalPage) || 1;
  const modalLimit = 12;
  const modalOffset = (modalPage - 1) * modalLimit;

  const { items: allUserMedia, total: totalAvailableMedia } = await mediaHelpers.findAll({
    search: filters.search,
    type: filters.type || 'all',
    sortBy: (filters.sortBy === 'position' ? 'newest' : filters.sortBy) || 'newest',
    limit: modalLimit,
    offset: modalOffset,
    excludeIds: existingMediaIds.length > 0 ? existingMediaIds : undefined // 100% accurate pagination
  });

  const availableMedia = allUserMedia.map(m => ({
    id: m.id,
    thumbnailUrl: m.thumbnailUrl,
    fullResUrl: m.fullResUrl,
    title: m.originalFilename || m.caption || 'Untitled',
    type: m.type,
    uploadedAt: m.uploadedAt
  }));

  // Calculate pagination stats for the modal
  const totalModalPages = Math.ceil(totalAvailableMedia / modalLimit);
  const modalHasNext = modalPage < totalModalPages;
  const modalHasPrevious = modalPage > 1;

  // Calculate pagination stats for the main list
  const totalMainPages = Math.ceil(totalGalleryMedia / mainLimit);
  const mainHasNext = mainPage < totalMainPages;
  const mainHasPrevious = mainPage > 1;

  return (
    <ManageGalleryClient 
      gallery={galleryResult}
      galleryMediaItems={formattedGalleryMedia}
      availableMedia={availableMedia}
      mainPagination={{
        total: totalGalleryMedia,
        currentPage: mainPage,
        totalPages: totalMainPages,
        hasNext: mainHasNext,
        hasPrevious: mainHasPrevious
      }}
      modalPagination={{
        total: totalAvailableMedia,
        currentPage: modalPage,
        totalPages: totalModalPages,
        hasNext: modalHasNext,
        hasPrevious: modalHasPrevious
      }}
      initialFilters={{
        search: filters.search || '',
        gallerySearch: filters.gallerySearch || '',
        type: filters.type || 'all',
        sortBy: filters.sortBy || 'position'
      }}
    />
  );
}

export default async function ManageGalleryPage(props: PageProps) {
  return (
    <Suspense fallback={<ManageGalleryLoading />}>
      <ManageGalleryContent {...props} />
    </Suspense>
  );
}
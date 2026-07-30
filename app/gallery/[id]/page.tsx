import { notFound } from 'next/navigation';
import GalleryClient from './GalleryClient';
import { galleryHelpers } from '@/lib/db-helpers';
import { GalleryDetail } from '@/types/types';
import { Suspense } from 'react';
import Skeleton from '@/components/Skeleton'; // Adjust path if your Skeleton component is located elsewhere

interface PageProps {
  params: Promise<{ id: string }>;
}

function SingleGalleryLoading() {
  return (
    <div className="min-h-screen bg-white px-6 lg:px-12 py-12">
      {/* Header Skeleton */}
      <div className="mb-12 space-y-4">
        <div className="h-12 w-1/3 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden relative">
           <div className="absolute inset-0 skeleton-shimmer" />
        </div>
        <div className="h-6 w-1/2 rounded-md bg-zinc-50 dark:bg-zinc-800/50 overflow-hidden relative">
           <div className="absolute inset-0 skeleton-shimmer" />
        </div>
      </div>

      {/* Grid Skeleton - Using thumbnail variant for a more gallery-like feel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {[...Array(9)].map((_, i) => (
          <Skeleton key={i} variant="thumbnail" className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

async function GalleryContent({ params }: PageProps) {
  const { id } = await params;
  
  // 1. Fetch Gallery Data
  const gallery = await galleryHelpers.findByNotPrivateId(id);

  if (!gallery) {
    notFound();
  }

  // 2. Security Check for Password Protected Galleries
  // We avoid manual mapping to prevent missing property errors (like 'uploadedAt').
  // We only strip the 'items' array to prevent leaking media URLs in the initial HTML payload.
  const safeGallery: GalleryDetail = gallery.visibility === 'password_protected' 
    ? { ...gallery, items: [] } 
    : gallery as GalleryDetail;

  return (
    <GalleryClient 
      initialGallery={safeGallery} 
      galleryId={id} 
    />
  );
}

export default async function GalleryPage({ params }: PageProps) {
  return (
    <Suspense fallback={<SingleGalleryLoading />}>
      <GalleryContent params={params} />
    </Suspense>
  );
}
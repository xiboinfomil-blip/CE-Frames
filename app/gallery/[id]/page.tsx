import { notFound } from 'next/navigation';
import GalleryClient from './GalleryClient';
import { galleryHelpers } from '@/lib/db-helpers';
import { GalleryDetail } from '@/types/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GalleryPage({ params }: PageProps) {
  const { id } = await params;
  
  // 1. Fetch Gallery Data
  const gallery = await galleryHelpers.findById(id);

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
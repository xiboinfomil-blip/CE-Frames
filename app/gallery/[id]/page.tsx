import { notFound } from 'next/navigation';
import GalleryClient from './GalleryClient';
import { galleryHelpers } from '@/lib/db-helpers';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function GalleryPage({ params }: PageProps) {
  // 1. Await params to get the ID
  const { id } = await params;
  
  // 2. Fetch Gallery Data
  const gallery = await galleryHelpers.findById(id);

  if (!gallery) {
    notFound();
  }

  // 3. Security Check for Password Protected Galleries
  // We do NOT send the media URLs to the client if it's locked.
  // The client will have to fetch them again after successful password entry.
  let safeGallery = gallery;
  
  if (gallery.visibility === 'password_protected') {
      safeGallery = {
          ...gallery,
          // Empty array ensures no images are leaked in the initial HTML payload
          galleryMedia: [] 
      };
  }

  return (
    <GalleryClient 
      initialGallery={safeGallery} 
      galleryId={id} 
    />
  );
}
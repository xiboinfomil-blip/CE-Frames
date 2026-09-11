import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import GalleryClient from './GalleryClient';
import { galleryHelpers } from '@/lib/db-helpers';
import { GalleryDetail } from '@/types/types';
import { Suspense } from 'react';
import Skeleton from '@/components/Skeleton';

export const revalidate = 300;

interface PageProps {
  params: Promise<{ id: string }>;
}

function SingleGalleryLoading() {
  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 px-4 md:px-6 py-8 max-w-[1600px] mx-auto">
      {/* En-tête squelette */}
      <div className="mb-8 p-4 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-1/3 rounded-lg" />
          <Skeleton className="h-4 w-1/4 rounded-md" />
        </div>
        <Skeleton className="h-8 w-20 rounded-lg" />
      </div>

      {/* Grille de photos squelette */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {[...Array(10)].map((_, i) => (
          <Skeleton key={i} variant="thumbnail" className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

async function GalleryContent({ params }: PageProps) {
  const { id } = await params;
  
  // 1. Récupération des données selon le statut de connexion
  const session = await getServerSession(authOptions);
  const gallery = session?.user?.id
    ? await galleryHelpers.findById(id)
    : await galleryHelpers.findByNotPrivateId(id);

  if (!gallery) {
    notFound();
  }

  // 2. Masquage des médias pour les galeries protégées par mot de passe (sécurité payload)
  const safeGallery = (gallery.visibility === 'password_protected'
    ? { ...gallery, items: [] }
    : {
        ...gallery,
        items: gallery.items,
      }) as unknown as GalleryDetail;

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
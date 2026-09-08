'use client';

import { useState } from 'react';
import PasswordGate from '@/components/PasswordGate';
import GalleryHeader from './components/GalleryHeader';
import PhotoGrid from './components/PhotoGrid';
import GalleryLightbox from '@/components/GalleryLightbox';
import { GalleryDetail } from '@/types/types';
import { Loader2 } from 'lucide-react';

interface GalleryClientProps {
  initialGallery: GalleryDetail | null;
  galleryId: string;
}

export default function GalleryClient({ initialGallery, galleryId }: GalleryClientProps) {
  const [gallery, setGallery] = useState<GalleryDetail | null>(initialGallery);
  
  // Initialisation directe de l'état de verrouillage
  const [isLocked, setIsLocked] = useState(
    initialGallery?.visibility === 'password_protected' && 
    (!initialGallery.items || initialGallery.items.length === 0)
  );
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const handleUnlock = async (password: string) => {
    setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`/api/galleries/${galleryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (res.ok) {
        const dataRes = await fetch(`/api/galleries/${galleryId}`);
        if (dataRes.ok) {
          const data = await dataRes.json();
          setGallery(data.gallery);
          setIsLocked(false);
        }
      } else {
        const errData = await res.json();
        setError(errData.error || 'Mot de passe incorrect');
      }
    } catch {
      setError('Échec de la connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  // Transformation des données pour la grille
  const photos = gallery?.items.map((item) => ({
    src: item.media.fullResUrl || item.media.thumbnailUrl || '', 
    width: item.media.width || 1080,
    height: item.media.height || 720,
    alt: item.media.caption || item.media.originalFilename || 'Média CSE',
    mediaItem: item.media 
  })) || [];

  if (isLocked) {
    return <PasswordGate onUnlock={handleUnlock} isLoading={isLoading} error={error} />;
  }

  if (!gallery) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-zinc-400 dark:text-zinc-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-rose-500/30 selection:text-rose-900 dark:selection:text-rose-100">
      <GalleryHeader gallery={gallery} />
      
      <main className="container mx-auto px-4 md:px-6 py-8 max-w-[1600px]">
        <PhotoGrid 
          photos={photos} 
          layoutStyle={gallery.layoutStyle} 
          onPhotoClick={setLightboxIndex} 
        />
      </main>

      <GalleryLightbox 
        index={lightboxIndex} 
        slides={photos} 
        onClose={() => setLightboxIndex(-1)} 
      />
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import PasswordGate from '@/components/PasswordGate';
import GalleryHeader from '@/components/GalleryHeader';
import PhotoGrid from '@/app/gallery/[id]/components/PhotoGrid';
import GalleryLightbox from '@/app/gallery/[id]/components/GalleryLightbox';

// Types (Ideally move these to a shared types file)
interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'gif';
  thumbnailUrl: string;
  fullResUrl: string;
  caption?: string | null;
  originalFilename?: string | null;
  locationName?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  exifData?: any;
}

interface GalleryMediaRelation {
  media: MediaItem;
  position: number;
}

interface GalleryData {
  id: string;
  title: string;
  description: string | null;
  visibility: 'public' | 'unlisted' | 'password_protected' | 'private';
  layoutStyle: string;
  createdAt: Date;
  user: {
    username: string;
    avatarUrl: string | null;
  };
  galleryMedia: GalleryMediaRelation[];
}

interface GalleryClientProps {
  initialGallery: GalleryData | null;
  galleryId: string;
}

export default function GalleryClient({ initialGallery, galleryId }: GalleryClientProps) {
  const [gallery, setGallery] = useState<GalleryData | null>(initialGallery);
  const [isLocked, setIsLocked] = useState(initialGallery?.visibility === 'password_protected' && initialGallery?.galleryMedia.length === 0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    if (initialGallery?.visibility === 'password_protected' && initialGallery.galleryMedia.length === 0) {
      setIsLocked(true);
    }
  }, [initialGallery]);

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
        setError(errData.error || 'Invalid password');
      }
    } catch (err) {
      setError('Connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Transform data for Photo Album
  const photos = gallery?.galleryMedia.map((item) => ({
    src: item.media.fullResUrl,
    width: item.media.width || 1080,
    height: item.media.height || 720,
    alt: item.media.caption || '',
    description: item.media.locationName 
      ? `<span class="font-bold uppercase tracking-wider text-red-600">${item.media.locationName}</span><br/>${item.media.caption || ''}`
      : item.media.caption || '',
  })) || [];

  if (isLocked) {
    return <PasswordGate onUnlock={handleUnlock} isLoading={isLoading} error={error} />;
  }

  if (!gallery) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      <GalleryHeader gallery={gallery} />
      
      <main className="container mx-auto px-2 md:px-4 py-8 max-w-[1800px]">
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
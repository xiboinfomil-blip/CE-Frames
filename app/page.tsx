import { galleryHelpers } from '@/lib/db-helpers';
import Home from './Home';
import { protectGalleryMedia } from '@/lib/gallery-media-proxy';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export default async function Page() {
  const latestGalleries = (await galleryHelpers.getLatestPublic(3)).map((gallery) => ({
    ...gallery,
    displayMedia: gallery.displayMedia
      ? protectGalleryMedia(gallery.displayMedia, gallery.id)
      : gallery.displayMedia,
  }));
  return <Home latestGalleries={latestGalleries} />;
}
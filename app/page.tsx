import { galleryHelpers } from '@/lib/db-helpers';
import Home from './Home';

export const dynamic = 'force-dynamic';

export default async function Page() {
  const latestGalleries = await galleryHelpers.getLatestPublic(3);
  return <Home latestGalleries={latestGalleries} />;
}
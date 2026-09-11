import { galleryHelpers, userHelpers } from '@/lib/db-helpers';
import Home from './Home';

export const revalidate = 300;
export const dynamic = 'force-dynamic';

export default async function Page() {
  const [latestGalleries, ceMembers, ceProfile] = await Promise.all([
    galleryHelpers.getLatestPublic(3),
    userHelpers.findCeMembers(),
    userHelpers.getCeProfile(),
  ]);

  return (
    <Home
      latestGalleries={latestGalleries}
      ceMembers={ceMembers}
      ceProfile={ceProfile}
    />
  );
}
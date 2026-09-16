import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { userHelpers } from '@/lib/db-helpers';
import { deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/storage';

async function requireGroupPhotoManager() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await userHelpers.findById(session.user.id);
  return user?.role === 'admin' || user?.role === 'president' ? user : null;
}

async function removeStoredPhoto(url: string | null | undefined) {
  if (!url) return;

  const publicId = extractPublicIdFromUrl(url);
  if (!publicId) return;

  try {
    await deleteFromCloudinary(publicId);
  } catch (error) {
    // The database reference is still removed when Cloudinary cleanup fails.
    console.error('Group photo cleanup failed:', error);
  }
}

export async function PUT(request: Request) {
  const currentUser = await requireGroupPhotoManager();
  if (!currentUser) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const groupPhotoUrl = typeof body.groupPhotoUrl === 'string' && body.groupPhotoUrl.trim()
      ? body.groupPhotoUrl.trim()
      : null;

    if (groupPhotoUrl && groupPhotoUrl.length > 500) {
      return NextResponse.json({ error: 'Photo invalide.' }, { status: 400 });
    }

    // Presidents may remove the group photo, but only administrators may upload or replace it.
    if (groupPhotoUrl && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Seul un administrateur peut téléverser une photo de groupe.' }, { status: 403 });
    }

    const previousProfile = await userHelpers.getCeProfile();
    const [profile] = await userHelpers.updateCeProfile(groupPhotoUrl);

    if (previousProfile?.groupPhotoUrl && previousProfile.groupPhotoUrl !== groupPhotoUrl) {
      await removeStoredPhoto(previousProfile.groupPhotoUrl);
    }

    return NextResponse.json({ profile, updatedBy: currentUser.id });
  } catch (error) {
    console.error('Update CE profile error:', error);
    return NextResponse.json({ error: 'Impossible de mettre à jour la photo du groupe.' }, { status: 500 });
  }
}
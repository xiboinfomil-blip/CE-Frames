import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { userHelpers } from '@/lib/db-helpers';
import { deleteFromCloudinary, extractPublicIdFromUrl } from '@/lib/storage';

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 401 });
  }

  const currentUser = await userHelpers.findById(session.user.id);
  if (!currentUser) {
    return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });
  }

  if (!currentUser.photoUrl) {
    return NextResponse.json({ success: true, photoUrl: null });
  }

  const [updatedUser] = await userHelpers.update(currentUser.id, { photoUrl: null });
  if (!updatedUser) {
    return NextResponse.json({ error: 'Impossible de supprimer votre photo.' }, { status: 500 });
  }

  const publicId = extractPublicIdFromUrl(currentUser.photoUrl);
  if (publicId) {
    try {
      await deleteFromCloudinary(publicId);
    } catch (error) {
      // Keep the profile deletion successful even if the remote asset is already gone.
      console.error('Own user photo cleanup failed:', error);
    }
  }

  return NextResponse.json({ success: true, photoUrl: null });
}
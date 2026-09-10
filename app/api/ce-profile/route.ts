import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { userHelpers } from '@/lib/db-helpers';

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
  }

  const body = await request.json();
  const groupPhotoUrl = typeof body.groupPhotoUrl === 'string' && body.groupPhotoUrl.trim()
    ? body.groupPhotoUrl.trim()
    : null;

  if (groupPhotoUrl && groupPhotoUrl.length > 500) {
    return NextResponse.json({ error: 'Photo invalide.' }, { status: 400 });
  }

  const [profile] = await userHelpers.updateCeProfile(groupPhotoUrl);
  return NextResponse.json({ profile });
}
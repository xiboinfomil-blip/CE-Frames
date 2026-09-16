import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { userHelpers } from '@/lib/db-helpers';
import UsersContent from './UsersContent';

export const metadata = {
  title: 'Gérer les utilisateurs | CE Frames',
  description: 'Gérez les comptes et les rôles des utilisateurs CE Frames.',
};

export default async function ManageUsersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const currentUser = await userHelpers.findById(session.user.id);
  if (!currentUser) {
    redirect('/');
  }

  const canManageUsers = currentUser.role === 'admin';
  const canManageGroupPhoto = currentUser.role === 'admin' || currentUser.role === 'president';
  const users = canManageUsers ? await userHelpers.findAll() : [];

  const ceProfile = canManageGroupPhoto ? await userHelpers.getCeProfile() : null;

  return (
    <UsersContent
      initialUsers={users}
      currentUser={currentUser}
      currentUserId={currentUser.id}
      canManageUsers={canManageUsers}
      canManageGroupPhoto={canManageGroupPhoto}
      initialGroupPhotoUrl={ceProfile?.groupPhotoUrl || null}
    />
  );
}

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
  if (currentUser?.role !== 'admin') {
    redirect('/');
  }

  const users = await userHelpers.findAll();

  return <UsersContent initialUsers={users} currentUserId={currentUser.id} />;
}

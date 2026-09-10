'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import {
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiTrash,
  HiUsers,
} from 'react-icons/hi2';

import { CustomButton } from '@/components/ui/CustomButton';
import { CustomTextfield } from '@/components/ui/CustomTextfield';
import UserModal, { ManagedUser } from './components/UserModal';

interface UsersContentProps {
  initialUsers: ManagedUser[];
  currentUserId: string;
}

const ROLE_STYLES = {
  admin: 'bg-[#FFF1E5] text-[#C65300] dark:bg-[#FF8201]/15 dark:text-[#FFB15C]',
  editor: 'bg-[#EAF4FB] text-[#004A87] dark:bg-[#004A87]/25 dark:text-[#9BCBFF]',
  viewer: 'bg-[#F5F7FA] text-[#64748B] dark:bg-white/10 dark:text-white/60',
};

const ROLE_LABELS = {
  admin: 'Administrateur',
  editor: 'Éditeur',
  viewer: 'Lecteur',
};

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value));
}

export default function UsersContent({ initialUsers, currentUserId }: UsersContentProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const loadUsers = async (term = search) => {
    setIsLoading(true);
    try {
      const params = term.trim() ? `?search=${encodeURIComponent(term.trim())}` : '';
      const response = await fetch(`/api/users${params}`);
      if (!response.ok) throw new Error('Impossible de charger les utilisateurs.');
      const data = await response.json();
      setUsers(data.items || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const openEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (user: ManagedUser) => {
    const result = await Swal.fire({
      title: 'Supprimer cet utilisateur ?',
      text: `${user.username} ne pourra plus se connecter.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#EAF4FB',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      background: 'var(--page-background)',
      color: 'var(--page-foreground)',
    });

    if (!result.isConfirmed) return;

    try {
      const response = await fetch(`/api/users/${user.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Suppression impossible.');
      await loadUsers();
      router.refresh();
    } catch (error) {
      await Swal.fire({
        title: 'Action impossible',
        text: error instanceof Error ? error.message : 'Une erreur est survenue.',
        icon: 'error',
        confirmButtonColor: '#004A87',
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 pb-16 pt-28 text-[#172033] dark:bg-[#091522] dark:text-white sm:px-6 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 border-b border-[#E2E8F0] pb-8 dark:border-white/10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3 text-[#FF8201]">
              <HiUsers className="h-6 w-6" />
              <span className="text-xs font-bold uppercase tracking-[0.18em]">Administration</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Utilisateurs</h1>
            <p className="mt-2 max-w-xl text-sm text-[#64748B] dark:text-white/55">Gérez les accès de votre équipe et les permissions de chaque compte.</p>
          </div>
          <CustomButton onClick={openCreate} leftIcon={<HiPlus className="h-5 w-5" />}>
            Ajouter un utilisateur
          </CustomButton>
        </header>

        <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl shadow-[#00345F]/5 dark:border-white/10 dark:bg-[#102238]">
          <div className="flex flex-col gap-4 border-b border-[#E2E8F0] p-5 dark:border-white/10 sm:flex-row sm:items-end">
            <div className="max-w-lg flex-1">
              <CustomTextfield
                label="Rechercher"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') loadUsers();
                }}
                placeholder="Nom ou adresse e-mail"
                leftIcon={<HiMagnifyingGlass className="h-4 w-4" />}
              />
            </div>
            <CustomButton variant="secondary" onClick={() => loadUsers()} isLoading={isLoading}>
              Rechercher
            </CustomButton>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-[#F5F7FA] text-[11px] uppercase tracking-[0.12em] text-[#64748B] dark:bg-white/[0.03] dark:text-white/45">
                <tr>
                  <th className="px-5 py-4 font-bold">Utilisateur</th>
                  <th className="px-5 py-4 font-bold">Rôle</th>
                  <th className="px-5 py-4 font-bold">Créé le</th>
                  <th className="px-5 py-4 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-white/10">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-[#F5F7FA]/80 dark:hover:bg-white/[0.03]">
                    <td className="px-5 py-4">
                      <div className="font-semibold">{user.username}{user.id === currentUserId && <span className="ml-2 text-xs font-medium text-[#FF8201]">Vous</span>}</div>
                      <div className="mt-1 text-sm text-[#64748B] dark:text-white/50">{user.email}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${ROLE_STYLES[user.role]}`}>
                        {ROLE_LABELS[user.role]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[#64748B] dark:text-white/55">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => openEdit(user)} className="rounded-lg p-2 text-[#004A87] transition hover:bg-[#EAF4FB] dark:text-[#9BCBFF] dark:hover:bg-white/10" aria-label={`Modifier ${user.username}`} title="Modifier">
                          <HiPencilSquare className="h-5 w-5" />
                        </button>
                        <button type="button" onClick={() => handleDelete(user)} disabled={user.id === currentUserId} className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30 dark:text-red-300 dark:hover:bg-red-500/10" aria-label={`Supprimer ${user.username}`} title={user.id === currentUserId ? 'Votre compte ne peut pas être supprimé' : 'Supprimer'}>
                          <HiTrash className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-sm text-[#64748B] dark:text-white/50">Aucun utilisateur trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <UserModal
        key={`${isModalOpen}-${editingUser?.id || 'new'}`}
        isOpen={isModalOpen}
        initialUser={editingUser}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => {
          loadUsers();
          router.refresh();
        }}
      />
    </main>
  );
}

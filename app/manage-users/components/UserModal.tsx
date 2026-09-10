'use client';

import { FormEvent, useState } from 'react';
import { HiAtSymbol, HiKey, HiUser } from 'react-icons/hi2';

import BaseModal from '@/components/BaseModal';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { USER_ROLES, type UserRole } from '@/db/schema';

export interface ManagedUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date | string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialUser?: ManagedUser | null;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Administrateur',
  editor: 'Éditeur',
  viewer: 'Lecteur',
};

export default function UserModal({
  isOpen,
  onClose,
  onSaved,
  initialUser = null,
}: UserModalProps) {
  const isEditMode = Boolean(initialUser);
  const [username, setUsername] = useState(initialUser?.username || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialUser?.role || 'editor');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const response = await fetch(
        initialUser ? `/api/users/${initialUser.id}` : '/api/users',
        {
          method: initialUser ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            email,
            password: password || undefined,
            role,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue.');
      }

      onSaved();
      onClose();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Une erreur est survenue.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Modifier l’utilisateur' : 'Ajouter un utilisateur'}
      subtitle={isEditMode ? 'Mettez à jour le profil et les permissions.' : 'Créez un compte pour votre équipe.'}
      maxWidth="md"
      isLoading={isSaving}
      footer={(
        <div className="flex justify-end gap-3">
          <CustomButton type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Annuler
          </CustomButton>
          <CustomButton type="submit" form="user-form" isLoading={isSaving} leftIcon={<HiUser className="h-4 w-4" />}>
            {isEditMode ? 'Enregistrer' : 'Créer le compte'}
          </CustomButton>
        </div>
      )}
    >
      <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
        <CustomTextfield
          label="Nom d’utilisateur"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="ex. marie.dupont"
          autoComplete="username"
          leftIcon={<HiUser className="h-4 w-4" />}
          required
        />
        <CustomTextfield
          label="Adresse e-mail"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nom@exemple.com"
          autoComplete="email"
          leftIcon={<HiAtSymbol className="h-4 w-4" />}
          required
        />
        <CustomTextfield
          label={isEditMode ? 'Nouveau mot de passe' : 'Mot de passe'}
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder={isEditMode ? 'Laisser vide pour conserver' : '8 caractères minimum'}
          autoComplete={isEditMode ? 'new-password' : 'new-password'}
          leftIcon={<HiKey className="h-4 w-4" />}
          required={!isEditMode}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="user-role" className="pl-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748B]">
            Rôle
          </label>
          <select
            id="user-role"
            value={role}
            onChange={(event) => setRole(event.target.value as UserRole)}
            className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-medium text-[#172033] shadow-sm outline-none transition focus:border-[#FF8201] focus:ring-4 focus:ring-[#FF8201]/15 dark:border-white/10 dark:bg-[#0E1C2D] dark:text-white"
          >
            {USER_ROLES.map((option) => (
              <option key={option} value={option}>
                {ROLE_LABELS[option]}
              </option>
            ))}
          </select>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
      </form>
    </BaseModal>
  );
}

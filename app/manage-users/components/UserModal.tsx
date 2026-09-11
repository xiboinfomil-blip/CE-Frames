'use client';

import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { HiAtSymbol, HiKey, HiPhoto, HiUser } from 'react-icons/hi2';

import BaseModal from '@/components/BaseModal';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { USER_ROLES, type UserRole } from '@/db/schema';

export interface ManagedUser {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: UserRole;
  photoUrl: string | null;
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
  president: 'Président(e)',
  membre: 'Membre',
};

export default function UserModal({
  isOpen,
  onClose,
  onSaved,
  initialUser = null,
}: UserModalProps) {
  const isEditMode = Boolean(initialUser);
  const [username, setUsername] = useState(initialUser?.username || '');
  const [firstName, setFirstName] = useState(initialUser?.firstName || '');
  const [lastName, setLastName] = useState(initialUser?.lastName || '');
  const [email, setEmail] = useState(initialUser?.email || '');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(initialUser?.role || 'membre');
  const [photoUrl, setPhotoUrl] = useState(initialUser?.photoUrl || '');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const uploadPhoto = async (file: File) => {
    if (!file.type.startsWith('image/')) throw new Error('La photo doit être une image.');
    if (file.size > 5 * 1024 * 1024) throw new Error('La photo ne doit pas dépasser 5 Mo.');

    const signatureResponse = await fetch('/api/sign-user-photo', { method: 'POST' });
    const signatureData = await signatureResponse.json();
    if (!signatureResponse.ok) throw new Error(signatureData.error || 'Préparation de la photo impossible.');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('signature', signatureData.signature);
    formData.append('timestamp', String(signatureData.timestamp));
    formData.append('api_key', signatureData.apiKey);
    formData.append('folder', signatureData.folder);

    const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    const uploadData = await uploadResponse.json();
    if (!uploadResponse.ok) throw new Error(uploadData.error?.message || 'Envoi de la photo impossible.');
    return uploadData.secure_url as string;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const selectedPhoto = (event.currentTarget.elements.namedItem('user-photo') as HTMLInputElement)?.files?.[0];
      const uploadedPhotoUrl = selectedPhoto ? await uploadPhoto(selectedPhoto) : photoUrl || null;
      const response = await fetch(
        initialUser ? `/api/users/${initialUser.id}` : '/api/users',
        {
          method: initialUser ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username,
            firstName,
            lastName,
            email,
            password: password || undefined,
            role,
            photoUrl: uploadedPhotoUrl,
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
        <div className="space-y-2">
          <label htmlFor="user-photo" className="pl-1 text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748B]">Photo du membre du CE</label>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {photoUrl ? (
                <>
                  <Image src={photoUrl} alt="Aperçu" width={64} height={64} className="h-16 w-16 rounded-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:bg-red-500/10 dark:text-red-300 dark:hover:bg-red-500/20"
                  >
                    Supprimer
                  </button>
                </>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF4FB] text-[#004A87] dark:bg-white/10 dark:text-white">
                  <HiPhoto className="h-6 w-6" />
                </div>
              )}
            </div>
            <input id="user-photo" name="user-photo" type="file" accept="image/*" className="block w-full text-sm text-[#64748B] file:mr-3 file:rounded-lg file:border-0 file:bg-[#EAF4FB] file:px-3 file:py-2 file:font-semibold file:text-[#004A87]" />
            <p className="text-xs text-[#64748B]">Une seule photo, 5 Mo maximum.</p>
          </div>
        </div>
        <CustomTextfield
          label="Prénom"
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          placeholder="ex. Marie"
          autoComplete="given-name"
          leftIcon={<HiUser className="h-4 w-4" />}
          required
        />
        <CustomTextfield
          label="Nom"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          placeholder="ex. Dupont"
          autoComplete="family-name"
          leftIcon={<HiUser className="h-4 w-4" />}
          required
        />
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

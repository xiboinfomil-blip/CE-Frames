'use client';

import { FormEvent, useState } from 'react';
import { HiCheck, HiMapPin } from 'react-icons/hi2';
import BaseModal from '@/components/BaseModal';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomTextfield } from '@/components/ui/CustomTextfield';

interface EditableMedia {
  id: string;
  caption: string | null;
  locationName: string | null;
}

interface EditMediaModalProps {
  media: EditableMedia | null;
  onClose: () => void;
  onSaved: (media: EditableMedia) => void;
}

export default function EditMediaModal({
  media,
  onClose,
  onSaved,
}: EditMediaModalProps) {
  return (
    <BaseModal
      isOpen={Boolean(media)}
      onClose={onClose}
      title="Modifier les informations"
      subtitle="Mettez à jour le titre et le lieu de cet élément."
      maxWidth="md"
    >
      {media && (
        <EditMediaForm
          key={media.id}
          media={media}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </BaseModal>
  );
}

function EditMediaForm({
  media,
  onClose,
  onSaved,
}: EditMediaModalProps & { media: EditableMedia }) {
  const [caption, setCaption] = useState(media.caption || '');
  const [locationName, setLocationName] = useState(media.locationName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('/api/media', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: media.id,
          caption,
          locationName,
        }),
      });

      if (!response.ok) throw new Error('Failed to update media');

      const updatedMedia = await response.json();
      onSaved(updatedMedia);
      onClose();
    } catch (saveError) {
      console.error('Failed to update media:', saveError);
      setError('Impossible de modifier les informations. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8">
        <CustomTextfield
          label="Titre ou description"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          placeholder="Ajouter une description"
          maxLength={500}
          autoFocus
        />

        <CustomTextfield
          label="Lieu"
          value={locationName}
          onChange={(event) => setLocationName(event.target.value)}
          placeholder="Ajouter un lieu"
          maxLength={255}
          leftIcon={<HiMapPin className="h-4 w-4" />}
        />

        {error && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <CustomButton type="button" variant="ghost" onClick={onClose}>
            Annuler
          </CustomButton>
          <CustomButton
            type="submit"
            variant="continue"
            isLoading={isSaving}
            leftIcon={<HiCheck className="h-4 w-4" />}
          >
            Enregistrer
          </CustomButton>
        </div>
      </form>
  );
}
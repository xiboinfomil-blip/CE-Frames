'use client';

import { useEffect, useState } from 'react';
import BaseModal from '@/components/BaseModal';
import MediaViewport from '@/components/media-viewport';
import { MEDIA_TYPES } from '@/db/schema';
import { DndContext, DragEndEvent, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Info, Loader2 } from 'lucide-react';

interface ReorderItem {
  id: string;
  mediaId: string;
  media: {
    thumbnailUrl: string;
    fullResUrl: string;
    type: string;
    title?: string | null;
    originalFilename?: string | null;
  };
}

interface ReorderMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryId: string;
  initialItems: ReorderItem[];
  onSave: (orderedMediaIds: string[]) => Promise<void>;
}

function SortableRow({ item, index }: { item: ReorderItem; index: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex min-w-0 items-center gap-2 rounded-xl border bg-white p-2 dark:bg-[#102238] sm:gap-3 ${isDragging ? 'z-10 border-[#FF8201] shadow-lg' : 'border-[#E2E8F0] dark:border-white/10'}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Réordonner ${item.media.title || item.media.originalFilename || 'le média'}`}
        className="flex h-10 w-10 shrink-0 touch-none items-center justify-center rounded-lg text-[#64748B] hover:bg-[#EAF4FB] hover:text-[#004A87] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] dark:hover:bg-white/10"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="w-6 shrink-0 text-center text-xs font-bold text-[#64748B] sm:w-8">{index + 1}</span>
      <MediaViewport
        mediaType={item.media.type as typeof MEDIA_TYPES[number]}
        fullResUrl={item.media.fullResUrl}
        thumbnailUrl={item.media.thumbnailUrl}
        caption={item.media.title}
        originalFilename={item.media.originalFilename}
        showMagnifyingGlass={false}
        className="h-14 w-16 shrink-0 rounded-lg sm:w-20"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[#172033] dark:text-white">
          {item.media.title || item.media.originalFilename || 'Média sans titre'}
        </p>
        <p className="mt-0.5 truncate text-[10px] uppercase tracking-[0.12em] text-[#94A3B8]">
          Position {index + 1}
        </p>
      </div>
    </div>
  );
}

export default function ReorderMediaModal({ isOpen, onClose, galleryId, initialItems, onSave }: ReorderMediaModalProps) {
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadAllItems = async () => {
      setItems(initialItems);
      setIsLoading(true);
      setLoadError(false);
      try {
        const loaded: ReorderItem[] = [];
        let page = 1;
        let hasNext = true;
        while (hasNext) {
          const response = await fetch(`/api/gallery-media?galleryId=${galleryId}&page=${page}&sortBy=position`);
          if (!response.ok) throw new Error('Impossible de charger les médias');
          const data = await response.json();
          loaded.push(...data.items);
          hasNext = data.pagination?.hasNext ?? false;
          page += 1;
        }
        if (!cancelled) setItems(loaded);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadAllItems().catch(() => {
      if (!cancelled) {
        setItems(initialItems);
        setLoadError(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [galleryId, initialItems, isOpen]);

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      return oldIndex === -1 || newIndex === -1 ? current : arrayMove(current, oldIndex, newIndex);
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(items.map((item) => item.mediaId));
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Réorganiser les médias"
      subtitle="Faites glisser les médias pour définir leur ordre dans la galerie."
      maxWidth="3xl"
      isLoading={isSaving}
      footer={
        <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button type="button" onClick={onClose} disabled={isSaving} className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-[#64748B] hover:bg-[#F5F7FA] sm:w-auto">Annuler</button>
          <button type="button" onClick={handleSave} disabled={isLoading || isSaving || items.length < 2} className="w-full rounded-xl bg-[#004A87] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#00345F] disabled:opacity-50 sm:w-auto">{isSaving ? 'Enregistrement...' : 'Enregistrer l’ordre'}</button>
        </div>
      }
    >
      <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#D8EAF6] bg-[#F5F9FC] p-3 text-sm text-[#334155] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/75">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#004A87]" />
        <div className="min-w-0">
          <p className="font-semibold">Définissez l’ordre de la galerie</p>
          <p className="mt-0.5 text-xs text-[#64748B] dark:text-white/55">
            Utilisez la poignée à gauche de chaque média, puis enregistrez vos changements.
          </p>
        </div>
      </div>

      {loadError && !isLoading && (
        <p className="mb-3 rounded-lg bg-[#FFF1E5] px-3 py-2 text-xs font-medium text-[#9A4D00]">
          Certains médias n’ont pas pu être chargés. L’ordre actuel est affiché.
        </p>
      )}

      {!isLoading && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#64748B] dark:text-white/50">
          {items.length} {items.length === 1 ? 'média' : 'médias'}
        </p>
      )}

      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#004A87]" /></div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
            <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[60vh]">
              {items.map((item, index) => <SortableRow key={item.id} item={item} index={index} />)}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </BaseModal>
  );
}

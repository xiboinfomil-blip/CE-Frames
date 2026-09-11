'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import BaseModal from '@/components/BaseModal';
import { DndContext, DragEndEvent, closestCenter, useSensor, useSensors, PointerSensor, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Loader2 } from 'lucide-react';

interface ReorderItem {
  id: string;
  mediaId: string;
  media: {
    thumbnailUrl: string;
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
      className={`flex items-center gap-3 rounded-xl border bg-white p-2 dark:bg-[#102238] ${isDragging ? 'z-10 border-[#FF8201] shadow-lg' : 'border-[#E2E8F0] dark:border-white/10'}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Réordonner ${item.media.title || item.media.originalFilename || 'le média'}`}
        className="touch-none rounded-lg p-2 text-[#64748B] hover:bg-[#EAF4FB] hover:text-[#004A87] dark:hover:bg-white/10"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="w-8 text-center text-xs font-bold text-[#64748B]">{index + 1}</span>
      <Image
        src={item.media.thumbnailUrl}
        alt={item.media.title || item.media.originalFilename || 'Média'}
        width={80}
        height={56}
        className="h-14 w-20 rounded-lg object-cover"
      />
      <span className="min-w-0 truncate text-sm font-semibold text-[#172033] dark:text-white">
        {item.media.title || item.media.originalFilename || 'Média sans titre'}
      </span>
    </div>
  );
}

export default function ReorderMediaModal({ isOpen, onClose, galleryId, initialItems, onSave }: ReorderMediaModalProps) {
  const [items, setItems] = useState(initialItems);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      if (!cancelled) setItems(initialItems);
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
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} disabled={isSaving} className="rounded-xl px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F5F7FA]">Annuler</button>
          <button type="button" onClick={handleSave} disabled={isLoading || isSaving || items.length < 2} className="rounded-xl bg-[#004A87] px-4 py-2 text-sm font-semibold text-white hover:bg-[#00345F] disabled:opacity-50">{isSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-[#004A87]" /></div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item) => item.id)} strategy={rectSortingStrategy}>
            <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
              {items.map((item, index) => <SortableRow key={item.id} item={item} index={index} />)}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </BaseModal>
  );
}

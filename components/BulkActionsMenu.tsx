'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, MoreHorizontal, Trash2 } from 'lucide-react';

interface BulkActionsMenuProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onBulkAction: () => void;
  onReorder?: () => void;
  actionLabel: string;
  selectedLabel?: string;
}

export default function BulkActionsMenu({
  selectedCount,
  totalCount,
  onSelectAll,
  onBulkAction,
  actionLabel,
  onReorder,
  selectedLabel = 'Sélectionnés',
}: BulkActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const allSelected = totalCount > 0 && selectedCount === totalCount;

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  return (
    <div ref={menuRef} className="relative shrink-0 self-center">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Ouvrir les actions groupées"
        title="Actions groupées"
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#00345F] shadow-sm transition hover:border-[#FF8201]/50 hover:bg-[#FFF8F2] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] dark:border-white/10 dark:bg-[#102238] dark:text-white dark:hover:bg-white/10"
      >
        <MoreHorizontal className="h-4 w-4" />
        {selectedCount > 0 && (
          <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-[#004A87] px-1 py-0.5 text-[9px] font-bold leading-none text-white">
            {selectedCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#0E1C2D]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onSelectAll();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#334155] transition hover:bg-[#EAF4FB] dark:text-white/80 dark:hover:bg-white/[0.06]"
          >
            <Check className="h-4 w-4 text-[#004A87]" />
            {allSelected ? 'Tout désélectionner' : 'Sélectionner tout'}
          </button>

          {onReorder && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onReorder();
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[#334155] transition hover:bg-[#EAF4FB] dark:text-white/80 dark:hover:bg-white/[0.06]"
            >
              Réorganiser les médias
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            disabled={selectedCount === 0}
            onClick={() => {
              onBulkAction();
              setIsOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" />
            {selectedCount > 0 ? `${actionLabel} ${selectedCount}` : actionLabel}
          </button>

          {selectedCount > 0 && (
            <div className="border-t border-[#E2E8F0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#64748B] dark:border-white/10 dark:text-white/45">
              {selectedCount} {selectedLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

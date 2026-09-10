'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import MediaViewport from '@/components/media-viewport';
import { MEDIA_TYPES } from '@/db/schema';

import {
  Image as ImageIcon,
  Video,
  FileImage,
  Trash2,
  ArrowUpDown,
  GripVertical,
  MoreVertical,
  Check,
} from 'lucide-react';

interface MediaData {
  id: string;
  thumbnailUrl: string;
  fullResUrl?: string;
  title?: string | null;
  type: typeof MEDIA_TYPES[number] | string;
  width?: number | null;
  height?: number | null;
}

interface MediaCardProps {
  media: MediaData;
  onRemove?: (mediaId: string) => void;
  onManualOrder?: (mediaId: string) => void;
  onPreview?: () => void;
  priority?: boolean;
  isSelected?: boolean;
  onSelect?: (mediaId: string) => void;
}

const MediaCard = memo(function MediaCard({
  media,
  onRemove,
  onManualOrder,
  onPreview,
  priority = false,
  isSelected = false,
  onSelect,
}: MediaCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleRemove = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      setIsMenuOpen(false);
      onRemove?.(media.id);
    },
    [onRemove, media.id]
  );

  const handleManualOrderClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      setIsMenuOpen(false);
      onManualOrder?.(media.id);
    },
    [onManualOrder, media.id]
  );

  const handleSelectClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect?.(media.id);
    },
    [media.id, onSelect]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'video':
        return {
          label: 'Vidéo',
          icon: <Video className="w-3 h-3" />,
          className: 'bg-[#00345F]/90 text-white border-[#004A87]/50',
        };

      case 'gif':
        return {
          label: 'GIF',
          icon: null,
          className: 'bg-[#FFF1E5]/95 text-[#00345F] border-[#FF8201]/30',
        };

      default:
        return {
          label: 'Photo',
          icon: <ImageIcon className="w-3 h-3" />,
          className: 'bg-white/95 text-[#004A87] border-white/70',
        };
    }
  };

  const badge = getBadgeConfig(media.type);

  const resolution =
    media.width && media.height
      ? `${media.width}×${media.height}`
      : null;

  const displayUrl =
    media.fullResUrl && media.fullResUrl.trim() !== ''
      ? media.fullResUrl
      : media.thumbnailUrl && media.thumbnailUrl.trim() !== ''
      ? media.thumbnailUrl
      : null;

  return (
    <article
      className={[
        'group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-[#E2E8F0]/80 bg-white shadow-[0_2px_8px_rgba(0,52,95,0.05)] transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(0,52,95,0.12)] dark:border-white/10 dark:bg-[#102238]',
        isSelected ? 'ring-2 ring-[#FF8201] ring-offset-2 dark:ring-offset-[#0f172a]' : '',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3 border-b border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 dark:border-white/10 dark:bg-[#0E1C2D]">
        <button
          type="button"
          onClick={handleSelectClick}
          className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-2 py-1.5 text-left text-[#00345F] transition hover:bg-[#EAF4FB] dark:border-white/10 dark:bg-[#102238] dark:text-white dark:hover:bg-white/5"
          aria-label={isSelected ? 'Désélectionner le média' : 'Sélectionner le média'}
        >
          <span
            className={`flex h-4 w-4 items-center justify-center rounded border ${
              isSelected
                ? 'border-[#004A87] bg-[#004A87] text-white'
                : 'border-[#94A3B8] bg-transparent text-transparent dark:border-white/50'
            }`}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#64748B] dark:text-white/60">
            {isSelected ? 'Sélectionné' : 'Sélectionner'}
          </span>
        </button>

        <div className="flex items-center gap-2">
          {onManualOrder && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onManualOrder(media.id);
              }}
              className="flex items-center justify-center rounded-xl border border-[#E2E8F0] bg-white/95 p-2 text-[#00345F] transition hover:bg-[#EAF4FB] dark:border-white/10 dark:bg-[#102238]/95 dark:text-white dark:hover:bg-white/5"
              aria-label="Changer l'ordre d'affichage"
              title="Changer l'ordre"
            >
              <GripVertical className="h-4 w-4" />
            </button>
          )}

          {(onManualOrder || onRemove) && (
            <div ref={menuRef} className="relative">
              <button
                ref={menuButtonRef}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen((current) => !current);
                }}
                className="flex items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white/95 px-2.5 py-2 text-left shadow-sm text-[#00345F] transition-all duration-200 hover:bg-[#EAF4FB] hover:text-[#004A87] dark:border-white/10 dark:bg-[#102238]/95 dark:text-white dark:hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] focus-visible:ring-offset-2"
                aria-label="Plus d'options"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-controls="media-menu"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Actions</span>
              </button>

              {isMenuOpen && (
                <div
                  id="media-menu"
                  role="menu"
                  className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-[#E2E8F0] bg-white py-2 shadow-xl dark:border-white/10 dark:bg-[#0E1C2D]"
                >
                  {onManualOrder && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleManualOrderClick}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-[#64748B] transition-colors hover:bg-[#EAF4FB] hover:text-[#004A87] focus:outline-none focus-visible:bg-[#EAF4FB] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#FF8201] dark:text-white/80 dark:hover:bg-white/[0.06]"
                    >
                      <ArrowUpDown className="w-4 h-4 text-[#004A87] dark:text-[#9BCBFF]" />
                      Changer l&apos;ordre
                    </button>
                  )}

                  {onManualOrder && onRemove && <div className="mx-3 my-1.5 h-px bg-[#E2E8F0] dark:bg-white/10" />}

                  {onRemove && (
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleRemove}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleRemove(e);
                        }
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus-visible:bg-red-50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-500 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Retirer
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full aspect-4/3 overflow-hidden bg-[#F5F7FA] dark:bg-[#0E1C2D]">
        {displayUrl ? (
          <div className="absolute inset-0 h-full w-full transform transition-transform duration-700 ease-out group-hover:scale-105">
            <MediaViewport
              mediaType={media.type as typeof MEDIA_TYPES[number]}
              fullResUrl={displayUrl}
              thumbnailUrl={media.thumbnailUrl}
              caption={media.title}
              originalFilename={null}
              className="h-full w-full object-cover"
              priority={priority}
              onClick={onPreview}
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#EAF4FB] text-[#64748B]">
            <FileImage className="mb-2 h-10 w-10 opacity-60 text-[#004A87]" strokeWidth={1.5} />
            <span className="text-xs font-medium uppercase tracking-widest text-[#64748B]">Aperçu indisponible</span>
          </div>
        )}

        <div className="absolute right-3 top-3 z-20">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${badge.className}`}
          >
            {badge.icon}
            {badge.label}
          </span>
        </div>
      </div>

      <div className="flex grow shrink-0 flex-col bg-white p-4 dark:bg-[#102238]">
        <h3 className="truncate text-sm font-bold leading-snug text-[#172033] group-hover:text-[#004A87] dark:text-white">
          {media.title || 'Sans titre'}
        </h3>

        {resolution && (
          <p className="mt-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#64748B] dark:text-white/70">
            {resolution}
          </p>
        )}
      </div>
    </article>
  );
});

export default MediaCard;

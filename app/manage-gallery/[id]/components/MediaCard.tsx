'use client';

import { memo, useCallback } from 'react';
import MediaViewport from '@/components/media-viewport';
import { MEDIA_TYPES } from '@/db/schema';

import {
  Image as ImageIcon,
  Video,
  FileImage,
  Trash2,
  ArrowUpDown,
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
  priority?: boolean;
}

const MediaCard = memo(function MediaCard({
  media,
  onRemove,
  onManualOrder,
  priority = false,
}: MediaCardProps) {
  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.(media.id);
    },
    [onRemove, media.id]
  );

  const handleManualOrderClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onManualOrder?.(media.id);
    },
    [onManualOrder, media.id]
  );

  const getBadgeConfig = (type: string) => {
    switch (type) {
      case 'video':
        return {
          label: 'Vidéo',
          icon: (
            <Video className="w-3 h-3" />
          ),
          className:
            'bg-[#00345F]/90 text-white border-[#004A87]/50',
        };

      case 'gif':
        return {
          label: 'GIF',
          icon: null,
          className:
            'bg-[#FFF1E5]/95 text-[#00345F] border-[#FF8201]/30',
        };

      default:
        return {
          label: 'Photo',
          icon: (
            <ImageIcon className="w-3 h-3" />
          ),
          className:
            'bg-white/95 text-[#004A87] border-white/70',
        };
    }
  };

  const badge = getBadgeConfig(media.type);

  const resolution =
    media.width && media.height
      ? `${media.width}×${media.height}`
      : null;

  const displayUrl =
    media.fullResUrl &&
    media.fullResUrl.trim() !== ''
      ? media.fullResUrl
      : media.thumbnailUrl &&
        media.thumbnailUrl.trim() !== ''
      ? media.thumbnailUrl
      : null;

  return (
    <article
      className="
        group
        relative
        flex
        flex-col
        h-full
        w-full
        overflow-hidden
        rounded-2xl
        bg-white
        border
        border-[#E2E8F0]/80
        shadow-[0_2px_8px_rgba(0,52,95,0.05)]
        hover:shadow-[0_16px_32px_rgba(0,52,95,0.12)]
        transition-all
        duration-500
        ease-out
        hover:-translate-y-1
      "
    >
      {/* =====================================================
          Media Viewport
      ====================================================== */}
      <div
        className="
          relative
          w-full
          aspect-4/3
          bg-[#F5F7FA]
          overflow-hidden
        "
      >
        {displayUrl ? (
          <div
            className="
              absolute
              inset-0
              w-full
              h-full
              transform
              group-hover:scale-105
              transition-transform
              duration-700
              ease-out
            "
          >
            <MediaViewport
              mediaType={
                media.type as typeof MEDIA_TYPES[number]
              }
              fullResUrl={displayUrl}
              thumbnailUrl={media.thumbnailUrl}
              caption={media.title}
              originalFilename={null}
              className="w-full h-full object-cover"
              priority={priority}
            />
          </div>
        ) : (
          <div
            className="
              absolute
              inset-0
              flex
              flex-col
              items-center
              justify-center
              text-[#64748B]
              bg-[#EAF4FB]
            "
          >
            <FileImage
              className="
                w-10
                h-10
                opacity-60
                mb-2
                text-[#004A87]
              "
              strokeWidth={1.5}
            />

            <span
              className="
                text-xs
                font-medium
                uppercase
                tracking-widest
                text-[#64748B]
              "
            >
              Aperçu indisponible
            </span>
          </div>
        )}

        {/* ===================================================
            Type Badge
        ==================================================== */}
        <div
          className="
            absolute
            top-3
            right-3
            z-20
          "
        >
          <span
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              border
              px-2.5
              py-1.5
              text-[10px]
              font-bold
              uppercase
              tracking-wider
              shadow-sm
              backdrop-blur-md
              ${badge.className}
            `}
          >
            {badge.icon}
            {badge.label}
          </span>
        </div>

        {/* ===================================================
            Action Buttons Overlay
        ==================================================== */}
        {(onManualOrder || onRemove) && (
          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              gap-3
              opacity-0
              group-hover:opacity-100
              transition-opacity
              duration-300
              bg-[#00345F]/20
              pointer-events-none
              z-30
            "
          >
            {onManualOrder && (
              <button
                onClick={handleManualOrderClick}
                className="
                  pointer-events-auto
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/95
                  backdrop-blur-md
                  text-[#004A87]
                  shadow-lg
                  border
                  border-white/70
                  transition-all
                  duration-200
                  hover:bg-[#EAF4FB]
                  hover:text-[#00345F]
                  hover:scale-110
                  active:scale-95
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#FF8201]
                  focus-visible:ring-offset-2
                "
                aria-label="Changer l'ordre d'affichage"
                title="Changer l'ordre"
              >
                <ArrowUpDown
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </button>
            )}

            {onRemove && (
              <button
                onClick={handleRemove}
                className="
                  pointer-events-auto
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/95
                  backdrop-blur-md
                  text-red-600
                  shadow-lg
                  border
                  border-white/70
                  transition-all
                  duration-200
                  hover:bg-red-50
                  hover:text-red-700
                  hover:scale-110
                  active:scale-95
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-red-500
                  focus-visible:ring-offset-2
                "
                aria-label="Supprimer le média"
                title="Supprimer"
              >
                <Trash2
                  className="h-4 w-4"
                  strokeWidth={2}
                />
              </button>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          Content Body
      ====================================================== */}
      <div
        className="
          flex
          flex-col
          p-4
          bg-white
          shrink-0
          grow
        "
      >
        <h3
          className="
            truncate
            text-sm
            font-bold
            text-[#172033]
            leading-snug
            group-hover:text-[#004A87]
            transition-colors
            mb-3
            tracking-tight
          "
          title={
            media.title || 'Sans titre'
          }
        >
          {media.title || 'Sans titre'}
        </h3>

        <div
          className="
            mt-auto
            pt-3
            border-t
            border-[#E2E8F0]
            flex
            items-center
            justify-between
          "
        >
          {resolution ? (
            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-mono
                font-medium
                text-[#64748B]
                uppercase
                tracking-wider
              "
            >
              <span
                className="
                  w-1.5
                  h-1.5
                  rounded-full
                  bg-[#004A87]
                "
              />

              {resolution}
            </div>
          ) : (
            <div />
          )}

          <span
            className="
              text-[10px]
              font-mono
              font-bold
              text-[#64748B]
              uppercase
              tracking-widest
              opacity-60
            "
          >
            #{media.id
              .slice(0, 6)
              .toUpperCase()}
          </span>
        </div>
      </div>
    </article>
  );
});

MediaCard.displayName = 'MediaCard';

export default MediaCard;

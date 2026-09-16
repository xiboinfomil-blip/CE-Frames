'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';
import Image from 'next/image';
import BaseModal from '@/components/BaseModal';
import { CustomButton } from '@/components/ui/CustomButton';
import { HiArrowPath, HiPhoto } from 'react-icons/hi2';

const CROP_ASPECT_RATIO = 12 / 5;
const OUTPUT_WIDTH = 1200;
const OUTPUT_HEIGHT = 500;
const MAX_ZOOM = 3;

type Point = {
  x: number;
  y: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

type CropMetrics = {
  scale: number;
  renderedWidth: number;
  renderedHeight: number;
  maxOffsetX: number;
  maxOffsetY: number;
  sourceX: number;
  sourceY: number;
  sourceWidth: number;
  sourceHeight: number;
};

interface GroupPhotoCropModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onConfirm: (file: File) => void | Promise<void>;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

function getCropMetrics(
  image: HTMLImageElement,
  viewport: ViewportSize,
  zoom: number,
  offset: Point
): CropMetrics {
  const baseScale = Math.max(
    viewport.width / image.naturalWidth,
    viewport.height / image.naturalHeight
  );
  const scale = baseScale * zoom;
  const renderedWidth = image.naturalWidth * scale;
  const renderedHeight = image.naturalHeight * scale;
  const maxOffsetX = Math.max(0, (renderedWidth - viewport.width) / 2);
  const maxOffsetY = Math.max(0, (renderedHeight - viewport.height) / 2);
  const boundedOffset = {
    x: clamp(offset.x, -maxOffsetX, maxOffsetX),
    y: clamp(offset.y, -maxOffsetY, maxOffsetY),
  };
  const sourceWidth = viewport.width / scale;
  const sourceHeight = viewport.height / scale;

  return {
    scale,
    renderedWidth,
    renderedHeight,
    maxOffsetX,
    maxOffsetY,
    sourceX: clamp(
      (image.naturalWidth - sourceWidth) / 2 - boundedOffset.x / scale,
      0,
      image.naturalWidth - sourceWidth
    ),
    sourceY: clamp(
      (image.naturalHeight - sourceHeight) / 2 - boundedOffset.y / scale,
      0,
      image.naturalHeight - sourceHeight
    ),
    sourceWidth,
    sourceHeight,
  };
}

function getBoundedOffset(
  offset: Point,
  image: HTMLImageElement,
  viewport: ViewportSize,
  zoom: number
) {
  const metrics = getCropMetrics(image, viewport, zoom, offset);

  return {
    x: clamp(offset.x, -metrics.maxOffsetX, metrics.maxOffsetX),
    y: clamp(offset.y, -metrics.maxOffsetY, metrics.maxOffsetY),
  };
}

export default function GroupPhotoCropModal({
  isOpen,
  file,
  onClose,
  onConfirm,
}: GroupPhotoCropModalProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startOffset: Point;
  } | null>(null);

  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [viewportSize, setViewportSize] = useState<ViewportSize>({
    width: 0,
    height: 0,
  });
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !file) return;

    let isCancelled = false;
    const objectUrl = URL.createObjectURL(file);
    const nextImage = new window.Image();

    nextImage.onload = () => {
      if (isCancelled) return;
      setImage(nextImage);
      setImageUrl(objectUrl);
      setOffset({ x: 0, y: 0 });
      setZoom(1);
      setLoadError(null);
    };
    nextImage.onerror = () => {
      if (isCancelled) return;
      setLoadError('Cette image ne peut pas être ouverte.');
    };
    nextImage.src = objectUrl;

    return () => {
      isCancelled = true;
      nextImage.onload = null;
      nextImage.onerror = null;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const updateViewportSize = () => {
      const bounds = viewport.getBoundingClientRect();
      const nextSize = { width: bounds.width, height: bounds.height };

      setViewportSize((currentSize) => (
        currentSize.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      ));
    };

    const resizeObserver = new ResizeObserver(updateViewportSize);
    resizeObserver.observe(viewport);
    const frame = requestAnimationFrame(updateViewportSize);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
    };
  }, [isOpen]);

  const cropMetrics = image && viewportSize.width > 0 && viewportSize.height > 0
    ? getCropMetrics(
        image,
        viewportSize,
        zoom,
        getBoundedOffset(offset, image, viewportSize, zoom)
      )
    : null;

  const boundedOffset = image && viewportSize.width > 0 && viewportSize.height > 0
    ? getBoundedOffset(offset, image, viewportSize, zoom)
    : offset;
  const isLoadingImage = !!file && !image && !loadError;

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !image || !cropMetrics) return;

    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context = canvas.getContext('2d');
    if (!context) return;

    context.clearRect(0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
    context.drawImage(
      image,
      cropMetrics.sourceX,
      cropMetrics.sourceY,
      cropMetrics.sourceWidth,
      cropMetrics.sourceHeight,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );
  }, [
    cropMetrics,
    image,
    offset.x,
    offset.y,
    viewportSize.height,
    viewportSize.width,
    zoom,
  ]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!image || !cropMetrics || event.button !== 0) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffset: boundedOffset,
    };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || !image) return;

    setOffset(
      getBoundedOffset(
        {
          x: drag.startOffset.x + event.clientX - drag.startX,
          y: drag.startOffset.y + event.clientY - drag.startY,
        },
        image,
        viewportSize,
        zoom
      )
    );
  };

  const stopDragging = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
  };

  const handleKeyboardMove = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!image || !cropMetrics) return;

    const directions: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    const direction = directions[event.key];
    if (!direction) return;

    event.preventDefault();
    const distance = event.shiftKey ? 20 : 5;
    setOffset(
      getBoundedOffset(
        {
          x: boundedOffset.x + direction.x * distance,
          y: boundedOffset.y + direction.y * distance,
        },
        image,
        viewportSize,
        zoom
      )
    );
  };

  const handleReset = () => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
  };

  const createCroppedFile = useCallback(() => {
    if (!file || !image || !cropMetrics) {
      return Promise.reject(new Error('La photo n’est pas prête.'));
    }

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;

    const context = canvas.getContext('2d');
    if (!context) {
      return Promise.reject(new Error('Le recadrage est indisponible dans ce navigateur.'));
    }

    context.drawImage(
      image,
      cropMetrics.sourceX,
      cropMetrics.sourceY,
      cropMetrics.sourceWidth,
      cropMetrics.sourceHeight,
      0,
      0,
      OUTPUT_WIDTH,
      OUTPUT_HEIGHT
    );

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Impossible de préparer la photo recadrée.'));
            return;
          }

          const filename = file.name.replace(/\.[^/.]+$/, '') || 'photo-groupe';
          resolve(
            new File([blob], `${filename}-recadree.jpg`, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })
          );
        },
        'image/jpeg',
        0.9
      );
    });
  }, [cropMetrics, file, image]);

  const handleConfirm = async () => {
    setIsExporting(true);

    try {
      const croppedFile = await createCroppedFile();
      await onConfirm(croppedFile);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Impossible de préparer la photo recadrée.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const imageStyle = cropMetrics
    ? {
        width: `${cropMetrics.renderedWidth}px`,
        height: `${cropMetrics.renderedHeight}px`,
        left: `calc(50% + ${boundedOffset.x}px)`,
        top: `calc(50% + ${boundedOffset.y}px)`,
      }
    : undefined;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Recadrer la photo de groupe"
      subtitle="Déplacez l’image pour choisir le cadrage"
      maxWidth="5xl"
      isLoading={isExporting}
      footer={(
        <>
          <CustomButton
            variant="ghost"
            onClick={onClose}
            disabled={isExporting}
          >
            Annuler
          </CustomButton>
          <CustomButton
            onClick={handleConfirm}
            isLoading={isExporting}
            disabled={!image || !!loadError}
            leftIcon={<HiPhoto className="h-4 w-4" />}
          >
            Utiliser cette photo
          </CustomButton>
        </>
      )}
    >
      <div className="space-y-6">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px] lg:items-start">
          <div className="min-w-0">
            <div
              ref={viewportRef}
              role="application"
              aria-label="Zone de recadrage de la photo de groupe"
              tabIndex={0}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={stopDragging}
              onPointerCancel={stopDragging}
              onKeyDown={handleKeyboardMove}
              className="relative w-full touch-none select-none overflow-hidden rounded-2xl border-2 border-[#FF8201] bg-[#091522] shadow-inner outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] focus-visible:ring-offset-2"
              style={{ aspectRatio: CROP_ASPECT_RATIO }}
            >
              {imageUrl && image && cropMetrics && (
                <Image
                  src={imageUrl}
                  alt=""
                  width={Math.ceil(cropMetrics.renderedWidth)}
                  height={Math.ceil(cropMetrics.renderedHeight)}
                  unoptimized
                  draggable={false}
                  className="pointer-events-none absolute max-w-none -translate-x-1/2 -translate-y-1/2"
                  style={imageStyle}
                />
              )}

              <div className="pointer-events-none absolute inset-0 border border-white/70">
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-40">
                  <div className="border-r border-white/70" />
                  <div className="border-r border-white/70" />
                  <div />
                  <div className="border-r border-t border-white/70" />
                  <div className="border-r border-t border-white/70" />
                  <div className="border-t border-white/70" />
                  <div className="border-r border-t border-white/70" />
                  <div className="border-r border-t border-white/70" />
                  <div className="border-t border-white/70" />
                </div>
              </div>

              {(isLoadingImage || !image) && !loadError && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#091522]/80 text-white">
                  <HiArrowPath className="h-7 w-7 animate-spin" aria-hidden="true" />
                  <span className="sr-only">Chargement de la photo</span>
                </div>
              )}

              {loadError && (
                <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm font-semibold text-white">
                  {loadError}
                </div>
              )}
            </div>

            <p className="mt-3 text-center text-xs text-[#64748B] dark:text-white/50">
              Faites glisser l’image ou utilisez les flèches du clavier pour ajuster le cadrage.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F5F7FA] p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#64748B] dark:text-white/55">
                  Aperçu final
                </span>
                <span className="text-[10px] font-semibold text-[#64748B] dark:text-white/45">
                  1200 × 500
                </span>
              </div>
              <canvas
                ref={previewCanvasRef}
                className="block w-full rounded-xl bg-[#091522]"
                style={{ aspectRatio: CROP_ASPECT_RATIO }}
                aria-label="Aperçu en direct de la photo recadrée"
              />
            </div>

            <div className="rounded-2xl border border-[#E2E8F0] p-4 dark:border-white/10">
              <div className="flex items-center justify-between gap-3">
                <label
                  htmlFor="group-photo-zoom"
                  className="text-sm font-semibold text-[#172033] dark:text-white"
                >
                  Zoom
                </label>
                <span className="text-xs font-bold text-[#004A87] dark:text-[#9BCBFF]">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <input
                id="group-photo-zoom"
                type="range"
                min="1"
                max={MAX_ZOOM}
                step="0.01"
                value={zoom}
                onChange={(event) => setZoom(Number(event.target.value))}
                className="mt-3 w-full accent-[#FF8201]"
                aria-label="Niveau de zoom"
              />
              <CustomButton
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={zoom === 1 && offset.x === 0 && offset.y === 0}
                leftIcon={<HiArrowPath className="h-4 w-4" />}
                className="mt-3 w-full"
              >
                Réinitialiser
              </CustomButton>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#EAF4FB] px-4 py-3 text-sm text-[#00345F] dark:bg-[#004A87]/20 dark:text-[#C7E3FF]">
          La photo sera enregistrée au format paysage 12:5 pour s’afficher correctement dans la section À propos.
        </div>
      </div>
    </BaseModal>
  );
}

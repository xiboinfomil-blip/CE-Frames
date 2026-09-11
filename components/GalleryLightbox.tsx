'use client';

import { useEffect, useMemo, useState } from 'react';

import Lightbox, { Slide } from 'yet-another-react-lightbox';

import 'yet-another-react-lightbox/styles.css';

import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Video from 'yet-another-react-lightbox/plugins/video';

// -----------------------------------------------------
// Types
// -----------------------------------------------------

export type MediaItem = Slide;

type ExtendedSlide = MediaItem & {
  mediaId?: string;
  src?: string;
  sources?: {
    src: string;
    type?: string;
  }[];
  poster?: string;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  description?: string;
};

interface GalleryLightboxProps {
  index: number;
  slides: MediaItem[];
  onClose: () => void;
  onDelete?: (slide: MediaItem) => Promise<boolean>;

  /**
   * Optional theme override:
   * 'dark' (recommended for photography)
   * 'light'
   * 'system'
   */
  theme?: 'dark' | 'light' | 'system';
}

// -----------------------------------------------------
// Component
// -----------------------------------------------------

export default function GalleryLightbox({
  index,
  slides,
  onClose,
  onDelete,
  theme = 'dark',
}: GalleryLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(index);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (index < 0) return;

    const preventMediaContextMenu = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest('.yarl__slide_image, .yarl__slide video')) {
        event.preventDefault();
      }
    };

    document.addEventListener('contextmenu', preventMediaContextMenu);
    return () => document.removeEventListener('contextmenu', preventMediaContextMenu);
  }, [index]);

  // ---------------------------------------------------
  // Normalize mixed image / video slides
  // ---------------------------------------------------

  const normalizedSlides = useMemo(() => {
    return slides.map((slide) => {
      const extended = slide as ExtendedSlide;

      const srcString =
        extended.src ||
        extended.sources?.[0]?.src ||
        '';

      const isVideo =
        slide.type === 'video' ||
        (typeof srcString === 'string' &&
          /\.(mp4|webm|ogg|mov|mkv)($|\?)/i.test(
            srcString
          ));

      if (isVideo) {
        return {
          ...slide,
          type: 'video' as const,
          sources: [
            {
              src: srcString,
              type:
                extended.sources?.[0]?.type ||
                'video/mp4',
            },
          ],
          poster: extended.poster,
          width: extended.width,
          height: extended.height,
        } as MediaItem;
      }

      return slide;
    });
  }, [slides]);

  useEffect(() => {
    if (!onDelete || index < 0 || !normalizedSlides[currentIndex]) return;

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key !== 'Delete' && event.key !== 'Backspace') return;
      if (isDeleting) return;

      event.preventDefault();
      setIsDeleting(true);
      await onDelete(normalizedSlides[currentIndex]);
      setIsDeleting(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, index, isDeleting, normalizedSlides, onClose, onDelete]);

  if (
    index < 0 ||
    normalizedSlides.length === 0
  ) {
    return null;
  }

  // ---------------------------------------------------
  // Theme helpers
  // ---------------------------------------------------

  const isLight = theme === 'light';

  const colors = {
    button: isLight
      ? '#004A87'
      : '#EAF4FB',

    buttonHover: isLight
      ? '#00345F'
      : '#FFFFFF',

    buttonActive: '#FF8201',

    title: isLight
      ? '#172033'
      : '#FFFFFF',

    description: isLight
      ? '#64748B'
      : '#CBD5E1',

    hoverBackground: isLight
      ? 'rgba(0, 74, 135, 0.08)'
      : 'rgba(234, 244, 251, 0.10)',

    activeBackground: isLight
      ? 'rgba(255, 130, 1, 0.12)'
      : 'rgba(255, 130, 1, 0.18)',
  };

  return (
    <>
      <Lightbox
        key={index}
        index={currentIndex}
        slides={normalizedSlides}
        open={index >= 0}
        close={onClose}
        on={{ view: ({ index: viewedIndex }) => setCurrentIndex(viewedIndex) }}
        plugins={[Zoom, Fullscreen, Video]}
        carousel={{
          finite: false,
          preload: 2,
          padding: 0,
          spacing: 0,
        }}
        zoom={{
          maxZoomPixelRatio: 4,
          zoomInMultiplier: 2,
          wheelZoomDistanceFactor: 100,
        }}
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
        }}
        video={{
          autoPlay: false,
          controls: true,
          playsInline: true,
        }}
        animation={{
          fade: 300,
        }}
        styles={{
          container: {
            /*
             * Keep the lightbox backdrop neutral.
             * This prevents the brand colors from
             * distracting from the photography.
             */
            backgroundColor: isLight
              ? 'rgba(245, 247, 250, 0.97)'
              : 'rgba(0, 34, 63, 0.96)',

            backdropFilter:
              'blur(24px) saturate(140%)',

            WebkitBackdropFilter:
              'blur(24px) saturate(140%)',
          },

          slide: {
            padding:
              'clamp(16px, 4vw, 64px)',
          },
        }}
      />


      {/* ------------------------------------------------
          CE Frames YARL Theme
          ------------------------------------------------ */}

      <style jsx global>{`
        /* ---------------------------------------------
           Root Design System
           --------------------------------------------- */

        .yarl__root {
          --yarl__color_button: ${colors.button};
          --yarl__color_button_hover: ${colors.buttonHover};
          --yarl__color_button_active: ${colors.buttonActive};

          --yarl__size_button: 48px;
          --yarl__size_icon: 24px;

          /* Captions */
          --yarl__slide_title_color: ${colors.title};
          --yarl__slide_description_color: ${colors.description};
          --yarl__color_captions_background: transparent;
        }

        /* ---------------------------------------------
           Media Framing
           --------------------------------------------- */

        .yarl__slide_image,
        .yarl__slide video {
          user-select: none !important;
          -webkit-user-drag: none !important;
          border-radius: 8px !important;

          box-shadow: ${
            isLight
              ? `
                0 25px 50px -12px rgba(0, 52, 95, 0.20),
                0 0 0 1px rgba(226, 232, 240, 0.9)
              `
              : `
                0 25px 50px -12px rgba(0, 0, 0, 0.80),
                0 0 0 1px rgba(234, 244, 251, 0.12)
              `
          } !important;
        }

        .yarl__slide:has(.yarl__slide_image)::after,
        .yarl__slide:has(video)::after {
          content: '';
          position: absolute;
          z-index: 2;
          top: 50%;
          left: 50%;
          width: min(42vw, 280px);
          aspect-ratio: 3 / 1;
          transform: translate(-50%, -50%);
          pointer-events: none;
          background: url('/Logo name.png') center / contain no-repeat;
          opacity: 0.28;
          mix-blend-mode: multiply;
        }

        /* ---------------------------------------------
           Captions
           --------------------------------------------- */

        .yarl__slide_captions_container {
          position: relative !important;

          margin-top: 20px !important;

          padding: 0 !important;

          background: transparent !important;
        }

        .yarl__slide_title {
          color: ${colors.title} !important;

          font-size: 1.125rem !important;

          font-weight: 600 !important;

          letter-spacing: -0.01em !important;
        }

        .yarl__slide_description {
          color: ${colors.description} !important;

          font-size: 0.875rem !important;

          max-width: 52ch !important;

          margin: 4px auto 0 auto !important;

          line-height: 1.6 !important;
        }

        /* ---------------------------------------------
           Buttons
           --------------------------------------------- */

        .yarl__button {
          border-radius: 9999px !important;

          transition:
            background-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease,
            box-shadow 0.2s ease !important;
        }

        .yarl__button:hover {
          background-color:
            ${colors.hoverBackground} !important;

          color: ${colors.buttonHover} !important;

          box-shadow:
            0 4px 14px rgba(0, 52, 95, 0.10);
        }

        .yarl__button:active {
          background-color:
            ${colors.activeBackground} !important;

          color: ${colors.buttonActive} !important;

          transform: scale(0.95);
        }

        /* ---------------------------------------------
           Close Button
           --------------------------------------------- */

        .yarl__button[aria-label='Close'] {
          transition:
            background-color 0.2s ease,
            color 0.2s ease,
            transform 0.2s ease !important;
        }

        .yarl__button[aria-label='Close']:hover {
          background-color:
            rgba(255, 130, 1, 0.15) !important;

          color:
            #FF8201 !important;

          transform: rotate(90deg) scale(1.05);
        }

        /* ---------------------------------------------
           Navigation Buttons
           --------------------------------------------- */

        .yarl__button[aria-label='Previous'],
        .yarl__button[aria-label='Next'] {
          background-color:
            rgba(0, 52, 95, 0.35) !important;

          backdrop-filter: blur(10px);

          -webkit-backdrop-filter: blur(10px);

          transform: none !important;
        }

        .yarl__button[aria-label='Previous']:hover,
        .yarl__button[aria-label='Next']:hover {
          background-color:
            rgba(0, 74, 135, 0.75) !important;

          color: #FFFFFF !important;

          transform: none !important;
        }

        /* ---------------------------------------------
           Toolbar
           --------------------------------------------- */

        .yarl__toolbar {
          gap: 4px !important;

          padding: 12px !important;
        }

        /* ---------------------------------------------
           Counter
           --------------------------------------------- */

        .yarl__counter {
          color: ${colors.description} !important;

          font-size: 12px !important;

          font-weight: 600 !important;

          letter-spacing: 0.04em !important;
        }

        /* ---------------------------------------------
           Video Controls
           --------------------------------------------- */

        .yarl__slide video::-webkit-media-controls-panel {
          background:
            linear-gradient(
              transparent,
              rgba(0, 52, 95, 0.85)
            );
        }

        /* ---------------------------------------------
           Focus Accessibility
           --------------------------------------------- */

        .yarl__button:focus-visible {
          outline: 2px solid #FF8201 !important;

          outline-offset: 2px !important;
        }

        /* ---------------------------------------------
           Mobile
           --------------------------------------------- */

        @media (max-width: 640px) {
          .yarl__slide_image,
          .yarl__slide video {
            border-radius: 4px !important;
          }

          .yarl__toolbar {
            padding: 8px !important;
          }

          .yarl__slide_captions_container {
            margin-top: 12px !important;
          }
        }
      `}</style>
    </>
  );
}
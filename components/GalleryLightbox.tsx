'use client';

import { useMemo } from 'react';
import Lightbox, { Slide } from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Video from 'yet-another-react-lightbox/plugins/video';
import 'yet-another-react-lightbox/plugins/captions.css';

// 🛡️ Type Definitions
export type MediaItem = Slide;

type ExtendedSlide = MediaItem & {
  src?: string;
  sources?: { src: string; type?: string }[];
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
  /** Optional theme override: 'dark' (recommended for media) | 'light' | 'system' */
  theme?: 'dark' | 'light' | 'system';
}

export default function GalleryLightbox({
  index,
  slides,
  onClose,
  theme = 'dark',
}: GalleryLightboxProps) {
  // Normalize mixed video and image slide props safely
  const normalizedSlides = useMemo(() => {
    return slides.map((slide) => {
      const extended = slide as ExtendedSlide;
      const srcString = extended.src || extended.sources?.[0]?.src || '';

      const isVideo =
        slide.type === 'video' ||
        (typeof srcString === 'string' &&
          /\.(mp4|webm|ogg|mov|mkv)$/i.test(srcString));

      if (isVideo) {
        return {
          ...slide,
          type: 'video' as const,
          sources: [
            {
              src: srcString,
              type: extended.sources?.[0]?.type || 'video/mp4',
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

  if (index < 0 || normalizedSlides.length === 0) return null;

  return (
    <>
      <Lightbox
        index={index}
        slides={normalizedSlides}
        open={index >= 0}
        close={onClose}
        plugins={[Zoom, Captions, Fullscreen, Video]}
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
        captions={{
          descriptionTextAlign: 'center',
          descriptionMaxLines: 3,
        }}
        animation={{
          fade: 300,
        }}
        styles={{
          container: {
            // Dark Backdrop with deep blur
            backgroundColor:
              theme === 'light'
                ? 'rgba(250, 250, 250, 0.96)'
                : 'rgba(10, 10, 12, 0.95)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          },
          slide: {
            padding: 'clamp(16px, 4vw, 64px)',
          },
        }}
      />

      {/* Modern High-End YARL CSS Overrides */}
      <style jsx global>{`
        /* Root Design System Variables for YARL */
        .yarl__root {
          --yarl__color_button: ${theme === 'light' ? '#475569' : '#94a3b8'};
          --yarl__color_button_hover: ${theme === 'light' ? '#0f172a' : '#f8fafc'};
          --yarl__color_button_active: ${theme === 'light' ? '#020617' : '#ffffff'};
          --yarl__size_button: 48px;
          --yarl__size_icon: 24px;

          /* Captions */
          --yarl__slide_title_color: ${theme === 'light' ? '#0f172a' : '#f8fafc'};
          --yarl__slide_description_color: ${theme === 'light' ? '#64748b' : '#94a3b8'};
          --yarl__color_captions_background: transparent;
        }

        /* Framing & Shadows on Media Element */
        .yarl__slide_image,
        .yarl__slide video {
          border-radius: 6px !important;
          box-shadow: ${theme === 'light'
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            : '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.1)'} !important;
        }

        /* Custom Floating Caption Typography */
        .yarl__slide_captions_container {
          position: relative !important;
          margin-top: 20px !important;
          padding: 0 !important;
          background: transparent !important;
        }

        .yarl__slide_title {
          font-size: 1.125rem !important;
          font-weight: 600 !important;
          letter-spacing: -0.01em !important;
        }

        .yarl__slide_description {
          font-size: 0.875rem !important;
          max-width: 52ch !important;
          margin: 4px auto 0 auto !important;
          line-height: 1.6 !important;
        }

        /* Interactive Micro-Interactions */
        .yarl__button {
          border-radius: 9999px !important;
          transition: all 0.2s ease-in-out !important;
        }

        .yarl__button:hover {
          background-color: ${theme === 'light'
            ? 'rgba(0, 0, 0, 0.05)'
            : 'rgba(255, 255, 255, 0.1)'} !important;
          transform: scale(1.05);
        }

        .yarl__button:active {
          transform: scale(0.95);
        }
      `}</style>
    </>
  );
}
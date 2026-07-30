'use client';

import { useMemo } from 'react';
import Lightbox, { Slide } from 'yet-another-react-lightbox';
import "yet-another-react-lightbox/styles.css";
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Video from 'yet-another-react-lightbox/plugins/video';
import "yet-another-react-lightbox/plugins/captions.css";

// 🛡️ Type Safety: Alias the library's native Slide type.
export type MediaItem = Slide;

// 🛡️ Extended slide type to safely access optional properties without `any`
type ExtendedSlide = MediaItem & {
  src?: string;
  sources?: { src: string; type?: string }[];
  poster?: string;
  width?: number;
  height?: number;
};

interface GalleryLightboxProps {
  index: number;
  slides: MediaItem[];
  onClose: () => void;
}

export default function GalleryLightbox({ index, slides, onClose }: GalleryLightboxProps) {
  
  // 🛡️ Normalize slides to prevent crashes when video data is malformed.
  // The Video plugin strictly requires: 1) `type: "video"`, 2) a `sources` array.
  const normalizedSlides = useMemo(() => {
    return slides.map((slide) => {
      const extended = slide as ExtendedSlide;
      const srcString = extended.src || extended.sources?.[0]?.src || '';
      
      // Detect if this is meant to be a video based on type or file extension
      const isVideo = 
        slide.type === 'video' || 
        (typeof srcString === 'string' && /\.(mp4|webm|ogg|mov|mkv)$/i.test(srcString));

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

  // Prevent rendering if index is invalid or slides are empty
  if (index < 0 || normalizedSlides.length === 0) {
    return null;
  }

  return (
    <>
      <Lightbox
        index={index}
        slides={normalizedSlides}
        open={index >= 0}
        close={onClose}
        plugins={[Zoom, Captions, Fullscreen, Video]}
        
        carousel={{ 
          finite: true,
          preload: 2,
          padding: 0,
          spacing: 0,
        }}
        
        zoom={{ 
          maxZoomPixelRatio: 5, 
          zoomInMultiplier: 2,
          wheelZoomDistanceFactor: 100,
        }}
        
        controller={{
          closeOnBackdropClick: true,
          closeOnPullDown: true,
        }}
        
        // 🎬 Video-specific UX: Safer default to prevent mobile browser autoplay crashes
        video={{
          autoPlay: false, 
          controls: true,
          playsInline: true,
        }}

        captions={{ 
          descriptionTextAlign: 'start',
          descriptionMaxLines: 3,
        }}

        styles={{
          container: { 
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          },
          root: { 
            '--yarl__color_button': '#71717a',
            '--yarl__color_button_active': '#18181b',
            '--yarl__color_button_hover': '#27272a',
            '--yarl__color_icon': '#52525b',
            '--yarl__color_focus_ring': 'rgba(24, 24, 27, 0.4)',
            '--yarl__color_text': '#18181b',
            '--yarl__color_background': 'transparent',
            '--yarl__size_button': '44px',
            '--yarl__size_icon': '22px',
            '--yarl__transition_button': 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '--yarl__slide_title_color': '#18181b',
            '--yarl__slide_title_font_size': '1.25rem',
            '--yarl__slide_title_font_weight': '600',
            '--yarl__slide_title_letter_spacing': '-0.025em',
            '--yarl__slide_description_color': '#52525b',
            '--yarl__slide_description_font_size': '1rem',
            '--yarl__slide_description_line_height': '1.6',
            '--yarl__color_captions_background': 'rgba(255, 255, 255, 0.9)',
            '--yarl__color_captions_text': '#18181b',
            '--yarl__color_button_dark': '#a1a1aa',
            '--yarl__color_button_active_dark': '#f4f4f5',
            '--yarl__color_button_hover_dark': '#e4e4e7',
            '--yarl__color_icon_dark': '#a1a1aa',
            '--yarl__color_focus_ring_dark': 'rgba(244, 244, 245, 0.4)',
            '--yarl__color_text_dark': '#f4f4f5',
            '--yarl__slide_title_color_dark': '#f4f4f5',
            '--yarl__slide_description_color_dark': '#a1a1aa',
            '--yarl__color_captions_background_dark': 'rgba(24, 24, 27, 0.9)',
            '--yarl__color_captions_text_dark': '#f4f4f5',
          } as React.CSSProperties & Record<string, string>,
          slide: {
            padding: 'clamp(16px, 4vw, 48px)',
          },
        }}
        
        animation={{ 
          fade: 250,
        }}
      />
      
      <style>{`
        .yarl__slide img, 
        .yarl__slide video {
          border-radius: 4px !important;
          box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.12) !important;
          transition: box-shadow 0.3s ease;
        }
        .yarl__slide_captions_container {
          background-color: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.04) !important;
          padding: clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px) !important;
        }
        .yarl__slide_title { margin-bottom: 8px !important; }
        .yarl__slide_description { max-width: 65ch !important; }
        .yarl__button { border-radius: 50% !important; }
        .yarl__button:hover { background-color: rgba(0, 0, 0, 0.04) !important; }

        @media (prefers-color-scheme: dark) {
          .yarl__container { background-color: rgba(9, 9, 11, 0.92) !important; }
          .yarl__slide_captions_container {
            background-color: rgba(24, 24, 27, 0.9) !important;
            border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2) !important;
          }
          .yarl__slide img, .yarl__slide video { box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.5) !important; }
          .yarl__button:hover { background-color: rgba(255, 255, 255, 0.1) !important; }
        }
      `}</style>
    </>
  );
}
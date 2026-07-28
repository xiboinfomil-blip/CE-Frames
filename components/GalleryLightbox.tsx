'use client';

import Lightbox, { Slide } from 'yet-another-react-lightbox';
import "yet-another-react-lightbox/styles.css";
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Video from 'yet-another-react-lightbox/plugins/video';
import "yet-another-react-lightbox/plugins/captions.css";

// 🛡️ Type Safety: Alias the library's native Slide type.
export type MediaItem = Slide;

interface GalleryLightboxProps {
  index: number;
  slides: MediaItem[];
  onClose: () => void;
}

export default function GalleryLightbox({ index, slides, onClose }: GalleryLightboxProps) {
  return (
    <>
      <Lightbox
        index={index}
        slides={slides}
        open={index >= 0}
        close={onClose}
        plugins={[Zoom, Captions, Fullscreen, Video]}
        
        // 🏎️ UX: Seamless, high-performance navigation
        carousel={{ 
          finite: true,
          preload: 2,
          padding: 0,
          spacing: 0,
        }}
        
        // 🔍 UX: Precision deep zoom for inspecting fine photography details
        zoom={{ 
          maxZoomPixelRatio: 5, 
          zoomInMultiplier: 2,
          wheelZoomDistanceFactor: 100,
        }}
        
        // ♿ a11y: Intuitive interaction behaviors
        controller={{
          closeOnBackdropClick: true, // Click outside to close
          closeOnPullDown: true,      // Swipe down to close (mobile)
        }}
        
        // 🎬 Video-specific UX: Respects user consent and vestibular sensitivity
        video={{
          autoPlay: true,
          controls: true,
          playsInline: true,
        }}

        // 📝 Captions configuration
        captions={{ 
          descriptionTextAlign: 'start',
          descriptionMaxLines: 3,
        }}

        // 🎨 UI: Premium "Gallery Showroom" Styling
        styles={{
          container: { 
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          },
          root: { 
            // Premium Neutral Palette (Zinc)
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

            // Dark Mode Overrides (Graceful fallback)
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
            padding: 'clamp(16px, 4vw, 48px)', // Generous breathing room
          },
        }}
        
        animation={{ 
          fade: 250,
        }}
      />
      
      {/* 🎨 Premium "Gallery Showroom" CSS Overrides */}
      <style>{`
        /* Fine Art Print Styling */
        .yarl__slide img, 
        .yarl__slide video {
          border-radius: 4px !important;
          box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.12) !important;
          transition: box-shadow 0.3s ease;
        }

        /* Elegant Frosted Glass Captions Panel */
        .yarl__slide_captions_container {
          background-color: rgba(255, 255, 255, 0.85) !important;
          backdrop-filter: blur(20px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(20px) saturate(180%) !important;
          border-top: 1px solid rgba(0, 0, 0, 0.06) !important;
          box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.04) !important;
          padding: clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px) !important;
        }

        /* Refine Typography for Optimal Readability */
        .yarl__slide_title {
          margin-bottom: 8px !important;
        }
        
        .yarl__slide_description {
          max-width: 65ch !important; /* Gold standard for readable line length */
        }

        /* Soften Button Interactions */
        .yarl__button {
          border-radius: 50% !important;
        }
        
        .yarl__button:hover {
          background-color: rgba(0, 0, 0, 0.04) !important;
        }

        /* Graceful Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          .yarl__container {
            background-color: rgba(9, 9, 11, 0.92) !important; /* zinc-950 */
          }
          .yarl__slide_captions_container {
            background-color: rgba(24, 24, 27, 0.9) !important; /* zinc-900 */
            border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2) !important;
          }
          .yarl__slide img, 
          .yarl__slide video {
            box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.5) !important;
          }
          .yarl__button:hover {
            background-color: rgba(255, 255, 255, 0.1) !important;
          }
        }
      `}</style>
    </>
  );
}
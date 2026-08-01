'use client';

import { useMemo } from 'react';
import Lightbox, { Slide } from 'yet-another-react-lightbox';
import "yet-another-react-lightbox/styles.css";
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Video from 'yet-another-react-lightbox/plugins/video';
import "yet-another-react-lightbox/plugins/captions.css";

// 🛡️ Type Safety
export type MediaItem = Slide;

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
  
  const normalizedSlides = useMemo(() => {
    return slides.map((slide) => {
      const extended = slide as ExtendedSlide;
      const srcString = extended.src || extended.sources?.[0]?.src || '';
      
      const isVideo = 
        slide.type === 'video' || 
        (typeof srcString === 'string' && /\.(mp4|webm|ogg|mov|mkv)$/i.test(srcString));

      if (isVideo) {
        return {
          ...slide,
          type: 'video' as const,
          sources: [{ src: srcString, type: extended.sources?.[0]?.type || 'video/mp4' }],
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
          maxZoomPixelRatio: 5, 
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

        styles={{
          container: { 
            // Ultra-premium "Studio White" backdrop
            backgroundColor: 'rgba(252, 252, 252, 0.98)',
            backdropFilter: 'blur(40px) saturate(200%)',
            WebkitBackdropFilter: 'blur(40px) saturate(200%)',
          },
          root: { 
            // Refined Color Palette (Warm Greys for a softer look)
            '--yarl__color_button': '#78716c', // Stone-500
            '--yarl__color_button_active': '#1c1917', // Stone-900
            '--yarl__color_button_hover': '#292524', // Stone-800
            '--yarl__color_icon': '#57534e', // Stone-600
            '--yarl__color_focus_ring': 'rgba(28, 25, 23, 0.15)',
            
            '--yarl__size_button': '52px', // Larger, more luxurious touch targets
            '--yarl__size_icon': '26px',
            
            '--yarl__transition_button': 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', // Spring-like physics
            
            // Editorial Typography
            '--yarl__slide_title_color': '#1c1917',
            '--yarl__slide_title_font_size': '1.75rem',
            '--yarl__slide_title_font_weight': '300', // Light weight for elegance
            '--yarl__slide_title_letter_spacing': '-0.03em',
            
            '--yarl__slide_description_color': '#78716c',
            '--yarl__slide_description_font_size': '1.125rem',
            '--yarl__slide_description_line_height': '1.7',
            '--yarl__slide_description_font_weight': '400',
            
            // Invisible caption background for a cleaner look
            '--yarl__color_captions_background': 'transparent',
            '--yarl__color_captions_text': '#1c1917',
            
            // Dark Mode Elegance
            '--yarl__color_button_dark': '#a8a29e',
            '--yarl__color_button_active_dark': '#fafaf9',
            '--yarl__color_button_hover_dark': '#f5f5f4',
            '--yarl__color_icon_dark': '#a8a29e',
            '--yarl__color_focus_ring_dark': 'rgba(250, 250, 249, 0.15)',
            '--yarl__slide_title_color_dark': '#fafaf9',
            '--yarl__slide_description_color_dark': '#a8a29e',
            '--yarl__color_captions_text_dark': '#fafaf9',
          } as React.CSSProperties & Record<string, string>,
          slide: {
            padding: 'clamp(24px, 6vw, 80px)',
          },
        }}
        
        animation={{ 
          fade: 400, // Slower, more cinematic fade
        }}
      />
      
      <style>{`
        /* 🖼️ The "Art Frame" Effect */
        .yarl__slide img, 
        .yarl__slide video {
          border-radius: 2px !important; /* Sharp, gallery-style corners */
          box-shadow: 
            0 30px 60px -15px rgba(0, 0, 0, 0.1), 
            0 0 0 1px rgba(0, 0, 0, 0.03) !important;
          transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease;
        }

        /* 📝 Floating Caption Island */
        .yarl__slide_captions_container {
          position: relative;
          margin-top: clamp(20px, 4vw, 40px);
          padding: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          backdrop-filter: none !important;
        }

        .yarl__slide_title { 
          margin-bottom: 8px !important; 
          font-family: 'Inter', ui-sans-serif, system-ui, sans-serif !important;
          opacity: 0.95;
        }
        
        .yarl__slide_description { 
          max-width: 45ch !important; 
          margin: 0 auto !important;
          opacity: 0.8;
          font-feature-settings: "liga" 1, "calt" 1; /* Better ligatures */
        }

        /* 🔘 Minimalist Iconography */
        .yarl__button { 
          border-radius: 50% !important; 
          background-color: transparent !important;
          border: 1px solid transparent !important;
          transition: all 0.3s ease !important;
        }
        
        .yarl__button:hover { 
          background-color: rgba(0, 0, 0, 0.03) !important; 
          transform: scale(1.1);
        }

        /* 🌙 Dark Mode: "Midnight Gallery" */
        @media (prefers-color-scheme: dark) {
          .yarl__container { 
            background-color: rgba(12, 12, 12, 0.98) !important; 
          }
          
          .yarl__slide img, .yarl__slide video { 
            box-shadow: 
              0 30px 60px -15px rgba(0, 0, 0, 0.5), 
              0 0 0 1px rgba(255, 255, 255, 0.05) !important; 
          }
          
          .yarl__button:hover { 
            background-color: rgba(255, 255, 255, 0.05) !important; 
          }
        }

        /* ✨ Subtle Entrance Animation for Captions */
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .yarl__slide_captions_container {
          animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
}
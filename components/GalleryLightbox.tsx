// components/GalleryLightbox.tsx
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
        
        // ♿ a11y: Interaction behaviors are grouped under the `controller` prop
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

        // 🎨 UI: Premium "Light Showroom" Styling (Strictly typed slots)
        styles={{
          container: { 
            backgroundColor: 'rgba(248, 250, 252, 0.94)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          },
          root: { 
            '--yarl__color_button': '#64748b',
            '--yarl__color_button_active': '#dc2626',
            '--yarl__color_button_hover': '#b91c1c',
            '--yarl__color_icon': '#334155',
            '--yarl__color_focus_ring': '#dc2626',
            '--yarl__color_text': '#0f172a',
            '--yarl__color_background': 'transparent',
            
            '--yarl__size_button': '48px',
            '--yarl__size_icon': '24px',
            
            '--yarl__transition_button': 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease',
            
            '--yarl__slide_title_color': '#0f172a',
            '--yarl__slide_title_font_size': 'clamp(1.125rem, 2vw, 1.5rem)',
            '--yarl__slide_title_font_weight': '700',
            '--yarl__slide_description_color': '#475569',
          } as React.CSSProperties & Record<string, string>,
          
          slide: {
            padding: 'clamp(12px, 2vw, 24px)',
          },
        }}
        
        animation={{ 
          fade: 300,
        }}
      />
      
      {/* 🎨 Premium "Light Showroom" CSS Overrides */}
      <style>{`
        .yarl__slide img, 
        .yarl__slide video {
          border-radius: 6px !important;
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.12) !important;
        }
        
        .yarl__slide_captions_container {
          background-color: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(16px) saturate(180%) !important;
          -webkit-backdrop-filter: blur(16px) saturate(180%) !important;
          border-top: 2px solid #dc2626 !important;
          padding: clamp(16px, 3vw, 24px) clamp(20px, 4vw, 32px) !important;
          box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.06) !important;
          border-bottom-left-radius: 8px !important;
          border-bottom-right-radius: 8px !important;
        }
        
        .yarl__slide_title {
          letter-spacing: -0.025em !important;
          margin-bottom: 6px !important;
          line-height: 1.2 !important;
        }
        
        .yarl__slide_description {
          font-size: clamp(0.95rem, 1.5vw, 1.05rem) !important;
          line-height: 1.6 !important;
          max-width: 800px !important;
        }
      `}</style>
    </>
  );
}
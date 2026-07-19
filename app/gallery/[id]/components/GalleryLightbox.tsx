// components/GalleryLightbox.tsx
import Lightbox from 'yet-another-react-lightbox';
import "yet-another-react-lightbox/styles.css";
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import "yet-another-react-lightbox/plugins/captions.css";

interface PhotoItem {
  src: string;
  width: number;
  height: number;
  alt: string;
  description?: string;
}

interface GalleryLightboxProps {
  index: number;
  slides: PhotoItem[];
  onClose: () => void;
}

export default function GalleryLightbox({ index, slides, onClose }: GalleryLightboxProps) {
  return (
    <Lightbox
      index={index}
      slides={slides}
      open={index >= 0}
      close={onClose}
      plugins={[Zoom, Captions]}
      carousel={{ finite: true }}
      zoom={{ maxZoomPixelRatio: 4 }}
      captions={{ 
        descriptionTextAlign: 'center',
        descriptionMaxLines: 2,
      }}
      styles={{
        container: { 
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(8px)',
        },
        root: { 
          '--yarl__color_button': '#64748b',
          '--yarl__color_button_active': '#dc2626',
          '--yarl__color_icon': '#64748b',
          '--yarl__color_focus_ring': '#dc2626',
        }
      }}
      animation={{ fade: 250 }}
    />
  );
}
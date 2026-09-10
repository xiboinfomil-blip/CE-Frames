import { GalleryDetail } from '@/types/types';
import { Calendar, Lock, Image as ImageIcon } from 'lucide-react';

interface GalleryHeaderProps {
  gallery: GalleryDetail;
}

export default function GalleryHeader({ gallery }: GalleryHeaderProps) {
  // Formatage de la date en français (ex: 8 sept. 2026)
  const formattedDate = new Date(gallery.createdAt).toLocaleDateString('fr-FR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="sticky top-4 z-50 px-4 md:px-6">
      <div className="container mx-auto max-w-[1600px]">
        {/* Barre fixe épurée avec effet de flou */}
        <div
          className="
            bg-white/90 dark:bg-[#102238]/95
            backdrop-blur-2xl
            border border-[#E2E8F0]/80 dark:border-white/10
            shadow-sm
            rounded-2xl
            px-6 py-4
            flex items-center justify-between gap-4
            transition-all duration-300
          "
        >
          {/* Gauche : Titre de l'album & Métadonnées de base */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <h1
              className="
                text-lg md:text-xl
                font-bold
                text-[#172033] dark:text-white
                tracking-tight
                truncate
              "
            >
              {gallery.title}
            </h1>

            {/* Groupe Métadonnées (Masqué sur très petits écrans) */}
            <div
              className="
                hidden sm:flex items-center gap-3
                text-xs font-medium
                text-[#64748B] dark:text-white/60
                whitespace-nowrap
                bg-[#F5F7FA]/80 dark:bg-[#0E1C2D]/80
                px-3 py-1.5
                rounded-lg
                border border-[#E2E8F0] dark:border-white/10
              "
            >
              <time className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#004A87] opacity-80" />
                {formattedDate}
              </time>

              {gallery.mediaCount !== undefined && (
                <>
                  <span className="w-px h-3 bg-[#E2E8F0]" />

                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#004A87] opacity-80" />

                    <span className="tabular-nums">
                      {gallery.mediaCount}{' '}
                      {gallery.mediaCount > 1 ? 'médias' : 'média'}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Droite : Statut d'accès & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {gallery.visibility === 'password_protected' && (
              <div
                className="
                  flex items-center gap-2
                  px-3 py-1.5
                  rounded-lg
                  bg-[#FFF1E5]
                  border border-[#FF8201]/30
                  text-[#00345F]
                "
              >
                <Lock className="w-3.5 h-3.5 text-[#FF8201]" />

                <span className="text-xs font-semibold hidden md:inline">
                  Protégé
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
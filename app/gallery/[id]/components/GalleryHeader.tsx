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
    year: 'numeric' 
  });

  return (
    <header className="sticky top-4 z-50 px-4 md:px-6">
      <div className="container mx-auto max-w-[1600px]">
        {/* Barre fixe épurée avec effet de flou */}
        <div className="bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm rounded-2xl px-6 py-4 flex items-center justify-between gap-4 transition-all duration-300">
          
          {/* Gauche : Titre de l'album & Métadonnées de base */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight truncate">
              {gallery.title}
            </h1>
            
            {/* Groupe Métadonnées (Masqué sur très petits écrans) */}
            <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap bg-zinc-100/50 dark:bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50">
              <time className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                {formattedDate}
              </time>
              
              {gallery.mediaCount !== undefined && (
                <>
                  <span className="w-px h-3 bg-zinc-300 dark:bg-zinc-700"></span>
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 opacity-70" />
                    <span className="tabular-nums">
                      {gallery.mediaCount} {gallery.mediaCount > 1 ? 'médias' : 'média'}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Droite : Statut d'accès & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {gallery.visibility === 'password_protected' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 text-amber-700 dark:text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold hidden md:inline">Protégé</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
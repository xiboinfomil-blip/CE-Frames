import { GalleryDetail } from '@/types/types';
import { Calendar, Lock } from 'lucide-react';

interface GalleryHeaderProps {
  gallery: GalleryDetail;
}

export default function GalleryHeader({ gallery }: GalleryHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-6 py-8 max-w-[1600px]">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          
          {/* Left Content: Title & Meta */}
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter leading-[1.1]">
                {gallery.title}
              </h1>
              {gallery.visibility === 'password_protected' && (
                <div className="p-1.5 rounded-full bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-600 dark:text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
            
            {gallery.description && (
              <p className="text-base md:text-lg text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed max-w-2xl">
                {gallery.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 pt-2">
              <time className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2.5 py-1.5 rounded-md border border-zinc-200/60 dark:border-zinc-800/60">
                <Calendar className="w-3 h-3" />
                {new Date(gallery.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </time>
              
              {gallery.mediaCount !== undefined && (
                 <>
                  <span className="hidden md:inline w-px h-4 bg-zinc-200 dark:bg-zinc-800"></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-500">
                    {gallery.mediaCount} {gallery.mediaCount === 1 ? 'ASSET' : 'ASSETS'}
                  </span>
                 </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
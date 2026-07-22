// components/GalleryHeader.tsx
import { GalleryData } from '@/types/gallery';

interface GalleryHeaderProps {
  gallery: GalleryData;
}

export default function GalleryHeader({ gallery }: GalleryHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-slate-900">
      <div className="container mx-auto px-4 py-5 max-w-[1800px]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Left Content */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-slate-900 leading-none italic">
              {gallery.title}
            </h1>
            
            {gallery.description && (
              <p className="text-sm md:text-base text-slate-600 max-w-2xl font-medium leading-relaxed">
                {gallery.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                  {gallery.user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold uppercase tracking-wide text-slate-900">
                  {gallery.user.username}
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(gallery.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </span>
            </div>
          </div>

          {/* Racing Stripe Accent */}
          <div className="hidden lg:block">
            <div className="flex gap-1">
              <div className="w-2 h-16 bg-red-600"></div>
              <div className="w-2 h-16 bg-slate-900"></div>
              <div className="w-2 h-16 bg-red-600"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Racing stripe bottom border */}
      <div className="h-1 w-full bg-gradient-to-r from-red-600 via-slate-900 to-red-600"></div>
    </header>
  );
}
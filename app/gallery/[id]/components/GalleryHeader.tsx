import { GalleryDetail } from '@/types/types'; // Adjust import path if needed

interface GalleryHeaderProps {
  gallery: GalleryDetail;
}

export default function GalleryHeader({ gallery }: GalleryHeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 supports-backdrop-filter:bg-white/60">
      <div className="container mx-auto px-4 md:px-6 py-6 max-w-[1600px]">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          
          {/* Left Content: Title & Meta */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight leading-[1.1]">
              {gallery.title}
            </h1>
            
            {gallery.description && (
              <p className="text-base md:text-lg text-slate-600 font-normal leading-relaxed max-w-2xl">
                {gallery.description}
              </p>
            )}
            
            <div className="flex items-center gap-4 pt-2 text-sm text-slate-500">
              <time className="font-mono text-xs uppercase tracking-wider bg-slate-100 px-2 py-1 rounded-md">
                {new Date(gallery.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </time>
              
              <span className="hidden md:inline w-px h-4 bg-slate-200"></span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
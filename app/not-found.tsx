'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Aperture, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center px-6 relative overflow-hidden selection:bg-rose-500/30 selection:text-rose-900 dark:selection:bg-rose-500/30 dark:selection:text-rose-100">
      
      {/* Subtle Background Texture & Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-zinc-50 via-white to-white -z-10" />
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-zinc-100/50 rounded-full blur-3xl animate-fade-scale-in" style={{ animationDelay: '0ms' }} />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-zinc-50 rounded-full blur-3xl animate-fade-scale-in" style={{ animationDelay: '200ms' }} />

      <main className="max-w-2xl w-full text-center z-10 flex flex-col items-center">
        
        {/* Brand Badge Icon Container */}
        <div className="mb-8 p-6 bg-zinc-50 rounded-3xl border border-zinc-100 shadow-sm animate-slide-up" style={{ animationDelay: '0ms' }}>
          <Aperture className="w-12 h-12 text-rose-500" strokeWidth={1.5} />
        </div>

        {/* Typography */}
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-zinc-900 mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          404
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-500 font-light mb-12 max-w-md leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
          La galerie ou le cadre que vous cherchez est introuvable ou a été déplacé.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-slide-up" style={{ animationDelay: '300ms' }}>
          
          <button
            onClick={() => router.back()}
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-white border border-zinc-200 text-zinc-700 rounded-xl hover:border-zinc-300 hover:bg-zinc-50 transition-all duration-300 w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium text-xs uppercase tracking-widest">Retour</span>
          </button>

          <Link 
            href="/"
            className="group flex items-center justify-center gap-2 px-8 py-4 bg-zinc-900 text-white rounded-xl hover:bg-rose-600 hover:shadow-lg hover:shadow-rose-600/20 transition-all duration-300 w-full sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          >
            <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="font-medium text-xs uppercase tracking-widest">Accueil</span>
          </Link>
          
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="absolute bottom-8 text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] animate-fade-in" style={{ animationDelay: '500ms' }}>
        CE Frames &copy; {new Date().getFullYear()} • Galerie photo du CE
      </footer>
    </div>
  );
}
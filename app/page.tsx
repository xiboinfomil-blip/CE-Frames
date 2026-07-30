'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Camera, Flag, Heart, Aperture } from 'lucide-react';

// --- Utility Component for Scroll Animations ---
const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-rose-500/30 selection:text-rose-900 dark:selection:bg-rose-500/30 dark:selection:text-rose-100 overflow-x-hidden">
      
      {/* 2. HERO SECTION - Cinematic & Bold */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950">
        {/* Background Image with Parallax-like feel */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2800&auto=format&fit=crop" 
            alt="Cinematic car photography background" 
            fill
            priority
            className="object-cover opacity-70 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          />
          {/* Grain Overlay for Texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <div className="absolute inset-0 bg-linear-to-b from-zinc-950/30 via-transparent to-zinc-950/90" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center text-white">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 shadow-lg shadow-black/20">
              <Aperture className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/90">Est. 2026</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={100}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] mb-8 text-white drop-shadow-2xl">
              SPEED <br />
              <span className="text-zinc-400">&</span> <br />
              SOUL
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-lg md:text-xl text-zinc-300 max-w-xl mx-auto font-medium mb-12 leading-relaxed tracking-wide">
              High-octane motorsport coverage meets timeless wedding storytelling. 
              We capture the moments that move you.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/gallery" 
                className="group flex items-center gap-3 px-8 py-4 bg-white text-zinc-900 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all duration-300 shadow-xl shadow-black/20"
              >
                Explore
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/contact" 
                className="px-8 py-4 bg-transparent border border-white/20 text-white rounded-full font-bold text-sm uppercase tracking-widest hover:bg-white/10 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
              >
                Contact Us
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Scroll</span>
          <div className="w-px h-12 bg-linear-to-b from-white/50 to-transparent"></div>
        </div>
      </section>

      {/* 3. DUALITY INTRO - The "Why" */}
      <section className="py-24 md:py-32 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="space-y-8">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-[1.1]">
                  TWO WORLDS. <br />
                  <span className="text-zinc-400 dark:text-zinc-600">ONE VISION.</span>
                </h2>
                <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Whether it&apos;s the split-second precision of a race car hitting the apex or the tearful joy of a first look, we specialize in <strong className="text-zinc-900 dark:text-zinc-100">high-stakes photography</strong>. We don&apos;t just document events; we preserve the adrenaline and the emotion in equal measure.
                </p>
                <Link href="/about" className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold uppercase tracking-[0.15em] text-xs hover:gap-4 transition-all duration-300">
                  Read Our Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="relative aspect-square md:aspect-4/5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 group">
                <Image 
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop" 
                  alt="Photographer holding camera" 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Floating Badge - Camera Metadata Style */}
                <div className="absolute bottom-6 left-6 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md px-5 py-3 rounded-xl shadow-lg border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-zinc-500 dark:text-zinc-400 mb-0.5">Current Location</p>
                  <p className="text-sm font-black text-zinc-900 dark:text-zinc-100">Global Studio</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 4. PORTFOLIO PREVIEW - Asymmetric Grid */}
      <section className="py-24 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800/50">
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
          <FadeIn>
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="text-rose-600 dark:text-rose-400 font-bold uppercase tracking-[0.15em] text-xs mb-2 block">Selected Works</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">THE GALLERY</h2>
              </div>
              <Link href="/gallery" className="hidden md:flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-[0.15em] text-xs hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                View All Projects <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-150">
            {/* Large Feature Item */}
            <FadeIn delay={100} className="md:col-span-2 h-full min-h-100">
              <Link href="/gallery/motorsport" className="group relative block w-full h-full rounded-2xl overflow-hidden bg-zinc-900 shadow-lg">
                <Image 
                  src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop" 
                  alt="Motorsport Photography" 
                  fill
                  className="object-cover opacity-90 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />
                
                {/* Technical Overlay */}
                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest border border-white/10 hidden group-hover:block transition-all duration-300">
                  ISO 800 • 1/2000s • f/2.8
                </div>

                <div className="absolute bottom-0 left-0 p-8 md:p-12">
                  <Flag className="w-8 h-8 text-rose-500 mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">Motorsport</h3>
                  <p className="text-zinc-300 max-w-md font-medium">Raw power. Mechanical beauty. The chaos of the track frozen in time.</p>
                </div>
              </Link>
            </FadeIn>

            {/* Secondary Item */}
            <FadeIn delay={200} className="h-full min-h-100">
              <Link href="/gallery/weddings" className="group relative block w-full h-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <Image 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop" 
                  alt="Wedding Photography" 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 p-8">
                  <Heart className="w-8 h-8 text-white mb-4 drop-shadow-md" />
                  <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Weddings</h3>
                  <p className="text-white/90 text-sm font-medium drop-shadow-sm">Intimate. Editorial. Timeless.</p>
                </div>
              </Link>
            </FadeIn>
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <Link href="/gallery" className="inline-flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-[0.15em] text-xs hover:text-rose-600 dark:hover:text-rose-400 transition-colors">
                View All Projects <ArrowRight className="w-4 h-4" />
              </Link>
          </div>
        </div>
      </section>

      {/* 5. SERVICES STRIP */}
      <section className="py-24 bg-white dark:bg-zinc-950">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <FadeIn>
              <div className="p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors duration-300 group">
                <Camera className="w-10 h-10 text-zinc-900 dark:text-zinc-100 mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Editorial Coverage</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  From grid walks to podium sprays, we provide comprehensive coverage that teams and sponsors love. High-resolution, fast turnaround.
                </p>
                <ul className="space-y-3 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> Trackside Action</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> Pit Lane Details</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> Driver Portraits</li>
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="p-8 md:p-12 rounded-3xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-rose-200 dark:hover:border-rose-900/50 transition-colors duration-300 group">
                <Heart className="w-10 h-10 text-zinc-900 dark:text-zinc-100 mb-6 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Wedding Storytelling</h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                  We don&apos;t just take pictures; we tell your story. Candid, unposed, and deeply emotional coverage of your most important day.
                </p>
                <ul className="space-y-3 text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> Full Day Coverage</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> Engagement Sessions</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-rose-500 rounded-full"></div> Private Online Gallery</li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </main>
  );
}
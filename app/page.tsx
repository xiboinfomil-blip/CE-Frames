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
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      

      {/* 2. HERO SECTION - Cinematic & Bold */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-slate-900">
        {/* Background Image with Parallax-like feel */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2800&auto=format&fit=crop" 
            alt="Cinematic car photography background" 
            fill
            priority
            className="object-cover opacity-60 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/90" />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center text-white">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/10 backdrop-blur-md mb-8">
              <Aperture className="w-3 h-3 text-red-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Est. 2024</span>
            </div>
          </FadeIn>
          
          <FadeIn delay={100}>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none mb-6">
              SPEED <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">&</span> <br />
              SOUL
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <p className="text-lg md:text-xl text-slate-300 max-w-xl mx-auto font-medium mb-10 leading-relaxed">
              High-octane motorsport coverage meets timeless wedding storytelling. 
              We capture the moments that move you.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/gallery" 
                className="group flex items-center gap-2 px-8 py-4 bg-red-600 text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-red-700 transition-all duration-300 shadow-lg shadow-red-900/20"
              >
                View Portfolio
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/contact" 
                className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold text-sm uppercase tracking-wider hover:bg-white hover:text-slate-900 transition-all duration-300 backdrop-blur-sm"
              >
                Book Now
              </Link>
            </div>
          </FadeIn>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/50 animate-bounce">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent"></div>
        </div>
      </section>

      {/* 3. DUALITY INTRO - The "Why" */}
      <section className="py-24 md:py-32 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="space-y-8">
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
                  TWO WORLDS. <br />
                  <span className="text-slate-400">ONE VISION.</span>
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Whether it's the split-second precision of a race car hitting the apex or the tearful joy of a first look, we specialize in <strong className="text-slate-900">high-stakes photography</strong>. We don't just document events; we preserve the adrenaline and the emotion in equal measure.
                </p>
                <Link href="/about" className="inline-flex items-center gap-2 text-red-600 font-bold uppercase tracking-widest text-sm hover:gap-4 transition-all duration-300">
                  Read Our Story <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="relative aspect-square md:aspect-[4/5] bg-slate-100 rounded-2xl overflow-hidden shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop" 
                  alt="Photographer holding camera" 
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                />
                {/* Floating Badge */}
                <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur px-6 py-4 rounded-xl shadow-lg border border-slate-100">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Current Location</p>
                  <p className="text-lg font-black text-slate-900">Global Studio</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 4. PORTFOLIO PREVIEW - Asymmetric Grid */}
      <section className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
          <FadeIn>
            <div className="flex items-end justify-between mb-16">
              <div>
                <span className="text-red-600 font-bold uppercase tracking-widest text-xs mb-2 block">Selected Works</span>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900">THE GALLERY</h2>
              </div>
              <Link href="/gallery" className="hidden md:flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-sm hover:text-red-600 transition-colors">
                View All Projects <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            {/* Large Feature Item */}
            <FadeIn delay={100} className="md:col-span-2 h-full min-h-[400px]">
              <Link href="/gallery/motorsport" className="group relative block w-full h-full rounded-2xl overflow-hidden bg-slate-900">
                <Image 
                  src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop" 
                  alt="Motorsport Photography" 
                  fill
                  className="object-cover opacity-80 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 md:p-12">
                  <Flag className="w-8 h-8 text-red-500 mb-4" />
                  <h3 className="text-3xl font-bold text-white mb-2">Motorsport</h3>
                  <p className="text-slate-300 max-w-md">Raw power. Mechanical beauty. The chaos of the track frozen in time.</p>
                </div>
              </Link>
            </FadeIn>

            {/* Secondary Item */}
            <FadeIn delay={200} className="h-full min-h-[400px]">
              <Link href="/gallery/weddings" className="group relative block w-full h-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image 
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=800&auto=format&fit=crop" 
                  alt="Wedding Photography" 
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 p-8">
                  <Heart className="w-8 h-8 text-white mb-4 drop-shadow-md" />
                  <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">Weddings</h3>
                  <p className="text-white/90 text-sm font-medium">Intimate. Editorial. Timeless.</p>
                </div>
              </Link>
            </FadeIn>
          </div>
          
          <div className="mt-8 text-center md:hidden">
             <Link href="/gallery" className="inline-flex items-center gap-2 text-slate-900 font-bold uppercase tracking-widest text-sm hover:text-red-600 transition-colors">
                View All Projects <ArrowRight className="w-4 h-4" />
              </Link>
          </div>
        </div>
      </section>

      {/* 5. SERVICES STRIP */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <FadeIn>
              <div className="p-8 md:p-12 rounded-3xl bg-slate-50 border border-slate-100 hover:border-red-200 transition-colors duration-300">
                <Camera className="w-10 h-10 text-slate-900 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Editorial Coverage</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  From grid walks to podium sprays, we provide comprehensive coverage that teams and sponsors love. High-resolution, fast turnaround.
                </p>
                <ul className="space-y-3 text-sm font-medium text-slate-500">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Trackside Action</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Pit Lane Details</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Driver Portraits</li>
                </ul>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <div className="p-8 md:p-12 rounded-3xl bg-slate-50 border border-slate-100 hover:border-red-200 transition-colors duration-300">
                <Heart className="w-10 h-10 text-slate-900 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Wedding Storytelling</h3>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  We don't just take pictures; we tell your story. Candid, unposed, and deeply emotional coverage of your most important day.
                </p>
                <ul className="space-y-3 text-sm font-medium text-slate-500">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Full Day Coverage</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Engagement Sessions</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Private Online Gallery</li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* 6. FOOTER CTA */}
      <section className="py-32 bg-slate-900 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8">
              READY TO CREATE?
            </h2>
            <p className="text-slate-400 text-lg mb-12 max-w-xl mx-auto">
              Whether you're chasing podiums or saying "I do", let's make something timeless together.
            </p>
            <Link 
              href="/contact" 
              className="inline-flex items-center gap-3 px-10 py-5 bg-white text-slate-900 rounded-full font-bold text-sm uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all duration-300 shadow-2xl"
            >
              Start Your Project
              <ArrowRight className="w-5 h-5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* SIMPLE FOOTER */}
      <footer className="bg-slate-950 text-slate-500 py-12 border-t border-slate-900">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-white font-black tracking-tighter text-xl">
            ORAMA<span className="text-red-600">.</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} Orama Creativ. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Instagram</Link>
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">Email</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
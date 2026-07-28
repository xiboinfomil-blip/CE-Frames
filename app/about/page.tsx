'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Aperture, Flag, Heart, Star } from 'lucide-react';

// --- Utility Component for Scroll Animations ---
const FadeIn = ({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-red-600 selection:text-white">
      
      {/* 1. EDITORIAL HERO - Different from Home */}
      {/* Instead of a centered title, we use a split layout with a large portrait */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-end">
          
          <div className="lg:col-span-7 space-y-8">
            <FadeIn>
              <span className="flex items-center gap-2 text-red-600 font-bold uppercase tracking-widest text-sm mb-4">
                <Aperture className="w-4 h-4" />
                The Studio
              </span>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900">
                WE DON'T JUST <br />
                <span className="text-slate-300">TAKE PHOTOS.</span> <br />
                WE PRESERVE <br />
                ADRENALINE.
              </h1>
            </FadeIn>
            
            <FadeIn delay={200}>
              <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed max-w-xl border-l-4 border-red-600 pl-6">
                Orama Creativ was born from a simple obsession: capturing the fraction of a second where human emotion peaks.
              </p>
            </FadeIn>
          </div>

          <div className="lg:col-span-5 relative">
            <FadeIn delay={400}>
              <div className="relative aspect-[4/5] rounded-none overflow-hidden bg-slate-100 shadow-2xl">
                <Image 
                  src="https://images.unsplash.com/photo-1552168324-d612d77725e3?q=80&w=800&auto=format&fit=crop" 
                  alt="Photographer in action" 
                  fill
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                />
                <div className="absolute bottom-0 left-0 bg-white px-6 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-900">Behind the Lens</p>
                  <p className="text-sm text-slate-500">Orama Team</p>
                </div>
              </div>
            </FadeIn>
          </div>

        </div>
      </section>

      {/* 2. THE DUALITY NARRATIVE - Text Heavy Editorial */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 md:px-12 max-w-4xl">
          <FadeIn>
            <div className="prose prose-lg prose-slate max-w-none">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">The Unlikely Pair</h2>
              <p className="text-slate-600 leading-loose mb-6">
                People often ask us how we switch between the deafening roar of a GT3 race car and the hushed silence of a wedding ceremony. To us, they aren't different jobs. They are the same pursuit.
              </p>
              <p className="text-slate-600 leading-loose mb-6">
                In motorsport, you have one chance. If you miss the apex, the shot is gone forever. In weddings, the first kiss happens once. The tear falls once. The champagne pops once. 
              </p>
              <p className="text-slate-600 leading-loose">
                <strong className="text-slate-900">We specialize in high-stakes photography.</strong> We bring the technical precision of track-side shooting to your wedding day, and the emotional sensitivity of portraiture to the pit lane.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 3. SERVICES BREAKDOWN - Asymmetric Cards */}
      <section className="py-24 md:py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
          
          {/* Motorsport Section */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center mb-32">
            <div className="w-full md:w-1/2 order-2 md:order-1">
              <FadeIn>
                <div className="relative aspect-video bg-slate-100 rounded-sm overflow-hidden">
                   <Image 
                    src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop" 
                    alt="Racecar on track" 
                    fill
                    className="object-cover"
                  />
                  {/* Technical Overlay */}
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur text-white px-3 py-1 text-[10px] font-mono uppercase tracking-widest">
                    ISO 800 • 1/2000s • f/2.8
                  </div>
                </div>
              </FadeIn>
            </div>
            <div className="w-full md:w-1/2 order-1 md:order-2 space-y-6">
              <FadeIn delay={100}>
                <Flag className="w-8 h-8 text-red-600 mb-4" />
                <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">MOTORSPORT</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  We speak the language of the track. From historic rallies to modern GT championships, we capture the mechanical violence and the driver's focus. Our images are used by teams for sponsorship decks and by drivers for their portfolios.
                </p>
                <ul className="space-y-2 mt-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Trackside Action</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Pit Lane Details</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Driver Portraits</li>
                </ul>
              </FadeIn>
            </div>
          </div>

          {/* Wedding Section */}
          <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center">
            <div className="w-full md:w-1/2 space-y-6">
              <FadeIn>
                <Heart className="w-8 h-8 text-red-600 mb-4" />
                <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">WEDDINGS</h3>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Your day moves faster than a race car. We keep up. We don't interrupt your moments with awkward posing instructions. We move through the shadows, capturing the raw, unfiltered joy of your celebration with a cinematic, editorial eye.
                </p>
                <ul className="space-y-2 mt-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Candid Storytelling</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> Editorial Portraits</li>
                  <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-red-600 rounded-full"></div> High-Speed Reception</li>
                </ul>
              </FadeIn>
            </div>
            <div className="w-full md:w-1/2">
              <FadeIn delay={100}>
                <div className="relative aspect-[3/4] bg-slate-100 rounded-sm overflow-hidden">
                   <Image 
                    src="https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop" 
                    alt="Wedding couple" 
                    fill
                    className="object-cover"
                  />
                </div>
              </FadeIn>
            </div>
          </div>

        </div>
      </section>

      {/* 4. THE PROCESS / TIMELINE */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="container mx-auto px-6 md:px-12 max-w-7xl">
          <FadeIn>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center">How We Work</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-slate-800 z-0" />

            {[
              { title: "01. The Brief", desc: "We learn your style. Are you moody and dark? Bright and airy? Fast and gritty? We tailor our gear and approach." },
              { title: "02. The Shoot", desc: "We arrive early. We scout the light. We stay late. We work with military precision to ensure no moment is missed." },
              { title: "03. The Edit", desc: "Our signature look. High contrast, rich colors, and timeless black & whites. Delivered via a private online gallery." }
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="relative z-10 bg-slate-900 pt-8">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-6 border-4 border-slate-900">
                    <Star className="w-6 h-6 text-red-500 fill-red-500" />
                  </div>
                  <h3 className="text-xl font-bold uppercase tracking-widest mb-4">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. MINIMAL CTA */}
      <section className="py-32 bg-white text-center">
        <div className="container mx-auto px-6">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 mb-8">
              READY TO SHOOT?
            </h2>
            <p className="text-slate-600 text-lg mb-10 max-w-xl mx-auto">
              Whether it's the Nürburgring or a vineyard in Tuscany, we're ready to travel.
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 px-10 py-4 bg-slate-900 text-white rounded-full font-bold uppercase tracking-widest hover:bg-red-600 transition-colors duration-300"
            >
              Get in Touch
              <ArrowRight className="w-4 h-4" />
            </a>
          </FadeIn>
        </div>
      </section>

    </main>
  );
}
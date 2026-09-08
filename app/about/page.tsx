'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, Building2, Users, PartyPopper, Camera } from 'lucide-react';
import ContactModal from '@/components/ContactModal'; // Adjust path as needed

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
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-white text-slate-900 font-sans selection:bg-rose-500/30 selection:text-rose-900 dark:selection:bg-rose-500/30 dark:selection:text-rose-100 dark:bg-slate-950 dark:text-slate-100">
        
        {/* 1. EDITORIAL HERO - Split Layout */}
        <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-6 md:px-12 max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-end">
            
            <div className="lg:col-span-7 space-y-8">
              <FadeIn>
                <span className="inline-flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold uppercase tracking-[0.15em] text-xs mb-4 border border-rose-200 dark:border-rose-900/50 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  Comité d&apos;Entreprise & Corporate Events
                </span>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-slate-900 dark:text-slate-100">
                  WE DON&apos;T JUST <br />
                  <span className="text-slate-400 dark:text-slate-600">DOCUMENT EVENTS.</span> <br />
                  WE CELEBRATE <br />
                  YOUR CULTURE.
                </h1>
              </FadeIn>
              
              <FadeIn delay={200}>
                <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-xl border-l-2 border-rose-500 pl-6">
                  Transforming corporate gatherings, team retreats, and CSE galas into vibrant visual archives that build company pride.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-5 relative">
              <FadeIn delay={400}>
                <div className="relative aspect-4/5 overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 group rounded-xl">
                  <Image 
                    src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=800&auto=format&fit=crop" 
                    alt="Corporate event celebration" 
                    fill
                    className="object-cover transition-all duration-700 ease-in-out scale-100 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 backdrop-blur-md px-6 py-4 border-t border-slate-800 text-white">
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-rose-400">CSE Event Photography</p>
                    <p className="text-xs text-slate-300 mt-0.5">Capturing corporate memories • Est. 2026</p>
                  </div>
                </div>
              </FadeIn>
            </div>

          </div>
        </section>

        {/* 2. THE MISSION NARRATIVE */}
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 border-y border-slate-100 dark:border-slate-800/50">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <FadeIn>
              <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 mb-8 tracking-tight">
                  More Than Just Company Snapshots
                </h2>
                <p className="text-slate-600 dark:text-slate-400 leading-loose mb-6">
                  Works Council (CSE) events are the heartbeat of workplace culture. From end-of-year galas and family fun days to team-building workshops and milestone anniversaries, these moments strengthen bonds and define your company spirit.
                </p>
                <p className="text-slate-600 dark:text-slate-400 leading-loose mb-6">
                  We blend high-end event photojournalism with modern digital gallery management. Employees get instant access to polished, shareable memories, while your internal communications team gains a rich library of authentic assets.
                </p>
                <p className="text-slate-900 dark:text-slate-200 leading-loose font-medium">
                  Discreet, professional, and endlessly engaging — we ensure every employee feels valued and every highlight is preserved.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* 3. EVENT CATEGORIES - Asymmetric Cards */}
        <section className="py-24 md:py-32 bg-white dark:bg-slate-950 overflow-hidden">
          <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
            
            {/* Galas & Celebrations Section */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center mb-32">
              <div className="w-full md:w-1/2 order-2 md:order-1">
                <FadeIn>
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 overflow-hidden group shadow-lg rounded-xl">
                     <Image 
                      src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop" 
                      alt="Company Annual Gala" 
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-slate-950/70 backdrop-blur-md text-white px-3 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-widest border border-white/10">
                      Galas • Award Nights • Year-End Parties
                    </div>
                  </div>
                </FadeIn>
              </div>
              <div className="w-full md:w-1/2 order-1 md:order-2 space-y-6">
                <FadeIn delay={100}>
                  <PartyPopper className="w-8 h-8 text-rose-600 dark:text-rose-400 mb-4" />
                  <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">GALAS & CELEBRATIONS</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    From red-carpet entrances to award ceremonies and dance floors, we capture the glamour and joy of your major corporate celebrations with premium, editorial lighting.
                  </p>
                  <ul className="space-y-3 mt-6 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> Red Carpet & Step-and-Repeats</li>
                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> Keynote & Award Moments</li>
                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> High-Energy Party Coverage</li>
                  </ul>
                </FadeIn>
              </div>
            </div>

            {/* Team Building & Family Days Section */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-center">
              <div className="w-full md:w-1/2 space-y-6">
                <FadeIn>
                  <Users className="w-8 h-8 text-rose-600 dark:text-rose-400 mb-4" />
                  <h3 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-slate-100">TEAM DAYS & FAMILY EVENTS</h3>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    Outdoor retreats, summer barbecues, and family days organized by the CSE require candid, dynamic coverage. We capture authentic smiles, competitive spirits, and relaxed interactions.
                  </p>
                  <ul className="space-y-3 mt-6 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> Candid Team Interactions</li>
                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> Interactive Activity Highlights</li>
                    <li className="flex items-center gap-3"><div className="w-2 h-2 bg-rose-500 rounded-full"></div> On-Site Photo Booth Add-ons</li>
                  </ul>
                </FadeIn>
              </div>
              <div className="w-full md:w-1/2">
                <FadeIn delay={100}>
                  <div className="relative aspect-3/4 bg-slate-100 dark:bg-slate-900 overflow-hidden group shadow-lg rounded-xl">
                     <Image 
                      src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop" 
                      alt="Team building retreat" 
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                </FadeIn>
              </div>
            </div>

          </div>
        </section>

        {/* 4. THE PROCESS / WORKFLOW */}
        <section className="py-24 bg-slate-900 dark:bg-black text-white">
          <div className="container mx-auto px-6 md:px-12 max-w-7xl">
            <FadeIn>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-16 text-center">Seamless Workflow</h2>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-8 left-0 right-0 h-px bg-slate-800 z-0" />

              {[
                { title: "01. Event Brief", desc: "We align with your CSE committee to review event schedules, key milestones, branding requirements, and special VIP requests." },
                { title: "02. Live Capture", desc: "Our experienced photographers blend seamlessly into your event, capturing organic reactions without disturbing guests." },
                { title: "03. Secure Gallery", desc: "Fast turnaround delivery via a password-protected, branded web gallery with instant downloads for all employees." }
              ].map((step, i) => (
                <FadeIn key={i} delay={i * 150}>
                  <div className="relative z-10 bg-slate-900 dark:bg-black pt-8">
                    <div className="w-16 h-16 bg-slate-800 dark:bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-700 dark:border-slate-800 shadow-lg">
                      <Building2 className="w-6 h-6 text-rose-400" />
                    </div>
                    <h3 className="text-lg font-bold uppercase tracking-[0.15em] mb-4 text-slate-100">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* 5. MINIMAL CTA */}
        <section className="py-32 bg-white dark:bg-slate-950 text-center">
          <div className="container mx-auto px-6">
            <FadeIn>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-slate-100 mb-8">
                PLANNING YOUR NEXT EVENT?
              </h2>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 max-w-xl mx-auto font-medium">
                Let&apos;s collaborate to make your next Comité d&apos;Entreprise event unforgettable.
              </p>
              <button 
                onClick={() => setIsContactOpen(true)}
                className="group inline-flex items-center gap-3 px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-rose-500/25 hover:-translate-y-1 cursor-pointer"
              >
                Book Your Event
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </FadeIn>
          </div>
        </section>

      </main>

      {/* Contact Modal Integration */}
      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
      />
    </>
  );
}
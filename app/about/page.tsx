'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Camera,
  Heart,
  Images,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const FadeIn = ({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
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
        isVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default function AboutPage() {
  return (
    <main
      className="
        min-h-screen
        bg-white
        text-[#172033]
        font-sans
        transition-colors duration-300
        dark:bg-[#0B1624]
        dark:text-white
      "
    >

      {/* =========================================================
          HERO
      ========================================================= */}
      <section
        className="
          relative overflow-hidden
          px-6 pb-20 pt-28
          md:px-12 md:pb-32 md:pt-40
        "
      >
        {/* Decorative background */}
        <div
          className="
            pointer-events-none
            absolute -right-32 -top-32
            h-96 w-96 rounded-full
            bg-[#EAF4FB]
            blur-3xl
            dark:bg-[#00345F]/30
          "
        />

        <div
          className="
            pointer-events-none
            absolute -bottom-32 -left-32
            h-80 w-80 rounded-full
            bg-[#FFF1E5]
            blur-3xl
            dark:bg-[#FF8201]/10
          "
        />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-24">

            {/* Text */}
            <FadeIn>
              <div className="max-w-2xl">

                {/* Brand badge */}
                <div
                  className="
                    mb-7 inline-flex items-center gap-2
                    rounded-full
                    border border-[#E2E8F0]
                    bg-[#EAF4FB]
                    px-4 py-2
                    text-xs font-bold uppercase
                    tracking-[0.15em]
                    text-[#004A87]
                    shadow-sm
                    dark:border-[#004A87]/40
                    dark:bg-[#00345F]/40
                    dark:text-[#FF8201]
                  "
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  CE Frames
                </div>

                {/* Heading */}
                <h1
                  className="
                    text-5xl font-black
                    leading-[0.95]
                    tracking-[-0.045em]
                    md:text-7xl
                  "
                >
                  LES MOMENTS
                  <br />

                  <span className="text-[#004A87]/25 dark:text-white/20">
                    QUI MÉRITENT
                  </span>

                  <br />

                  <span className="text-[#004A87] dark:text-white">
                    D&apos;ÊTRE GARDÉS.
                  </span>
                </h1>

                {/* Accent line */}
                <div className="mt-8 flex items-center gap-3">
                  <div className="h-1 w-12 rounded-full bg-[#FF8201]" />
                  <div className="h-1 w-20 rounded-full bg-[#004A87]" />
                </div>

                {/* Intro */}
                <p
                  className="
                    mt-8 max-w-xl
                    border-l-4 border-[#FF8201]
                    pl-6
                    text-lg leading-relaxed
                    text-[#172033]/80
                    dark:text-white/75
                    md:text-xl
                  "
                >
                  CE Frames est la galerie photo interne du Comité
                  d&apos;Entreprise d&apos;Infomil Mauritius.
                </p>

                <p
                  className="
                    mt-6 max-w-xl
                    text-base leading-relaxed
                    text-[#64748B]
                    dark:text-white/50
                  "
                >
                  Les galeries rassemblent les photos des événements passés
                  pour permettre aux collaborateurs de les retrouver,
                  les consulter et les partager.
                </p>

                {/* Small brand detail */}
                <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-[#004A87] dark:text-[#FF8201]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF1E5] dark:bg-[#FF8201]/10">
                    <Camera className="h-4 w-4" />
                  </div>

                  <span>Des souvenirs, une équipe, une histoire.</span>
                </div>

              </div>
            </FadeIn>

            {/* Image */}
            <FadeIn delay={200}>
              <div
                className="
                  group relative
                  aspect-[4/5]
                  overflow-hidden
                  rounded-[2rem]
                  bg-[#EAF4FB]
                  shadow-2xl
                  shadow-[#004A87]/15
                  dark:bg-[#00345F]
                  dark:shadow-black/40
                "
              >
                <Image
                  src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop"
                  alt="Événement d'entreprise"
                  fill
                  priority
                  className="
                    object-cover
                    transition-transform
                    duration-700
                    group-hover:scale-105
                  "
                />

                {/* Blue/orange image overlay */}
                <div
                  className="
                    absolute inset-0
                    bg-gradient-to-t
                    from-[#00345F]/90
                    via-[#00345F]/20
                    to-transparent
                  "
                />

                {/* Orange accent */}
                <div
                  className="
                    absolute right-6 top-6
                    h-14 w-14
                    rounded-2xl
                    border border-white/20
                    bg-[#FF8201]
                    shadow-xl
                    shadow-black/20
                  "
                />

                {/* Image caption */}
                <div
                  className="
                    absolute inset-x-0 bottom-0
                    px-7 pb-7 pt-20
                  "
                >
                  <div className="mb-3 flex items-center gap-2">
                    <div className="h-1 w-8 rounded-full bg-[#FF8201]" />

                    <p
                      className="
                        text-[10px] font-bold uppercase
                        tracking-[0.2em]
                        text-[#FFB15C]
                      "
                    >
                      CE Frames
                    </p>
                  </div>

                  <p className="text-sm text-white/80">
                    Les souvenirs du Comité d&apos;Entreprise
                  </p>
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>


      {/* =========================================================
          WHAT IS CE FRAMES
      ========================================================= */}
      <section
        className="
          border-y
          border-[#E2E8F0]
          bg-[#F5F7FA]
          py-24
          dark:border-white/10
          dark:bg-[#0E1C2D]
        "
      >
        <div className="mx-auto max-w-4xl px-6 md:px-12">

          <FadeIn>
            <div className="text-center">

              {/* Icon */}
              <div
                className="
                  mx-auto mb-7
                  flex h-14 w-14
                  items-center justify-center
                  rounded-2xl
                  bg-[#EAF4FB]
                  text-[#004A87]
                  shadow-sm
                  dark:bg-[#00345F]
                  dark:text-[#FF8201]
                "
              >
                <Camera className="h-7 w-7" />
              </div>

              <p
                className="
                  mb-4 text-xs font-bold uppercase
                  tracking-[0.2em]
                  text-[#FF8201]
                "
              >
                Notre galerie
              </p>

              <h2
                className="
                  text-3xl font-bold
                  tracking-tight
                  md:text-5xl
                "
              >
                Une galerie pour
                <br />

                <span className="text-[#004A87]/35 dark:text-white/25">
                  nos moments partagés.
                </span>
              </h2>

              <p
                className="
                  mx-auto mt-8 max-w-2xl
                  text-base leading-loose
                  text-[#64748B]
                  dark:text-white/55
                  md:text-lg
                "
              >
                CE Frames a été pensé comme un espace simple pour
                retrouver, découvrir et partager les photos des événements
                du Comité d&apos;Entreprise d&apos;Infomil Mauritius.
              </p>

              <p
                className="
                  mx-auto mt-5 max-w-2xl
                  text-base leading-loose
                  text-[#64748B]
                  dark:text-white/55
                  md:text-lg
                "
              >
                Plutôt qu&apos;une simple collection de photos, c&apos;est
                une mémoire visuelle de la vie collective chez Infomil
                Mauritius.
              </p>

              {/* Decorative line */}
              <div className="mx-auto mt-10 flex justify-center gap-2">
                <div className="h-1 w-10 rounded-full bg-[#004A87]" />
                <div className="h-1 w-4 rounded-full bg-[#FF8201]" />
              </div>

            </div>
          </FadeIn>

        </div>
      </section>


      {/* =========================================================
          VALUES
      ========================================================= */}
      <section
        className="
          bg-white
          py-24
          dark:bg-[#0B1624]
          md:py-32
        "
      >
        <div className="mx-auto max-w-7xl px-6 md:px-12">

          <FadeIn>
            <div className="mb-16 max-w-2xl">

              <p
                className="
                  mb-4 text-xs font-bold uppercase
                  tracking-[0.2em]
                  text-[#FF8201]
                "
              >
                CE Frames
              </p>

              <h2
                className="
                  text-4xl font-black
                  tracking-[-0.04em]
                  md:text-6xl
                "
              >
                DES PHOTOS.
                <br />

                <span className="text-[#004A87] dark:text-white">
                  DES SOUVENIRS.
                </span>

                <br />

                <span className="text-[#004A87]/25 dark:text-white/20">
                  DES MOMENTS ENSEMBLE.
                </span>
              </h2>

            </div>
          </FadeIn>


          <div className="grid gap-6 md:grid-cols-3">

            {/* Gallery */}
            <FadeIn delay={100}>
              <div
                className="
                  group h-full
                  rounded-3xl
                  border border-[#E2E8F0]
                  bg-white
                  p-8
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#004A87]/30
                  hover:shadow-xl
                  hover:shadow-[#004A87]/10
                  dark:border-white/10
                  dark:bg-[#102238]
                  dark:hover:border-[#004A87]
                "
              >
                <div
                  className="
                    mb-8 flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-[#EAF4FB]
                    text-[#004A87]
                    transition-colors
                    group-hover:bg-[#004A87]
                    group-hover:text-white
                    dark:bg-[#00345F]
                    dark:text-white
                    dark:group-hover:bg-[#FF8201]
                  "
                >
                  <Images className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold text-[#172033] dark:text-white">
                  Tous les souvenirs
                </h3>

                <p
                  className="
                    mt-4 text-sm leading-relaxed
                    text-[#64748B]
                    dark:text-white/50
                  "
                >
                  Retrouvez les photos des différents événements
                  du Comité d&apos;Entreprise au même endroit.
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#004A87] dark:text-[#FF8201]">
                  <span>Explorer les moments</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </FadeIn>


            {/* Moments */}
            <FadeIn delay={200}>
              <div
                className="
                  group h-full
                  rounded-3xl
                  border border-[#E2E8F0]
                  bg-white
                  p-8
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#FF8201]/40
                  hover:shadow-xl
                  hover:shadow-[#FF8201]/10
                  dark:border-white/10
                  dark:bg-[#102238]
                  dark:hover:border-[#FF8201]
                "
              >
                <div
                  className="
                    mb-8 flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-[#FFF1E5]
                    text-[#FF8201]
                    transition-colors
                    group-hover:bg-[#FF8201]
                    group-hover:text-white
                    dark:bg-[#FF8201]/10
                    dark:group-hover:bg-[#FF8201]
                  "
                >
                  <Camera className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold text-[#172033] dark:text-white">
                  Des moments authentiques
                </h3>

                <p
                  className="
                    mt-4 text-sm leading-relaxed
                    text-[#64748B]
                    dark:text-white/50
                  "
                >
                  Des sourires, des rencontres et des moments
                  spontanés qui racontent la vie chez Infomil.
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#004A87] dark:text-[#FF8201]">
                  <span>Revivre les instants</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </FadeIn>


            {/* Sharing */}
            <FadeIn delay={300}>
              <div
                className="
                  group h-full
                  rounded-3xl
                  border border-[#E2E8F0]
                  bg-white
                  p-8
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-[#004A87]/30
                  hover:shadow-xl
                  hover:shadow-[#004A87]/10
                  dark:border-white/10
                  dark:bg-[#102238]
                  dark:hover:border-[#004A87]
                "
              >
                <div
                  className="
                    mb-8 flex h-12 w-12
                    items-center justify-center
                    rounded-2xl
                    bg-[#EAF4FB]
                    text-[#004A87]
                    transition-colors
                    group-hover:bg-[#004A87]
                    group-hover:text-white
                    dark:bg-[#00345F]
                    dark:text-white
                    dark:group-hover:bg-[#FF8201]
                  "
                >
                  <Heart className="h-6 w-6" />
                </div>

                <h3 className="text-xl font-bold text-[#172033] dark:text-white">
                  À partager
                </h3>

                <p
                  className="
                    mt-4 text-sm leading-relaxed
                    text-[#64748B]
                    dark:text-white/50
                  "
                >
                  Parce que les meilleurs souvenirs sont ceux que
                  l&apos;on peut revivre et partager ensemble.
                </p>

                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#004A87] dark:text-[#FF8201]">
                  <span>Partager les souvenirs</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </FadeIn>

          </div>
        </div>
      </section>


      {/* =========================================================
          EVENTS
      ========================================================= */}
      <section
        className="
          relative overflow-hidden
          bg-[#00345F]
          py-24 text-white
          md:py-32
        "
      >
        {/* Background decorations */}
        <div
          className="
            pointer-events-none
            absolute -right-40 -top-40
            h-96 w-96
            rounded-full
            bg-[#004A87]
            opacity-60
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute -bottom-40 -left-40
            h-96 w-96
            rounded-full
            bg-[#FF8201]
            opacity-20
            blur-3xl
          "
        />

        <div className="relative mx-auto max-w-5xl px-6 text-center">

          <FadeIn>

            <div
              className="
                mx-auto mb-6
                flex h-12 w-12
                items-center justify-center
                rounded-2xl
                bg-[#FF8201]
                shadow-lg
                shadow-black/20
              "
            >
              <Sparkles className="h-5 w-5 text-white" />
            </div>

            <p
              className="
                mb-5 text-xs font-bold uppercase
                tracking-[0.2em]
                text-[#FFB15C]
              "
            >
              L&apos;archive du CE
            </p>

            <h2
              className="
                text-4xl font-black
                tracking-[-0.04em]
                md:text-6xl
              "
            >
              CHAQUE GALERIE
              <br />

              <span className="text-white/30">
                A SON HISTOIRE.
              </span>
            </h2>

            <p
              className="
                mx-auto mt-7 max-w-2xl
                text-base leading-relaxed
                text-white/60
              "
            >
              Des moments du quotidien aux grandes célébrations,
              chaque galerie conserve une trace de la vie collective.
            </p>

            <div
              className="
                mx-auto mt-12
                flex max-w-3xl
                flex-wrap
                justify-center
                gap-3
              "
            >
              {[
                'Fêtes de fin d’année',
                'Happy Hours',
                'Petits-déjeuners',
                'Journées d’équipe',
                'Team Building',
                'Événements spéciaux',
              ].map((event, index) => (
                <span
                  key={event}
                  className={`
                    rounded-full
                    border
                    px-5 py-2.5
                    text-sm
                    transition-all duration-300
                    ${
                      index === 0
                        ? 'border-[#FF8201] bg-[#FF8201] text-white shadow-lg shadow-[#FF8201]/20'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/25 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  {event}
                </span>
              ))}
            </div>

            {/* Bottom accent */}
            <div className="mx-auto mt-14 flex justify-center gap-2">
              <div className="h-1 w-16 rounded-full bg-[#FF8201]" />
              <div className="h-1 w-5 rounded-full bg-white/30" />
            </div>

          </FadeIn>

        </div>
      </section>

    </main>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  Users,
  Aperture,
  Images,
} from 'lucide-react';
import ContactModal from '@/components/ContactModal';
import MediaViewport from '@/components/media-viewport';
import { LatestPublicGallery } from '@/lib/db-helpers';

// ============================================================
// PROPS
// ============================================================

interface HomeProps {
  latestGalleries: LatestPublicGallery[];
}

// ============================================================
// UTILITY COMPONENT
// ============================================================

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

  useEffect(() => {
    const timer = setTimeout(
      () => setIsVisible(true),
      delay
    );

    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
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

// ============================================================
// HOME
// ============================================================

export default function Home({
  latestGalleries,
}: HomeProps) {
  const [isContactOpen, setIsContactOpen] =
    useState(false);

  return (
    <>
      <main
        className="
          min-h-screen
          overflow-x-hidden
          bg-white
          font-sans
          text-[#172033]
          selection:bg-[#FF8201]/30
          selection:text-[#00345F]

          dark:bg-[#091522]
          dark:text-white
          dark:selection:bg-[#FF8201]/30
          dark:selection:text-white
        "
      >
        {/* ================================================== */}
        {/* HERO SECTION */}
        {/* ================================================== */}

        <section
          className="
            relative
            flex
            h-screen
            w-full
            items-center
            justify-center
            overflow-hidden
            bg-[#00345F]
          "
        >
          {/* Background image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=2800&auto=format&fit=crop"
              alt="Corporate Event Photography"
              fill
              sizes="100vw"
              className="
                h-full
                w-full
                scale-105
                object-cover
                opacity-55
                animate-[pulse_10s_ease-in-out_infinite]
              "
            />

            {/* Brand-tinted overlay */}
            <div
              className="
                absolute
                inset-0
                bg-[#00345F]/25
                mix-blend-multiply
              "
            />

            {/* Subtle grain */}
            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[url('https://grainy-gradients.vercel.app/noise.svg')]
                opacity-[0.035]
              "
            />

            {/* Bottom gradient */}
            <div
              className="
                absolute
                inset-0
                bg-linear-to-b
                from-[#00345F]/35
                via-[#00345F]/10
                to-[#091522]/95
              "
            />

            {/* Orange atmospheric glow */}
            <div
              className="
                pointer-events-none
                absolute
                -bottom-32
                left-1/2
                h-80
                w-80
                -translate-x-1/2
                rounded-full
                bg-[#FF8201]/10
                blur-3xl
              "
            />
          </div>

          {/* Hero content */}
          <div
            className="
              container
              relative
              z-10
              mx-auto
              px-6
              text-center
              text-white
              md:px-12
            "
          >
            <FadeIn>
              <div
                className="
                  mb-8
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/15
                  bg-white/8
                  px-3
                  py-1.5
                  shadow-lg
                  shadow-black/20
                  backdrop-blur-md
                "
              >
                <Aperture className="h-3 w-3 text-[#FF8201]" />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-white/90
                  "
                >
                  CE FRAMES • Est. 2026
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h1
                className="
                  mb-8
                  text-5xl
                  font-black
                  leading-[0.85]
                  tracking-tighter
                  text-white
                  drop-shadow-2xl
                  md:text-8xl
                  lg:text-9xl
                "
              >
                CULTURE
                <br />

                <span className="text-white/45">
                  &
                </span>

                <br />

                COMMUNAUTÉ
              </h1>
            </FadeIn>

            <FadeIn delay={200}>
              <p
                className="
                  mx-auto
                  mb-12
                  max-w-xl
                  text-lg
                  font-medium
                  leading-relaxed
                  tracking-wide
                  text-white/75
                  md:text-xl
                "
              >
                Une couverture professionnelle des événements pour
                les initiatives modernes du Comité d’Entreprise. Nous
                capturons vos moments clés, l’esprit d’équipe et les
                célébrations.
              </p>
            </FadeIn>

            <FadeIn delay={300}>
              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  gap-4
                  sm:flex-row
                "
              >
                {/* Primary CTA */}
                <Link
                  href="/gallery"
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    rounded-full
                    bg-white
                    px-8
                    py-4
                    text-sm
                    font-bold
                    uppercase
                    tracking-widest
                    text-[#004A87]
                    shadow-xl
                    shadow-black/20
                    transition-all
                    duration-300

                    hover:-translate-y-0.5
                    hover:bg-[#FF8201]
                    hover:text-white
                    hover:shadow-[#FF8201]/20
                  "
                >
                  Découvrir les œuvres

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </Link>

                {/* Secondary CTA */}
                <button
                  onClick={() =>
                    setIsContactOpen(true)
                  }
                  className="
                    cursor-pointer
                    rounded-full
                    border
                    border-white/20
                    bg-white/5
                    px-8
                    py-4
                    text-sm
                    font-bold
                    uppercase
                    tracking-widest
                    text-white
                    backdrop-blur-sm
                    transition-all
                    duration-300

                    hover:border-[#FF8201]/60
                    hover:bg-[#FF8201]/10
                  "
                >
                  Réserver un événement
                </button>
              </div>
            </FadeIn>
          </div>

          {/* Scroll indicator */}
          <div
            className="
              absolute
              bottom-10
              left-1/2
              flex
              -translate-x-1/2
              flex-col
              items-center
              gap-2
              text-white/40
              animate-bounce
            "
          >
            <span
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.2em]
              "
            >
              Défiler
            </span>

            <div
              className="
                h-12
                w-px
                bg-linear-to-b
                from-[#FF8201]/70
                to-transparent
              "
            />
          </div>
        </section>

        {/* ================================================== */}
        {/* INTRODUCTION */}
        {/* ================================================== */}

        <section
          className="
            bg-white
            py-24
            dark:bg-[#091522]
            md:py-32
          "
        >
          <div
            className="
              container
              mx-auto
              max-w-7xl
              px-6
              md:px-12
            "
          >
            <div
              className="
                grid
                grid-cols-1
                items-center
                gap-16
                md:grid-cols-2
              "
            >
              <FadeIn>
                <div className="space-y-8">
                  <h2
                    className="
                      text-4xl
                      font-black
                      leading-[1.1]
                      tracking-tight
                      text-[#172033]

                      dark:text-white

                      md:text-6xl
                    "
                  >
                    TRAVAILLER DUR.
                    <br />

                    <span
                      className="
                        text-[#64748B]

                        dark:text-white/25
                      "
                    >
                      CÉLÉBRER ENSEMBLE.
                    </span>
                  </h2>

                  <p
                    className="
                      text-lg
                      leading-relaxed
                      text-[#64748B]

                      dark:text-white/60
                    "
                  >
                    Des grands galas annuels et discours d’ouverture
                    aux retraites d’équipe en plein air, <strong
                      className="
                        font-semibold
                        text-[#004A87]

                        dark:text-white
                      "
                    >
                      {' '}
                      CE Frames
                    </strong>{' '}
                    documente l’élément humain de votre entreprise.
                    Nous produisons des visuels nets et éditoriaux qui
                    renforcent la culture interne et brillent sur les
                    canaux corporatifs.
                  </p>

                  <Link
                    href="/about"
                    className="
                      group
                      inline-flex
                      items-center
                      gap-2
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-[#004A87]
                      transition-all
                      duration-300

                      hover:gap-4
                      hover:text-[#FF8201]

                      dark:text-[#5FA9E6]
                      dark:hover:text-[#FF8201]
                    "
                  >
                    Découvrir CE Frames

                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </FadeIn>

              <FadeIn delay={200}>
                <div
                  className="
                    group
                    relative
                    aspect-square
                    overflow-hidden
                    rounded-2xl
                    bg-[#EAF4FB]
                    shadow-2xl
                    shadow-[#00345F]/10

                    dark:bg-[#0E1C2D]
                    dark:shadow-black/30

                    md:aspect-4/5
                  "
                >
                  <Image
                    src="https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1000&auto=format&fit=crop"
                    alt="Corporate Team Event"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition-transform
                      duration-700
                      ease-out
                      group-hover:scale-105
                    "
                  />

                  {/* Image overlay */}
                  <div
                    className="
                      absolute
                      inset-0
                      bg-linear-to-t
                      from-[#00345F]/50
                      via-transparent
                      to-transparent
                    "
                  />

                  {/* Label */}
                  <div
                    className="
                      absolute
                      bottom-6
                      left-6
                      rounded-xl
                      border
                      border-white/30
                      bg-white/90
                      px-5
                      py-3
                      shadow-lg
                      backdrop-blur-md

                      dark:border-white/10
                      dark:bg-[#091522]/90
                    "
                  >
                    <p
                      className="
                        mb-0.5
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.15em]
                        text-[#64748B]

                        dark:text-white/40
                      "
                    >
                      Spécialisation
                    </p>

                    <p
                      className="
                        text-sm
                        font-black
                        text-[#172033]

                        dark:text-white
                      "
                    >
                      Événements entreprise & CE
                    </p>
                  </div>

                  {/* Orange accent */}
                  <div
                    className="
                      absolute
                      right-6
                      top-6
                      h-2
                      w-12
                      rounded-full
                      bg-[#FF8201]
                      opacity-90
                    "
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* LATEST EVENTS */}
        {/* ================================================== */}

        <section
          className="
            border-y
            border-[#E2E8F0]
            bg-[#F5F7FA]
            py-24

            dark:border-white/8
            dark:bg-[#0E1C2D]/60
          "
        >
          <div
            className="
              container
              mx-auto
              max-w-[1600px]
              px-6
              md:px-12
            "
          >
            {/* Section header */}
            <FadeIn>
              <div
                className="
                  mb-16
                  flex
                  items-end
                  justify-between
                "
              >
                <div>
                  <span
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      uppercase
                      tracking-[0.15em]
                      text-[#FF8201]
                    "
                  >
                    Archives d’événements
                  </span>

                  <h2
                    className="
                      text-3xl
                      font-black
                      tracking-tight
                      text-[#172033]

                      dark:text-white

                      md:text-5xl
                    "
                  >
                    DERNIERS ÉVÉNEMENTS
                  </h2>
                </div>

                <Link
                  href="/gallery"
                  className="
                    group
                    hidden
                    items-center
                    gap-2
                    text-xs
                    font-bold
                    uppercase
                    tracking-[0.15em]
                    text-[#172033]
                    transition-colors

                    hover:text-[#FF8201]

                    dark:text-white
                    dark:hover:text-[#FF8201]

                    md:flex
                  "
                >
                  Voir tous les événements

                  <ArrowRight
                    className="
                      h-4
                      w-4
                      transition-transform
                      duration-300
                      group-hover:translate-x-1
                    "
                  />
                </Link>
              </div>
            </FadeIn>

            {/* ================================================== */}
            {/* GALLERIES */}
            {/* ================================================== */}

            {latestGalleries?.length > 0 ? (
              <div
                className="
                  grid
                  grid-cols-1
                  gap-6
                  md:grid-cols-3
                "
              >
                {latestGalleries.map(
                  (gallery, index) => (
                    <FadeIn
                      key={gallery.id}
                      delay={100 + index * 100}
                      className="h-full"
                    >
                      <Link
                        href={`/gallery/${gallery.slug}`}
                        className="
                          group
                          relative
                          block
                          h-[480px]
                          w-full
                          overflow-hidden
                          rounded-2xl
                          bg-[#00345F]
                          shadow-lg
                          transition-all
                          duration-500

                          hover:-translate-y-1
                          hover:shadow-2xl
                        "
                      >
                        {/* ====================================== */}
                        {/* DISPLAY MEDIA */}
                        {/* ====================================== */}

                        {gallery.displayMedia ? (
                          <MediaViewport
                            mediaType={
                              gallery.displayMedia.type
                            }
                            fullResUrl={
                              gallery.displayMedia.fullResUrl
                            }
                            thumbnailUrl={
                              gallery.displayMedia.thumbnailUrl
                            }
                            caption={
                              gallery.displayMedia.caption
                            }
                            originalFilename={
                              gallery.displayMedia
                                .originalFilename
                            }
                            priority={index === 0}
                            sizes="
                              (max-width: 768px) 100vw,
                              (max-width: 1280px) 33vw,
                              500px
                            "
                            showTitle={false}
                            showFilename={false}
                            showMagnifyingGlass={false}
                            className="
                              absolute
                              inset-0
                              rounded-none
                              border-0
                              bg-transparent
                              shadow-none

                              hover:border-0
                              hover:shadow-none
                            "
                          />
                        ) : (
                          <div
                            className="
                              absolute
                              inset-0
                              flex
                              items-center
                              justify-center
                              bg-[#00345F]
                            "
                          >
                            <Camera
                              className="
                                h-16
                                w-16
                                text-white/20
                              "
                            />
                          </div>
                        )}

                        {/* ====================================== */}
                        {/* IMAGE OVERLAY */}
                        {/* ====================================== */}

                        <div
                          className="
                            pointer-events-none
                            absolute
                            inset-0
                            bg-linear-to-t
                            from-[#00345F]
                            via-[#00345F]/45
                            to-transparent
                            opacity-90
                            transition-opacity
                            duration-500

                            group-hover:opacity-100
                          "
                        />

                        {/* ====================================== */}
                        {/* ORANGE TOP ACCENT */}
                        {/* ====================================== */}

                        <div
                          className="
                            pointer-events-none
                            absolute
                            left-0
                            top-0
                            h-1
                            w-20
                            bg-[#FF8201]
                            transition-all
                            duration-500

                            group-hover:w-full
                          "
                        />

                        {/* ====================================== */}
                        {/* EVENT NUMBER */}
                        {/* ====================================== */}

                        <div
                          className="
                            pointer-events-none
                            absolute
                            right-6
                            top-6
                            flex
                            h-10
                            w-10
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-white/20
                            bg-black/20
                            font-mono
                            text-xs
                            font-bold
                            text-white
                            backdrop-blur-md
                          "
                        >
                          0{index + 1}
                        </div>

                        {/* ====================================== */}
                        {/* CONTENT */}
                        {/* ====================================== */}

                        <div
                          className="
                            pointer-events-none
                            absolute
                            bottom-0
                            left-0
                            right-0
                            p-8
                          "
                        >
                          {/* Event label */}

                          <div
                            className="
                              mb-5
                              flex
                              items-center
                              gap-2
                              text-[#FF8201]
                            "
                          >
                            <Images className="h-5 w-5" />

                            <span
                              className="
                                text-[10px]
                                font-bold
                                uppercase
                                tracking-[0.18em]
                              "
                            >
                              Event Gallery
                            </span>
                          </div>

                          {/* Dynamic title */}

                          <h3
                            className="
                              mb-3
                              line-clamp-2
                              text-2xl
                              font-black
                              leading-tight
                              text-white

                              md:text-3xl
                            "
                          >
                            {gallery.title}
                          </h3>

                          {/* Dynamic description */}

                          {gallery.description && (
                            <p
                              className="
                                line-clamp-3
                                text-sm
                                font-medium
                                leading-relaxed
                                text-white/70
                              "
                            >
                              {gallery.description}
                            </p>
                          )}

                          {/* View gallery */}

                          <div
                            className="
                              mt-6
                              flex
                              items-center
                              gap-2
                              text-xs
                              font-bold
                              uppercase
                              tracking-[0.15em]
                              text-white
                              transition-all
                              duration-300

                              group-hover:gap-4
                            "
                          >
                            Voir la galerie

                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </Link>
                    </FadeIn>
                  )
                )}
              </div>
            ) : (
              /* ================================================== */
              /* EMPTY STATE */
              /* ================================================== */

              <FadeIn>
                <div
                  className="
                    flex
                    min-h-80
                    flex-col
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-dashed
                    border-[#CBD5E1]
                    bg-white
                    text-center

                    dark:border-white/10
                    dark:bg-[#091522]
                  "
                >
                  <Images
                    className="
                      mb-4
                      h-10
                      w-10
                      text-[#94A3B8]

                      dark:text-white/30
                    "
                  />

                  <h3
                    className="
                      mb-2
                      text-xl
                      font-bold
                      text-[#172033]

                      dark:text-white
                    "
                  >
                    Aucun événement pour le moment
                  </h3>

                  <p
                    className="
                      max-w-md
                      text-sm
                      text-[#64748B]

                      dark:text-white/50
                    "
                  >
                    Nos dernières galeries d’événements apparaîtront
                    ici dès leur publication.
                  </p>
                </div>
              </FadeIn>
            )}

            {/* Mobile gallery link */}
            <div className="mt-8 text-center md:hidden">
              <Link
                href="/gallery"
                className="
                  group
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#004A87]
                  transition-colors

                  hover:text-[#FF8201]

                  dark:text-white
                  dark:hover:text-[#FF8201]
                "
              >
                Voir tous les événements

                <ArrowRight
                  className="
                    h-4
                    w-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                />
              </Link>
            </div>
          </div>
        </section>

        {/* ================================================== */}
        {/* SERVICES */}
        {/* ================================================== */}

        <section
          className="
            bg-white
            py-24

            dark:bg-[#091522]
          "
        >
          <div
            className="
              container
              mx-auto
              max-w-7xl
              px-6
              md:px-12
            "
          >
            <div
              className="
                grid
                grid-cols-1
                gap-12
                md:grid-cols-2
              "
            >
              {/* Corporate Gatherings */}
              <FadeIn>
                <div
                  className="
                    group
                    rounded-3xl
                    border
                    border-[#E2E8F0]
                    bg-[#F5F7FA]
                    p-8
                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:border-[#004A87]/30
                    hover:shadow-xl
                    hover:shadow-[#00345F]/8

                    dark:border-white/8
                    dark:bg-[#0E1C2D]
                    dark:hover:border-[#FF8201]/30
                    dark:hover:shadow-black/20

                    md:p-12
                  "
                >
                  <Camera
                    className="
                      mb-6
                      h-10
                      w-10
                      text-[#004A87]
                      transition-transform
                      duration-300

                      group-hover:scale-110

                      dark:text-[#FF8201]
                    "
                  />

                  <h3
                    className="
                      mb-4
                      text-2xl
                      font-bold
                      text-[#172033]

                      dark:text-white
                    "
                  >
                    Réunions d’entreprise
                  </h3>

                  <p
                    className="
                      mb-8
                      leading-relaxed
                      text-[#64748B]

                      dark:text-white/55
                    "
                  >
                    Une couverture haut de gamme pour les assemblées
                    officielles du Comité d’Entreprise, les anniversaires
                    d’entreprise et les célébrations formelles conçues pour
                    un partage rapide en interne.
                  </p>

                  <ul
                    className="
                      space-y-3
                      text-sm
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#64748B]

                      dark:text-white/40
                    "
                  >
                    <li className="flex items-center gap-3">
                      <div
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#FF8201]
                        "
                      />
                      Photobooth sur place & impression live
                    </li>

                    <li className="flex items-center gap-3">
                      <div
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#FF8201]
                        "
                      />
                      Couverture du keynote & de la scène
                    </li>

                    <li className="flex items-center gap-3">
                      <div
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#FF8201]
                        "
                      />
                      Portraits exécutifs & d’équipe
                    </li>
                  </ul>
                </div>
              </FadeIn>

              {/* Team Building */}
              <FadeIn delay={100}>
                <div
                  className="
                    group
                    rounded-3xl
                    border
                    border-[#E2E8F0]
                    bg-[#F5F7FA]
                    p-8
                    transition-all
                    duration-300

                    hover:-translate-y-1
                    hover:border-[#004A87]/30
                    hover:shadow-xl
                    hover:shadow-[#00345F]/8

                    dark:border-white/8
                    dark:bg-[#0E1C2D]
                    dark:hover:border-[#FF8201]/30
                    dark:hover:shadow-black/20

                    md:p-12
                  "
                >
                  <Users
                    className="
                      mb-6
                      h-10
                      w-10
                      text-[#004A87]
                      transition-transform
                      duration-300

                      group-hover:scale-110

                      dark:text-[#FF8201]
                    "
                  />

                  <h3
                    className="
                      mb-4
                      text-2xl
                      font-bold
                      text-[#172033]

                      dark:text-white
                    "
                  >
                    Team building & retraites
                  </h3>

                  <p
                    className="
                      mb-8
                      leading-relaxed
                      text-[#64748B]

                      dark:text-white/55
                    "
                  >
                    Une documentation spontanée et authentique des
                    défis d’équipe, journées sportives et sorties hors
                    site qui renforcent la culture d’entreprise.
                  </p>

                  <ul
                    className="
                      space-y-3
                      text-sm
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#64748B]

                      dark:text-white/40
                    "
                  >
                    <li className="flex items-center gap-3">
                      <div
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#FF8201]
                        "
                      />
                      Couverture multi-jours
                    </li>

                    <li className="flex items-center gap-3">
                      <div
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#FF8201]
                        "
                      />
                      Galeries numériques haute résolution
                    </li>

                    <li className="flex items-center gap-3">
                      <div
                        className="
                          h-1.5
                          w-1.5
                          rounded-full
                          bg-[#FF8201]
                        "
                      />
                      Reels de mise en avant & visuels sociaux
                    </li>
                  </ul>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </main>

      <ContactModal
        isOpen={isContactOpen}
        onClose={() =>
          setIsContactOpen(false)
        }
      />
    </>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Camera,
  Images,
  Aperture,
} from 'lucide-react';

import MediaViewport from '@/components/media-viewport';
import { LatestPublicGallery } from '@/lib/db-helpers';

// ============================================================
// PROPS
// ============================================================

interface HomeProps {
  latestGalleries: LatestPublicGallery[];
}

// ============================================================
// FADE IN
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
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

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
  const heroGallery = latestGalleries?.[0];

  return (
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
      {/* HERO */}
      {/* ================================================== */}

      {heroGallery ? (
        <section
          className="
            relative
            flex
            min-h-screen
            w-full
            items-center
            justify-center
            overflow-hidden
            bg-[#00345F]
          "
        >
          {/* ============================================== */}
          {/* HERO MEDIA */}
          {/* ============================================== */}

          <div className="absolute inset-0 z-0">
            {heroGallery.displayMedia ? (
              <MediaViewport
                mediaType={
                  heroGallery.displayMedia.type
                }
                fullResUrl={
                  heroGallery.displayMedia.fullResUrl
                }
                thumbnailUrl={
                  heroGallery.displayMedia.thumbnailUrl
                }
                caption={
                  heroGallery.displayMedia.caption
                }
                originalFilename={
                  heroGallery.displayMedia
                    .originalFilename
                }
                priority
                sizes="100vw"
                showTitle={false}
                showFilename={false}
                showMagnifyingGlass={false}
                className="
                  absolute
                  inset-0
                  h-full
                  w-full
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
                    h-24
                    w-24
                    text-white/20
                  "
                />
              </div>
            )}

            {/* Hero overlay */}

            <div
              className="
                absolute
                inset-0
                bg-[#00345F]/35
                mix-blend-multiply
              "
            />

            <div
              className="
                absolute
                inset-0
                bg-linear-to-b
                from-[#00345F]/45
                via-[#00345F]/10
                to-[#091522]/95
              "
            />

            {/* Bottom glow */}

            <div
              className="
                pointer-events-none
                absolute
                -bottom-40
                left-1/2
                h-96
                w-96
                -translate-x-1/2
                rounded-full
                bg-[#FF8201]/15
                blur-3xl
              "
            />

            {/* Grain */}

            <div
              className="
                pointer-events-none
                absolute
                inset-0
                bg-[url('https://grainy-gradients.vercel.app/noise.svg')]
                opacity-[0.035]
              "
            />
          </div>

          {/* ============================================== */}
          {/* HERO CONTENT */}
          {/* ============================================== */}

          <div
            className="
              container
              relative
              z-10
              mx-auto
              px-6
              py-32
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
                <Aperture
                  className="
                    h-3
                    w-3
                    text-[#FF8201]
                  "
                />

                <span
                  className="
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-white/90
                  "
                >
                  Galerie récente
                </span>
              </div>
            </FadeIn>

            <FadeIn delay={100}>
              <h1
                className="
                  mx-auto
                  mb-8
                  max-w-6xl
                  text-5xl
                  font-black
                  leading-[0.9]
                  tracking-tighter
                  text-white
                  drop-shadow-2xl

                  md:text-7xl
                  lg:text-9xl
                "
              >
                {heroGallery.title}
              </h1>
            </FadeIn>

            {heroGallery.description && (
              <FadeIn delay={200}>
                <p
                  className="
                    mx-auto
                    mb-12
                    max-w-2xl
                    text-lg
                    font-medium
                    leading-relaxed
                    tracking-wide
                    text-white/75

                    md:text-xl
                  "
                >
                  {heroGallery.description}
                </p>
              </FadeIn>
            )}

            <FadeIn delay={300}>
              <Link
                href={`/gallery/${heroGallery.slug}`}
                className="
                  group
                  inline-flex
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
                Voir la galerie

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
            </FadeIn>
          </div>

          {/* ============================================== */}
          {/* SCROLL INDICATOR */}
          {/* ============================================== */}

          <div
            className="
              absolute
              bottom-10
              left-1/2
              z-10
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
      ) : (
        /* ================================================== */
        /* EMPTY HERO */
        /* ================================================== */

        <section
          className="
            flex
            min-h-screen
            items-center
            justify-center
            bg-[#00345F]
            px-6
            text-center
            text-white
          "
        >
          <div>
            <Images
              className="
                mx-auto
                mb-6
                h-16
                w-16
                text-white/20
              "
            />

            <h1
              className="
                mb-4
                text-4xl
                font-black
                tracking-tight

                md:text-6xl
              "
            >
              Aucune galerie disponible
            </h1>

            <p
              className="
                mx-auto
                max-w-lg
                text-white/60
              "
            >
              Les dernières galeries du Comité d&apos;Entreprise
              apparaîtront ici dès leur publication.
            </p>
          </div>
        </section>
      )}

      {/* ================================================== */}
      {/* LATEST GALLERIES */}
      {/* ================================================== */}

      {latestGalleries?.length > 0 && (
        <section
          className="
            border-y
            border-[#E2E8F0]
            bg-[#F5F7FA]
            py-24

            dark:border-white/8
            dark:bg-[#0E1C2D]/60

            md:py-32
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
            {/* ============================================ */}
            {/* HEADER */}
            {/* ============================================ */}

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
                    Galeries
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
                    GALERIES RÉCENTES
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
                  Voir toutes les galeries

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

            {/* ============================================ */}
            {/* GALLERY GRID */}
            {/* ============================================ */}

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
                      {/* ================================== */}
                      {/* MEDIA */}
                      {/* ================================== */}

                      {gallery.displayMedia ? (
                        <MediaViewport
                          mediaType={
                            gallery.displayMedia.type
                          }
                          fullResUrl={
                            gallery.displayMedia.fullResUrl
                          }
                          thumbnailUrl={
                            gallery.displayMedia
                              .thumbnailUrl
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

                      {/* ================================== */}
                      {/* OVERLAY */}
                      {/* ================================== */}

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

                      {/* ================================== */}
                      {/* ORANGE ACCENT */}
                      {/* ================================== */}

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

                      {/* ================================== */}
                      {/* NUMBER */}
                      {/* ================================== */}

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
                        {String(index + 1).padStart(
                          2,
                          '0'
                        )}
                      </div>

                      {/* ================================== */}
                      {/* CONTENT */}
                      {/* ================================== */}

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
                            Galerie
                          </span>
                        </div>

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

            {/* ============================================ */}
            {/* MOBILE LINK */}
            {/* ============================================ */}

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
                Voir toutes les galeries

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
      )}
    </main>
  );
}
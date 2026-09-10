'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaLinkedin,
} from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/',
      icon: <FaInstagram />,
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/',
      icon: <FaFacebook />,
    },
    {
      name: 'TikTok',
      href: 'https://www.tiktok.com/',
      icon: <FaTiktok />,
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/',
      icon: <FaLinkedin />,
    },
  ];

  return (
    <footer
      className="
        relative overflow-hidden
        border-t border-[#E2E8F0]
        bg-white
        text-[#172033]
        transition-colors duration-300
        dark:border-white/10
        dark:bg-[#0B1624]
        dark:text-white
      "
    >
      {/* Decorative background accents */}
      <div
        className="
          pointer-events-none
          absolute -right-32 -top-32
          h-64 w-64
          rounded-full
          bg-[#EAF4FB]
          blur-3xl
          dark:bg-[#004A87]/20
        "
      />

      <div
        className="
          pointer-events-none
          absolute -bottom-32 -left-32
          h-64 w-64
          rounded-full
          bg-[#FFF1E5]
          blur-3xl
          dark:bg-[#FF8201]/10
        "
      />

      <div className="relative mx-auto max-w-7xl px-6 py-12 md:px-10">

        {/* Main Footer */}
        <div
          className="
            flex flex-col
            items-center justify-between
            gap-10
            md:flex-row
          "
        >

          {/* Brand */}
          <div
            className="
              flex flex-col
              items-center
              text-center
              md:items-start
              md:text-left
            "
          >
            <Link
              href="/"
              aria-label="CE Frames Home"
              className="
                group
                inline-flex
                transition-transform duration-300
                hover:-translate-y-0.5
              "
            >
              <Image
                src="/Logo name.png"
                alt="CE Frames"
                width={130}
                height={42}
                className="
                  h-auto w-[125px]
                  transition-opacity duration-300
                  group-hover:opacity-80
                  dark:brightness-0 dark:invert
                "
                priority
              />
            </Link>

            <p
              className="
                mt-4 max-w-sm
                text-sm leading-relaxed
                text-[#64748B]
                dark:text-white/50
              "
            >
              La galerie photo interne du Comité d&apos;Entreprise
              d&apos;Infomil Mauritius pour consulter et partager les
              souvenirs des événements passés.
            </p>

            {/* Brand accent */}
            <div className="mt-5 flex items-center gap-2">
              <span className="h-1 w-8 rounded-full bg-[#004A87]" />
              <span className="h-1 w-3 rounded-full bg-[#FF8201]" />
            </div>
          </div>


          {/* Social Links */}
          <div className="flex flex-col items-center md:items-end">

            <p
              className="
                mb-4
                text-[10px] font-bold uppercase
                tracking-[0.2em]
                text-[#64748B]
                dark:text-white/40
              "
            >
              Suivez-nous
            </p>

            <div
              className="flex items-center gap-2"
              aria-label="CE Frames social media"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit CE Frames on ${social.name}`}
                  className="
                    group
                    flex h-11 w-11
                    items-center justify-center
                    rounded-full
                    border border-[#E2E8F0]
                    bg-[#F5F7FA]
                    text-[#64748B]
                    shadow-sm
                    transition-all duration-300

                    hover:-translate-y-1
                    hover:border-[#004A87]
                    hover:bg-[#004A87]
                    hover:text-white
                    hover:shadow-lg
                    hover:shadow-[#004A87]/20

                    dark:border-white/10
                    dark:bg-white/5
                    dark:text-white/50

                    dark:hover:border-[#FF8201]
                    dark:hover:bg-[#FF8201]
                    dark:hover:text-white
                    dark:hover:shadow-[#FF8201]/20
                  "
                >
                  <span className="text-sm transition-transform duration-300 group-hover:scale-110">
                    {social.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>


        {/* Bottom */}
        <div
          className="
            mt-10
            border-t border-[#E2E8F0]
            pt-6
            dark:border-white/10
          "
        >
          <div
            className="
              flex flex-col
              items-center justify-between
              gap-3
              text-xs
              md:flex-row
            "
          >
            <p className="text-[#64748B] dark:text-white/40">
              © {currentYear} CE Frames. All rights reserved.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-[#64748B] dark:text-white/40">
                Comité d&apos;Entreprise
              </span>

              <span className="h-1 w-1 rounded-full bg-[#FF8201]" />

              <span className="font-medium text-[#004A87] dark:text-white/60">
                Infomil Mauritius
              </span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
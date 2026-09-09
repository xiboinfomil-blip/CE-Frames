'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function BrandingPanel() {
  return (
    <div className="h-full w-full relative flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden bg-[#00345F] select-none">

      {/* Background Image with Next.js Optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop"
          alt="Corporate team event"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />

        {/* Brand Blue & Orange Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00345F]/95 via-[#00345F]/75 to-[#004A87]/45 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#00345F] via-[#00345F]/45 to-transparent" />

        {/* Subtle Orange Accent Glow */}
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FF8201]/10 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Decorative Grid Pattern */}
      <div
        className="absolute inset-0 z-0 opacity-[0.05] bg-[radial-gradient(#FFFFFF_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">

        {/* Top Section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00345F]/80 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold uppercase tracking-[0.15em] mb-8 shadow-md shadow-[#00345F]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8201] animate-pulse" />
            <span>CE Coverage Studio</span>
          </div>

          {/* Brand Heading */}
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3 leading-none">
            CE{' '}
            <span className="text-[#FF8201] font-light">
              Frames
            </span>
          </h1>

          <p className="text-white/75 font-medium text-base sm:text-lg tracking-wide">
            Comité d&apos;Entreprise Event Photography
          </p>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="space-y-6"
        >
          {/* Accent Divider */}
          <div className="h-px w-16 bg-gradient-to-r from-[#FF8201] via-[#FF8201]/40 to-transparent" />

          <p className="text-white/70 text-sm leading-relaxed max-w-xs font-normal">
            Secure access for managing event galleries, CE collections,
            and employee memories.
          </p>

          <div className="flex items-center gap-3 text-white/50 text-[10px] font-bold uppercase tracking-[0.15em]">
            <span>Est. 2026</span>

            <span
              className="w-1 h-1 bg-white/30 rounded-full"
              aria-hidden="true"
            />

            <span className="text-white/70">
              v2.4.0
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
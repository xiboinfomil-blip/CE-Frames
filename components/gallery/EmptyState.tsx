'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen } from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';

interface EmptyStateProps {
title?: string;
description?: string;
actionLabel?: string;
onAction?: () => void;
icon?: React.ComponentType<{
className?: string;
strokeWidth?: number;
}>;
}

export default function EmptyState({
title = 'Aucune galerie trouvée',
description = 'Essayez d’ajuster vos filtres ou vos termes de recherche pour trouver ce que vous cherchez.',
actionLabel,
onAction,
icon: Icon = FolderOpen,
}: EmptyStateProps) {
return (
<motion.div
initial={{ opacity: 0, y: 16 }}
animate={{ opacity: 1, y: 0 }}
transition={{
duration: 0.4,
ease: [0.16, 1, 0.3, 1],
}}
className="relative flex flex-col items-center justify-center py-20 sm:py-28 px-4"
>
{/* Background Radial Glow */} <div
     className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 bg-[radial-gradient(ellipse_at_center,rgba(0,74,135,0.08)_0%,transparent_70%)]"
     aria-hidden="true"
   />

```
  {/* Decorative Grid Pattern */}
  <div
    className="absolute inset-0 opacity-[0.035] bg-[radial-gradient(#004A87_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
    aria-hidden="true"
  />

  {/* Content Container */}
  <div className="relative z-10 text-center max-w-md mx-auto">

    {/* Icon Wrapper */}
    <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 mb-6 relative">
      {/* Decorative Back Layer */}
      <div
        className="absolute inset-0 bg-[#FFF1E5] rounded-3xl rotate-3 border border-[#FF8201]/20 transition-transform duration-500 hover:rotate-6"
      />

      {/* Main Icon Container */}
      <div
        className="relative w-full h-full bg-white dark:bg-[#102238] rounded-3xl shadow-xl shadow-[#00345F]/10 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center transition-transform duration-500 hover:-translate-y-1"
      >
        <Icon
          className="w-9 h-9 sm:w-10 sm:h-10 text-[#004A87]"
          strokeWidth={1.5}
        />
      </div>
    </div>

    {/* Text Content */}
    <h3 className="text-2xl sm:text-3xl font-bold text-[#172033] dark:text-white mb-3 tracking-tight">
      {title}
    </h3>

    <p className="text-[#64748B] dark:text-white/60 text-sm sm:text-base leading-relaxed font-normal mb-8">
      {description}
    </p>

    {/* Optional Action Button */}
    {actionLabel && onAction && (
      <div className="mb-8">
        <CustomButton
          onClick={onAction}
          variant="secondary"
          size="md"
          className="bg-[#EAF4FB] hover:bg-[#DCEEF9] text-[#00345F] border-[#E2E8F0] hover:border-[#004A87]/30"
        >
          {actionLabel}
        </CustomButton>
      </div>
    )}

    {/* Visual Accent Dots */}
    <div
      className="flex items-center justify-center gap-2"
      aria-hidden="true"
    >
      <div className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#FF8201]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]" />
    </div>

  </div>
</motion.div>


);
}

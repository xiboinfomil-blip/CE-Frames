'use client';

import React from 'react';

interface GalleryHeaderProps {
title?: string;
description?: string;
}

export default function GalleryHeader({
title = 'Gallery',
description = 'Browse our collection of galleries',
}: GalleryHeaderProps) {
return ( <div className="relative overflow-hidden bg-white dark:bg-[#0B1624] border-b border-[#E2E8F0] dark:border-white/10 shadow-sm shadow-[#00345F]/5">
{/* Background Accent Gradient Glow */} <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#EAF4FB] rounded-full blur-3xl pointer-events-none" />

```
  {/* Orange Accent Glow */}
  <div className="absolute -top-16 right-1/4 w-48 h-48 bg-[#FFF1E5] rounded-full blur-3xl opacity-70 pointer-events-none" />

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
    <div className="flex items-center gap-3 mb-2">
      <div className="w-1 h-8 sm:h-9 rounded-full bg-[#FF8201]" />

      <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] dark:text-white tracking-tight">
        {title}
      </h1>
    </div>

    {description && (
      <p className="mt-2 ml-4 text-sm sm:text-base text-[#64748B] dark:text-white/60 max-w-2xl leading-relaxed">
        {description}
      </p>
    )}
  </div>
</div>

);
}

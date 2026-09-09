'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
ChevronLeft,
ChevronRight,
Image as ImageIcon,
} from 'lucide-react';

import { CustomButton } from '@/components/ui/CustomButton';
import EmptyState from '@/components/EmptyState';

export interface GalleryImage {
id?: string;
url: string;
alt?: string;
}

interface GalleryComponentProps {
images?: GalleryImage[];
title?: string;
onModify?: () => void;
onManage?: () => void;
}

export default function GalleryComponent({
images = [],
title = 'Galleries',
onModify,
onManage,
}: GalleryComponentProps) {
const topImages = images.slice(0, 5);
const [currentIndex, setCurrentIndex] = useState(0);
const [direction, setDirection] = useState<number>(0);

if (topImages.length === 0) {
return (
<EmptyState
title="No images available"
description="This gallery currently has no media items uploaded."
icon={ImageIcon}
actionLabel={onManage ? 'Manage Gallery' : undefined}
onAction={onManage}
/>
);
}

const nextSlide = () => {
setDirection(1);
setCurrentIndex((prev) => (prev + 1) % topImages.length);
};

const prevSlide = () => {
setDirection(-1);
setCurrentIndex(
(prev) => (prev - 1 + topImages.length) % topImages.length
);
};

const goToSlide = (index: number) => {
setDirection(index > currentIndex ? 1 : -1);
setCurrentIndex(index);
};

const slideVariants = {
enter: (dir: number) => ({
x: dir > 0 ? '100%' : '-100%',
opacity: 0,
}),
center: {
x: 0,
opacity: 1,
},
exit: (dir: number) => ({
x: dir < 0 ? '100%' : '-100%',
opacity: 0,
}),
};

return ( <div className="max-w-3xl mx-auto p-6 bg-white border border-[#E2E8F0] rounded-2xl shadow-xl shadow-[#00345F]/10 font-sans">
{/* Gallery Header */} <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5"> <h2 className="text-xl font-bold text-[#172033] tracking-tight">
{title} </h2>

```
    <div className="flex items-center gap-2.5">
      {onModify && (
        <CustomButton
          onClick={onModify}
          variant="secondary"
          size="sm"
          className="bg-[#EAF4FB] hover:bg-[#DCEEF9] text-[#00345F] border-[#E2E8F0] hover:border-[#004A87]/30"
        >
          Modify
        </CustomButton>
      )}

      {onManage && (
        <CustomButton
          onClick={onManage}
          variant="primary"
          size="sm"
          className="bg-[#004A87] hover:bg-[#00345F] text-white shadow-[#004A87]/20"
        >
          Manage
        </CustomButton>
      )}
    </div>
  </header>

  {/* Slider Wrapper */}
  <div className="relative w-full h-[280px] sm:h-[420px] bg-[#F5F7FA] rounded-xl overflow-hidden border border-[#E2E8F0] flex items-center justify-center">
    <AnimatePresence
      initial={false}
      custom={direction}
      mode="popLayout"
    >
      <motion.div
        key={currentIndex}
        custom={direction}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{
          x: {
            type: 'spring',
            stiffness: 300,
            damping: 30,
          },
          opacity: {
            duration: 0.2,
          },
        }}
        className="relative w-full h-full"
      >
        <Image
          src={topImages[currentIndex].url}
          alt={
            topImages[currentIndex].alt ||
            `Gallery image ${currentIndex + 1}`
          }
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
          priority={currentIndex === 0}
        />
      </motion.div>
    </AnimatePresence>

    {/* Navigation Arrows */}
    {topImages.length > 1 && (
      <>
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous image"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#00345F]/85 hover:bg-[#004A87] text-white border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] z-10"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next image"
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#00345F]/85 hover:bg-[#004A87] text-white border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-md transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] z-10"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </>
    )}
  </div>

  {/* Slider Pagination Dots */}
  {topImages.length > 1 && (
    <nav
      className="flex justify-center items-center gap-2 mt-4"
      aria-label="Image navigation"
    >
      {topImages.map((_, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => goToSlide(idx)}
          aria-label={`Go to image ${idx + 1}`}
          className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF8201] ${
            idx === currentIndex
              ? 'w-6 bg-[#FF8201]'
              : 'w-2.5 bg-[#CBD5E1] hover:bg-[#004A87]'
          }`}
        />
      ))}
    </nav>
  )}
</div>
);
}

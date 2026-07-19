'use client';

import { FaImages } from 'react-icons/fa';

export default function EmptyState() {
  return (
    <div className="relative flex flex-col items-center justify-center py-20 sm:py-32 px-4">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/40 to-cyan-100/40 rounded-full blur-3xl"></div>
        
        {/* Subtle Racing Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent opacity-50"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent opacity-30 transform -translate-y-2"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-200 to-transparent opacity-30 transform translate-y-2"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 text-center max-w-lg mx-auto">
        
        {/* Icon Wrapper with Glass Effect */}
        <div className="inline-flex items-center justify-center w-28 h-28 sm:w-36 sm:h-36 mb-8 relative">
          {/* Outer Ring */}
          <div className="absolute inset-0 border-2 border-dashed border-blue-200 rounded-full animate-[spin_10s_linear_infinite]"></div>
          
          {/* Inner Glow */}
          <div className="absolute inset-2 bg-white/80 backdrop-blur-md rounded-full shadow-xl border border-white/50 flex items-center justify-center">
            <FaImages className="text-6xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-cyan-500" />
          </div>
          
          {/* Accent Dot */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg"></div>
        </div>

        {/* Text Content */}
        <h3 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 tracking-tight">
          Track Clear
        </h3>
        
        <p className="text-gray-500 text-lg sm:text-xl leading-relaxed">
          No galleries match your current criteria. 
          <span className="block mt-2 text-base text-gray-400">
            Adjust your filters or search terms to find what you're looking for.
          </span>
        </p>

        {/* Decorative Bottom Line */}
        <div className="mt-10 flex items-center justify-center space-x-2">
          <div className="w-12 h-1 bg-blue-400 rounded-full opacity-60"></div>
          <div className="w-2 h-1 bg-cyan-400 rounded-full opacity-40"></div>
          <div className="w-12 h-1 bg-blue-400 rounded-full opacity-60"></div>
        </div>
      </div>
    </div>
  );
}
import React from "react";

export default function BrandingPanel() {
  return (
    <div className="h-full w-full relative flex flex-col justify-between p-8 sm:p-12 text-zinc-100 overflow-hidden bg-zinc-900">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=2000&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Sophisticated Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/90 via-zinc-900/60 to-zinc-900/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top Section */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-[10px] font-bold uppercase tracking-[0.15em] mb-8 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Studio Online
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3 leading-none">
            Orama<span className="text-zinc-400 font-light">Creativ</span>
          </h1>
          <p className="text-zinc-300 font-medium text-lg tracking-wide">
            Visual Asset Management
          </p>
        </div>

        {/* Bottom Section */}
        <div className="space-y-8">
          <div className="h-px w-16 bg-gradient-to-r from-white/50 to-transparent" />
          
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
            Secure access required for all administrative functions, including asset upload, user management, and gallery telemetry.
          </p>

          <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em]">
            <span>Est. 2026</span>
            <span className="w-1 h-1 bg-zinc-500 rounded-full" />
            <span>v2.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
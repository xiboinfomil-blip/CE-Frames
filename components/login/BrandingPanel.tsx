import React from "react";

export default function BrandingPanel() {
  return (
    <div className="h-full w-full relative flex flex-col justify-between p-12 text-stone-800 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/10 via-stone-900/40 to-stone-900/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Top Section */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-[10px] font-bold uppercase tracking-widest mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Online
          </div>
          
          <h1 className="text-5xl font-bold text-white tracking-tight mb-3 leading-none">
            Orama<span className="text-stone-300 font-light">Creativ</span>
          </h1>
          <p className="text-stone-300 font-medium text-lg tracking-wide">
            Visual Asset Management
          </p>
        </div>

        {/* Bottom Section */}
        <div className="space-y-8">
          <div className="h-px w-16 bg-gradient-to-r from-white/50 to-transparent" />
          
          <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
            Secure access required for all administrative functions, including asset upload, user management, and gallery telemetry.
          </p>

          <div className="flex items-center gap-4 text-white/40 text-xs font-mono uppercase tracking-wider">
            <span>Est. 2026</span>
            <span className="w-1 h-1 bg-white/40 rounded-full" />
            <span>v2.4.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
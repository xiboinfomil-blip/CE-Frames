'use client';

import { memo } from 'react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState = memo(({ onCreateClick }: EmptyStateProps) => (
  <div className="relative min-h-[40vh] flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 shadow-sm overflow-hidden">
    <div 
      className="absolute inset-0 pointer-events-none opacity-[0.4]" 
      style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
      aria-hidden="true" 
    />
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
    
    <div className="text-center max-w-sm relative z-10">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 mb-6 relative shadow-sm">
        <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Telemetry Empty</h3>
      <p className="text-slate-500 text-sm mt-2 font-medium leading-relaxed">
        No galleries found. Start building your portfolio by initializing your first collection.
      </p>
      <button 
        onClick={onCreateClick}
        className="mt-8 px-8 py-3 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-red-500/30 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Initialize First Gallery
      </button>
    </div>
  </div>
));
EmptyState.displayName = 'EmptyState';
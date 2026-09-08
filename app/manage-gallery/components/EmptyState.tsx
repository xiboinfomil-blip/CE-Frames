'use client';

import { memo } from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { CustomButton } from '@/components/ui/CustomButton';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export const EmptyState = memo(({ onCreateClick }: EmptyStateProps) => (
  <div className="relative min-h-[40vh] flex flex-col items-center justify-center rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-950 p-12 shadow-sm overflow-hidden transition-colors duration-300">
    {/* Motifs de fond discrets */}
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    
    <div className="text-center max-w-sm relative z-10">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 mb-8 relative shadow-inner transition-transform duration-500 hover:scale-105">
        <FolderOpen className="w-8 h-8 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
      </div>
      
      <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-3">
        Aucun album pour le moment
      </h3>
      
      <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed tracking-wide mb-10">
        Partagez les événements, sorties et activités du CSE en créant votre premier album.
      </p>
      
      <CustomButton 
        variant="primary"
        size="lg"
        onClick={onCreateClick}
        leftIcon={<Plus className="w-4 h-4" />}
        className="shadow-lg shadow-zinc-200/50 dark:shadow-black/50"
      >
        Créer un album CSE
      </CustomButton>
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';
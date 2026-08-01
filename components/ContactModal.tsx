'use client';

import React, { useState } from 'react';
import Image from 'next/image'; // Import Next.js Image
import BaseModal from './BaseModal';
import { CustomTextfield } from './ui/CustomTextfield';
import { CustomButton } from './ui/CustomButton';
import { HiFlag, HiUser, HiEnvelope, HiCheckCircle, HiBolt, HiCamera } from 'react-icons/hi2';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setIsSuccess(false);
        setIsSubmitting(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Trackside Inquiry"
      subtitle="High-performance photography for motorsport enthusiasts."
      maxWidth="4xl"
      // Removed className prop as it doesn't exist in BaseModalProps
      // Styles like shadow-2xl are now handled by BaseModal or internal divs
    >
      <div className="flex flex-col md:flex-row h-full md:h-[600px]">
        
        {/* LEFT: High-Speed Visuals */}
        <div className="hidden md:flex w-5/12 relative bg-zinc-950 overflow-hidden group">
          {/* Dynamic Race Image using Next.js Image */}
          <Image 
            src="https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1000&auto=format&fit=crop" 
            alt="Race car on track with motion blur" 
            fill
            className="object-cover opacity-80 transition-transform duration-1000 ease-out group-hover:scale-105"
            priority
          />
          
          {/* Speed Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/40 to-transparent" />
          
          {/* Telemetry Data Overlay */}
          <div className="relative z-10 flex flex-col justify-between p-10 h-full text-white">
            <div className="flex items-center gap-2 text-xs font-mono text-red-500 tracking-widest uppercase">
              <HiBolt className="w-4 h-4" />
              <span>Live Capture Mode</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-black italic tracking-tighter leading-none">
                SPEED <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">CAPTURED.</span>
              </h2>
              <p className="text-zinc-400 text-sm font-medium max-w-[200px] leading-relaxed">
                Freezing 200mph in a single frame. Let&apos;s document your legacy on the asphalt.
              </p>
            </div>

            {/* Decorative "Specs" */}
            <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-zinc-500 border-t border-white/10 pt-4">
              <div>
                <span className="block text-zinc-300">SHUTTER</span>
                1/4000s
              </div>
              <div>
                <span className="block text-zinc-300">LENS</span>
                400mm f/2.8
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Precision Form */}
        <div className="flex-1 bg-white dark:bg-zinc-950 p-8 md:p-12 overflow-y-auto flex flex-col">
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 flex items-center justify-center mb-6 border border-zinc-200 dark:border-zinc-800">
                <HiCheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2 tracking-tight">Pit Stop Complete</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto mb-8">
                Message received. We&apos;ll review your telemetry and get back to you shortly.
              </p>
              <CustomButton 
                variant="outline" 
                size="md" 
                onClick={onClose}
                className="rounded-2xl px-8 border-zinc-200 dark:border-zinc-800"
              >
                Close Window
              </CustomButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <CustomTextfield
                  label="Driver Name"
                  placeholder="Max V."
                  leftIcon={<HiUser className="w-4 h-4" />}
                  required
                />
                
                <CustomTextfield
                  label="Contact Email"
                  type="email"
                  placeholder="team@racing.com"
                  leftIcon={<HiEnvelope className="w-4 h-4" />}
                  required
                />
              </div>
              
              <div className="group relative w-full flex flex-col gap-2 flex-1">
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400 pl-1">
                  Project Details
                </label>
                <div className="relative flex-1 min-h-[120px]">
                  <HiCamera className="absolute left-3.5 top-3.5 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <textarea
                    rows={4}
                    placeholder="Event date, track location, and specific shot requirements..."
                    className="w-full h-full rounded-2xl px-4 py-3 pl-11 text-sm font-medium bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:ring-4 focus:ring-zinc-100/50 dark:focus:ring-zinc-800/50 transition-all duration-200 resize-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end mt-auto">
                <CustomButton 
                  type="submit" 
                  isLoading={isSubmitting} 
                  size="lg" 
                  className="rounded-2xl px-8 bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-500/20"
                  rightIcon={!isSubmitting && <HiFlag className="w-4 h-4" />}
                >
                  Start Project
                </CustomButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
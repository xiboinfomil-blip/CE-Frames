'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import BaseModal from './BaseModal';
import { CustomTextfield } from './ui/CustomTextfield';
import { CustomButton } from './ui/CustomButton';
import { HiBuildingOffice, HiUser, HiEnvelope, HiCheckCircle, HiSparkles, HiCalendarDays, HiPaperAirplane } from 'react-icons/hi2';

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
      title="Réserver une couverture photo événementielle"
      subtitle="Capturer les moments mémorables de votre Comité d’Entreprise et de vos galas d’entreprise."
      maxWidth="4xl"
    >
      <div className="flex flex-col md:flex-row h-full md:h-[600px]">
        
        {/* LEFT: Corporate Visual Highlights */}
        <div className="hidden md:flex w-5/12 relative bg-slate-950 overflow-hidden group rounded-2xl md:rounded-r-none">
          <Image 
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop" 
            alt="Corporate event celebration" 
            fill
            className="object-cover opacity-75 transition-transform duration-1000 ease-out group-hover:scale-105"
            priority
          />
          
          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/50 to-transparent" />
          
          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col justify-between p-10 h-full text-white">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 tracking-widest uppercase">
              <HiSparkles className="w-4 h-4" />
              <span>CE & couverture événementielle</span>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-black tracking-tight leading-tight">
                CÉLÉBREZ <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-300 via-white to-rose-100">
                  VOTRE ÉQUIPE.
                </span>
              </h2>
              <p className="text-slate-300 text-sm font-medium max-w-[220px] leading-relaxed">
                Des galas annuels aux retraites d’équipe, nous préservons votre culture d’entreprise en haute définition.
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-4 text-[11px] font-mono text-slate-400 border-t border-white/10 pt-4">
              <div>
                <span className="block text-rose-300 font-bold">LIVRAISON</span>
                Galerie web privée
              </div>
              <div>
                <span className="block text-rose-300 font-bold">COUVERTURE</span>
                Journée complète & demi-journée
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Corporate Form */}
        <div className="flex-1 bg-white dark:bg-slate-950 p-8 md:p-12 overflow-y-auto flex flex-col justify-between">
          
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 border border-rose-200 dark:border-rose-900/50">
                <HiCheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight">Demande reçue !</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-8 text-sm leading-relaxed">
                Merci pour votre message. Nous examinerons les détails de votre événement et vous recontacterons sous 24 heures avec une proposition personnalisée.
              </p>
              <CustomButton 
                variant="outline" 
                size="md" 
                onClick={onClose}
                className="rounded-xl px-8 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900"
              >
                Fermer
              </CustomButton>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 h-full flex flex-col">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomTextfield
                  label="Nom du contact"
                  placeholder="Jean Dupont"
                  leftIcon={<HiUser className="w-4 h-4 text-slate-400" />}
                  required
                />
                
                <CustomTextfield
                  label="E-mail professionnel"
                  type="email"
                  placeholder="j.dupont@company.com"
                  leftIcon={<HiEnvelope className="w-4 h-4 text-slate-400" />}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomTextfield
                  label="Entreprise / nom du CE"
                  placeholder="Comité d’Entreprise Acme"
                  leftIcon={<HiBuildingOffice className="w-4 h-4 text-slate-400" />}
                  required
                />

                <CustomTextfield
                  label="Date & lieu de l’événement"
                  placeholder="ex. 15 nov, Paris"
                  leftIcon={<HiCalendarDays className="w-4 h-4 text-slate-400" />}
                />
              </div>
              
              <div className="group relative w-full flex flex-col gap-2 flex-1">
                <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400 pl-1">
                  Détails de l’événement & besoins
                </label>
                <div className="relative flex-1 min-h-[110px]">
                  <textarea
                    rows={4}
                    placeholder="Racontez-nous votre événement (gala annuel, team building, journée famille), le nombre estimé de participants et vos demandes spécifiques..."
                    className="w-full h-full rounded-2xl px-4 py-3 text-sm font-medium bg-slate-50 dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 focus:ring-4 focus:ring-rose-100 dark:focus:ring-rose-950/50 transition-all duration-200 resize-none"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end mt-auto">
                <CustomButton 
                  type="submit" 
                  isLoading={isSubmitting} 
                  size="lg" 
                  className="rounded-xl px-8 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25 transition-all duration-200"
                  rightIcon={!isSubmitting && <HiPaperAirplane className="w-4 h-4" />}
                >
                  Envoyer la demande
                </CustomButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </BaseModal>
  );
}
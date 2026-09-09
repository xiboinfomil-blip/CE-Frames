'use client';

import { useState, useRef, useEffect } from 'react';
import {
  HiLockClosed,
  HiEye,
  HiEyeSlash,
  HiExclamationCircle,
  HiArrowPath,
} from 'react-icons/hi2';

interface PasswordGateProps {
  onUnlock: (password: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
  title?: string;
  subtitle?: string;
}

export default function PasswordGate({
  onUnlock,
  isLoading,
  error,
  title = 'Galerie privée d’événement',
  subtitle = 'Saisissez votre mot de passe pour accéder à la collection média.',
}: PasswordGateProps) {
  const [password, setPassword] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus password input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isLoading) return;
    await onUnlock(password);
  };

  return (
    <div className="min-h-screen w-full bg-[#F5F7FA] flex items-center justify-center p-6 relative overflow-hidden font-sans">

      {/* Brand Background Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#004A87]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#FF8201]/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl border border-[#E2E8F0] shadow-2xl shadow-[#00345F]/10 p-8 md:p-10 relative z-10">

        {/* Header Icon & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#FFF1E5] border border-[#FF8201]/20 mb-6 text-[#FF8201]">
            <HiLockClosed className="w-7 h-7" />
          </div>

          <h1 className="text-2xl font-bold text-[#172033] tracking-tight mb-2">
            {title}
          </h1>

          <p className="text-[#64748B] text-xs sm:text-sm font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <label htmlFor="gallery-password" className="sr-only">
              Mot de passe
            </label>

            <input
              ref={inputRef}
              id="gallery-password"
              type={isVisible ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Saisissez le mot de passe de la galerie"
              disabled={isLoading}
              autoComplete="current-password"
              className={`
                w-full pl-4 pr-12 py-3.5
                bg-[#F5F7FA]
                border rounded-xl
                text-[#172033] text-sm
                placeholder:text-[#94A3B8]
                focus:outline-none focus:ring-2
                transition-all duration-200
                ${
                  error
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-[#E2E8F0] focus:border-[#FF8201] focus:ring-[#FF8201]/20'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />

            {/* Toggle Visibility */}
            <button
              type="button"
              onClick={() => setIsVisible(!isVisible)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#64748B] hover:text-[#004A87] transition-colors rounded-lg"
              aria-label={isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {isVisible ? (
                <HiEyeSlash className="w-5 h-5" />
              ) : (
                <HiEye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
              <HiExclamationCircle className="w-5 h-5 shrink-0 text-red-500" />
              <p className="text-xs font-medium">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !password.trim()}
            className={`
              w-full py-3.5 px-6 rounded-xl
              font-semibold text-sm text-white
              shadow-lg
              transition-all duration-200
              flex items-center justify-center gap-2
              ${
                isLoading || !password.trim()
                  ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed border border-[#CBD5E1]'
                  : 'bg-[#FF8201] hover:bg-[#e87500] shadow-[#FF8201]/25 active:scale-[0.99]'
              }
            `}
          >
            {isLoading ? (
              <>
                <HiArrowPath className="animate-spin h-4 w-4 text-[#64748B]" />
                <span>Vérification...</span>
              </>
            ) : (
              <span>Déverrouiller l’accès</span>
            )}
          </button>
        </form>

        {/* Security Footer */}
        <div className="mt-8 text-center border-t border-[#E2E8F0] pt-6">
          <p className="text-[11px] font-mono text-[#94A3B8]">
            Protégé par une authentification sécurisée
          </p>
        </div>
      </div>
    </div>
  );
}

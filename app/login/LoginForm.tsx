'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { HiOutlineUser, HiOutlineLockClosed, HiArrowRight, HiExclamationCircle } from 'react-icons/hi2';
import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { CustomButton } from '@/components/ui/CustomButton';

export default function LoginForm() {
  const searchParams = useSearchParams();
  searchParams.get('callbackUrl');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // Intégration NextAuth ou API CE
      // await signIn('credentials', { email, password, callbackUrl });
      await new Promise(resolve => setTimeout(resolve, 1500)); 
    } catch {
      setError('Identifiants invalides. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 sm:px-0">
      {/* Editorial Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none mb-3">
          Bon retour
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm tracking-wide">
          Saisissez vos identifiants CE pour vous connecter à l&apos;espace d&apos;administration.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Refined Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <HiExclamationCircle className="shrink-0 mt-0.5 w-4 h-4" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <CustomTextfield
            label="Adresse e-mail"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nom@entreprise.com"
            leftIcon={<HiOutlineUser size={18} />}
            autoComplete="email"
            required
          />

          <CustomTextfield
            label="Mot de passe"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<HiOutlineLockClosed size={18} />}
            autoComplete="current-password"
            required
          />
        </div>

        <div className="pt-4">
          <CustomButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full"
            rightIcon={!isLoading && <HiArrowRight size={18} />}
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </CustomButton>
        </div>
      </form>

      {/* Subtle Footer Metadata */}
      <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-[0.15em] text-center">
          Espace Sécurisé CE • Portail Comité d&apos;Entreprise
        </p>
      </div>
    </div>
  );
}
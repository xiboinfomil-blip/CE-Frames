'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiEye,
  HiEyeSlash,
  HiArrowRight,
  HiExclamationCircle,
  HiArrowPath,
} from 'react-icons/hi2';

import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { CustomButton } from '@/components/ui/CustomButton';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/');
    }
  }, [status, router]);

  const errorParam = searchParams.get('error');

  const authError =
    errorParam === 'CredentialsSignin'
      ? 'E-mail ou mot de passe invalide.'
      : errorParam
        ? 'Une erreur inattendue est survenue. Veuillez réessayer.'
        : null;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/',
        redirect: false,
      });

      if (result?.error) {
        setError('E-mail ou mot de passe invalide.');
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch {
      setError('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  {/* Loading State */}
  if (status === 'loading') {
    return (
      <div className="h-full w-full min-h-[400px] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <HiArrowPath className="w-8 h-8 text-[#FF8201] animate-spin" />

          <span className="text-xs font-bold text-[#64748B] uppercase tracking-[0.2em]">
            Authentification...
          </span>
        </div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="max-w-md w-full mx-auto px-6 sm:px-0"
    >
      {/* Header */}
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-[#172033] tracking-tight mb-2">
          Bon retour
        </h2>

        <p className="text-[#64748B] text-sm font-medium">
          Saisissez vos identifiants pour gérer vos galeries CE.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Error Alert */}
        {(error || authError) && (
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.96,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-3 shadow-lg shadow-red-900/5"
          >
            <HiExclamationCircle className="shrink-0 mt-0.5 w-4 h-4 text-red-500" />

            <span className="font-medium">
              {error || authError}
            </span>
          </motion.div>
        )}

        {/* Fields */}
        <div className="space-y-4">

          {/* Email */}
          <CustomTextfield
            label="Adresse e-mail"
            name="email"
            type="email"
            placeholder="admin@ceframes.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={
              <HiOutlineEnvelope
                size={18}
                className="text-[#94A3B8]"
              />
            }
            autoComplete="email"
            required
          />

          {/* Password */}
          <CustomTextfield
            label="Mot de passe"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={
              <HiOutlineLockClosed
                size={18}
                className="text-[#94A3B8]"
              />
            }
            rightIcon={
              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? 'Masquer le mot de passe'
                    : 'Afficher le mot de passe'
                }
                className="p-1 rounded-md transition-colors focus:outline-none text-[#64748B] hover:text-[#004A87] focus-visible:ring-2 focus-visible:ring-[#FF8201]"
              >
                {showPassword ? (
                  <HiEyeSlash size={18} />
                ) : (
                  <HiEye size={18} />
                )}
              </button>
            }
            autoComplete="current-password"
            required
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <CustomButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full"
            rightIcon={
              !isLoading && <HiArrowRight size={18} />
            }
          >
            Se connecter
          </CustomButton>
        </div>
      </form>

      {/* Footer */}
      <footer className="mt-12 text-center">
        <p className="text-[10px] text-[#94A3B8] font-bold uppercase tracking-[0.2em]">
          © 2026 CE Frames. Tous droits réservés.
        </p>
      </footer>
    </motion.div>
  );
}
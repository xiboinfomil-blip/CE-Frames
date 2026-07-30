'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FiUser, FiLock, FiArrowRight } from 'react-icons/fi';
import { CustomTextfield } from '@/components/ui/CustomTextfield';
import { CustomButton } from '@/components/ui/CustomButton';

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      // await signIn('credentials', { callbackUrl });
      await new Promise(resolve => setTimeout(resolve, 1500)); 
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-6 sm:px-0">
      {/* Editorial Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-none mb-3">
          Welcome back
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm tracking-wide">
          Enter your studio credentials to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Refined Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <CustomTextfield
            label="Email Address"
            name="email"
            type="email"
            placeholder="name@company.com"
            leftIcon={<FiUser size={18} />}
            autoComplete="email"
            required
          />

          <CustomTextfield
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            leftIcon={<FiLock size={18} />}
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
            rightIcon={!isLoading && <FiArrowRight size={18} />}
          >
            {isLoading ? 'Authenticating...' : 'Sign in'}
          </CustomButton>
        </div>
      </form>

      {/* Subtle Footer Metadata */}
      <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
        <p className="text-[10px] text-zinc-400 dark:text-zinc-600 font-bold uppercase tracking-[0.15em] text-center">
          Secure Studio Access • v2.4.0
        </p>
      </div>
    </div>
  );
}
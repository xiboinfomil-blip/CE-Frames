"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FiUser, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";

import { CustomTextfield } from "@/components/ui/CustomTextfield";
import { CustomButton } from "@/components/ui/CustomButton";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setError("Invalid email or password.");
    } else if (errorParam) {
      setError("An unexpected error occurred. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: true, 
      });

      if (result?.error) {
        setError("Invalid email or password.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
          <span className="text-xs font-medium text-stone-400 uppercase tracking-widest">
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="max-w-md w-full mx-auto">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-stone-900 tracking-tight mb-2">Welcome Back</h2>
        <p className="text-stone-500">Please enter your details to access the dashboard.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" x2="12" y1="8" y2="12"/>
              <line x1="12" x2="12.01" y1="16" y2="16"/>
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-4">
          <CustomTextfield
            label="Email Address"
            name="email"
            type="email"
            placeholder="admin@oramacreativ.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<FiUser size={18} />}
            autoComplete="email"
            required
          />

          <CustomTextfield
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<FiLock size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="p-1 rounded-md hover:bg-stone-100 transition-colors focus:outline-none text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            }
            autoComplete="current-password"
            required
          />
        </div>

        <div className="pt-4">
          <CustomButton
            type="submit"
            variant="default"
            size="lg"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full"
            rightIcon={!isLoading && <FiArrowRight size={18} />}
          >
            Sign In
          </CustomButton>
        </div>
      </form>

      <footer className="mt-12 text-center">
        <p className="text-xs text-stone-400">
          © 2026 OramaCreativ. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
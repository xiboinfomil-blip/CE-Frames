"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { 
  HiOutlineUser, 
  HiOutlineLockClosed, 
  HiEye, 
  HiEyeSlash, 
  HiArrowRight, 
  HiExclamationCircle,
  HiArrowPath
} from "react-icons/hi2";

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
      <div className="h-full w-full flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <HiArrowPath className="w-8 h-8 text-zinc-900 dark:text-zinc-100 animate-spin" />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">
            Authenticating...
          </span>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="max-w-md w-full mx-auto px-6 sm:px-0">
      <header className="mb-10">
        <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-2">Welcome Back</h2>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium">Please enter your details to access the studio.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
            <HiExclamationCircle className="shrink-0 mt-0.5 w-4 h-4" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <CustomTextfield
            label="Email Address"
            name="email"
            type="email"
            placeholder="admin@oramacreativ.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<HiOutlineUser size={18} />}
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
            leftIcon={<HiOutlineLockClosed size={18} />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                {showPassword ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
              </button>
            }
            autoComplete="current-password"
            required
          />
        </div>

        <div className="pt-2">
          <CustomButton
            type="submit"
            variant="primary"
            size="lg"
            disabled={isLoading}
            isLoading={isLoading}
            className="w-full"
            rightIcon={!isLoading && <HiArrowRight size={18} />}
          >
            Sign In
          </CustomButton>
        </div>
      </form>

      <footer className="mt-12 text-center">
        <p className="text-xs text-zinc-400 dark:text-zinc-600 font-medium uppercase tracking-widest">
          © 2026 OramaCreativ. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
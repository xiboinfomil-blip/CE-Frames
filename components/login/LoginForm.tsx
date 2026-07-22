"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { FiUser, FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";

// Update these paths if you placed the components in your /login folder instead of /ui
import { CustomTextfield } from "@/components/ui/CustomTextfield";
import { CustomButton } from "@/components/ui/CustomButton";
import styles from "./Login.module.css";

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

  // Telemetry-style loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 transition-colors duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-500 animate-pulse">
            Initializing Telemetry...
          </span>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <main className={styles.formPanel}>
      <div className={styles.formContent}>
        <header className={styles.formHeader}>
          <div className={styles.formHeaderTag}>SECURE ACCESS</div>
          <h2 className={styles.formTitle}>Admin Access</h2>
          <p className={styles.formSubtitle}>Enter your credentials to continue</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Upgraded Telemetry Error Message */}
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-[11px] font-mono font-medium flex items-center gap-2 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
              {error}
            </div>
          )}

          <div className={styles.field}>
            <CustomTextfield
              label="Email"
              name="email"
              type="email"
              placeholder="admin@oramacreativ.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<FiUser size={18} />}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
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
                  className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 text-inherit"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              }
              autoComplete="current-password"
              required
            />
          </div>

          <div className={styles.options}>
            <label className={styles.checkbox}>
              <input type="checkbox" className={styles.checkboxInput} defaultChecked />
              <span className={styles.checkboxMark} />
              <span className={styles.checkboxText}>Remember me</span>
            </label>
            <a href="#" className={styles.forgotLink}>
              Forgot password?
            </a>
          </div>

          <div className={styles.submit}>
            <CustomButton
              type="submit"
              variant="continue"
              size="lg"
              leftIcon={<FiCheck size={18} />}
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full"
              shortcut="↵"
            >
              Access Dashboard
            </CustomButton>
          </div>
        </form>

        <footer className={styles.formFooter}>
          <div className={styles.formFooterLine} />
          <p className={styles.formFooterText}>
            © 2026 OramaCreativ. All rights reserved.
          </p>
        </footer>
      </div>
    </main>
  );
}
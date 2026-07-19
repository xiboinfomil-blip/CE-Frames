"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react"; // Import useSession
import { FiUser, FiLock, FiEye, FiEyeOff, FiCheck } from "react-icons/fi";
import RaceTextField from "@/components/login/RaceTextField";
import RaceButton from "@/components/login/RaceButton";
import styles from "./Login.module.css";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession(); // Get session data and status
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to / if already logged in
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Handle errors from URL params (when redirect: true)
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
      // Use next-auth/react signIn directly
      // Set callbackUrl to '/' to redirect to home page after login
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/", // Redirect to / after successful login
        redirect: true, 
      });

      // If signIn returns without redirecting, it means there was an error
      if (result?.error) {
        setError("Invalid email or password.");
      }
      // If successful, NextAuth will automatically redirect to the callback URL (/)
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Optionally, show a loading state while checking session
  if (status === "loading") {
    return <div>Loading...</div>; // Or your custom loading component
  }

  // If authenticated, don't render the form (redirect will happen via useEffect)
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
          {error && (
            <div style={{ color: "#ef4444", marginBottom: "1rem", textAlign: "center", fontSize: "0.9rem", fontWeight: 500 }}>
              {error}
            </div>
          )}

          <div className={styles.field}>
            <RaceTextField
              label="Email"
              name="email"
              type="email"
              placeholder="admin@oramacreativ.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              color="red"
              size="md"
              startIcon={<FiUser size={18} />}
              fullWidth
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <RaceTextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              color="red"
              size="md"
              startIcon={<FiLock size={18} />}
              endIcon={
                <button
                  type="button"
                  className={styles.eyeToggle}
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              }
              fullWidth
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
            <RaceButton
              type="submit"
              variant="gradient"
              color="red"
              size="lg"
              fullWidth
              startIcon={<FiCheck size={18} />}
              disabled={isLoading}
            >
              {isLoading ? "Authenticating..." : "Access Dashboard"}
            </RaceButton>
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
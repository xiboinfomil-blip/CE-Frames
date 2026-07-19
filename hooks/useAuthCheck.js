"use client";

import { useSession } from "next-auth/react";

export function useAuthCheck() {
  const { data: session, status } = useSession();

  // Derive loading and authentication states directly
  const isLoading = status === "loading";
  const isAuthenticated = !isLoading && !!session;

  return { 
    isAuthenticated, 
    isLoading 
  };
}
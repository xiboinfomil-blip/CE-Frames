"use client";

import { useSession } from "next-auth/react";
import type { UserRole } from "@/db/schema";

interface UseAuthCheckReturn {
  isAuthenticated: boolean;
  isLoading: boolean;
  role?: UserRole;
}

export function useAuthCheck(): UseAuthCheckReturn {
  const { data: session, status } = useSession();

  // Derive loading and authentication states directly
  const isLoading = status === "loading";
  const isAuthenticated = !isLoading && !!session;

  return { 
    isAuthenticated, 
    isLoading,
    role: session?.user?.role as UserRole | undefined,
  };
}

// components/Providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";

import { CursorProvider } from '@/context/CursorContext';
import { CustomCursor } from '@/components/cursor/CustomCursor';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CursorProvider>
        {children}
        <CustomCursor />
      </CursorProvider>
    </SessionProvider>
  );
}
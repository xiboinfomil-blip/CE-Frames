'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export type CursorState =
  | 'default'
  | 'hover'
  | 'view'
  | 'play'
  | 'text'
  | 'drag'
  | 'loading';

type CursorContextValue = {
  state: CursorState;
  setState: (state: CursorState) => void;
  isPointer: boolean;
};

const CursorContext = createContext<CursorContextValue | null>(null);

export function CursorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CursorState>('default');
  const [isPointer, setIsPointer] = useState(false);

  const handleStateChange = useCallback((newState: CursorState) => {
    setState(newState);
  }, []);

  return (
    <CursorContext.Provider
      value={{ state, setState: handleStateChange, isPointer }}
    >
      {children}
    </CursorContext.Provider>
  );
}

export function useCursor() {
  const ctx = useContext(CursorContext);
  if (!ctx) throw new Error('useCursor must be used within CursorProvider');
  return ctx;
}
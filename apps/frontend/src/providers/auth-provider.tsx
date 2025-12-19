"use client";

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { 
    initialize, 
  } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

export function useAuth() {
  return useAuthStore();
}

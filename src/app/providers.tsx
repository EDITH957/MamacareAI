'use client';

import { type ReactNode } from 'react';
import { AppProviders } from '@/providers/app-providers';
import { ThemeInitializer } from '@/providers/theme-initializer';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProviders>
      <ThemeInitializer />
      {children}
    </AppProviders>
  );
}

'use client';

import { useEffect } from 'react';
import { useTheme } from '@/lib/hooks/use-theme';

export function ThemeInitializer() {
  const { mounted } = useTheme();

  useEffect(() => {
    if (mounted) {
      const saved = localStorage.getItem('mamacare-theme');
      if (!saved) {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        }
      }
    }
  }, [mounted]);

  return null;
}

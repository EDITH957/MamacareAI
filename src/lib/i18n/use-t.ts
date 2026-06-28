'use client';

import { useUIStore } from '@/lib/store/ui-store';
import { translations, type TranslationKey } from './translations';
import { defaultLocale } from './locales';

export function useT() {
  const locale = useUIStore((s) => s.locale);

  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] ?? translations[defaultLocale]?.[key] ?? key;
  };

  return { t, locale };
}

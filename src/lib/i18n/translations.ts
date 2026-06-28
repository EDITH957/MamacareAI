import type { LocaleCode } from './locales';
import { en } from './en';
import { fr } from './fr';
import { ha } from './ha';
import { yo } from './yo';
import { ig } from './ig';

export const translations: Record<LocaleCode, Record<string, string>> = {
  en,
  fr,
  ha,
  yo,
  ig,
};

export type TranslationKey = keyof typeof en;

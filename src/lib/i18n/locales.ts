export const locales = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
  { code: 'yo', label: 'Yoruba', flag: '🇳🇬' },
] as const;

export type LocaleCode = (typeof locales)[number]['code'];

export const defaultLocale: LocaleCode = 'en';

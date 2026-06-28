'use client';

import Link from 'next/link';
import {
  Heart, Activity, BrainCircuit, Baby, Bell, Stethoscope, Cpu,
  AlertTriangle, FileText, History, ArrowRight, Shield, Sparkles,
  Sun, Mic, AudioWaveform,
} from 'lucide-react';
import { useT } from '@/lib/i18n/use-t';
import { LanguageSwitcher } from '@/components/shared/language-switcher';

const features = [
  { icon: <Heart className="h-6 w-6" />, titleKey: 'feature.pregnancyTracking', descKey: 'feature.pregnancyTrackingDesc' },
  { icon: <BrainCircuit className="h-6 w-6" />, titleKey: 'feature.aiIntelligence', descKey: 'feature.aiIntelligenceDesc' },
  { icon: <Baby className="h-6 w-6" />, titleKey: 'feature.multiplePregnancy', descKey: 'feature.multiplePregnancyDesc' },
  { icon: <Bell className="h-6 w-6" />, titleKey: 'feature.smartReminders', descKey: 'feature.smartRemindersDesc' },
  { icon: <Stethoscope className="h-6 w-6" />, titleKey: 'feature.postnatalCare', descKey: 'feature.postnatalCareDesc' },
  { icon: <Cpu className="h-6 w-6" />, titleKey: 'feature.babyIntelligence', descKey: 'feature.babyIntelligenceDesc' },
  { icon: <AlertTriangle className="h-6 w-6" />, titleKey: 'feature.emergencySOS', descKey: 'feature.emergencySOSDesc' },
  { icon: <FileText className="h-6 w-6" />, titleKey: 'feature.reportsAnalytics', descKey: 'feature.reportsAnalyticsDesc' },
  { icon: <Sun className="h-6 w-6" />, titleKey: 'feature.jaundiceDetection', descKey: 'feature.jaundiceDetectionDesc' },
  { icon: <Mic className="h-6 w-6" />, titleKey: 'feature.voiceTriage', descKey: 'feature.voiceTriageDesc' },
  { icon: <AudioWaveform className="h-6 w-6" />, titleKey: 'feature.cryAnalysis', descKey: 'feature.cryAnalysisDesc' },
  { icon: <History className="h-6 w-6" />, titleKey: 'feature.healthJourney', descKey: 'feature.healthJourneyDesc' },
] as const;

export default function Home() {
  const { t } = useT();

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <header className="sticky top-0 z-50 border-b border-zinc-100 bg-white/80 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-200 dark:shadow-pink-900/30">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-zinc-900 dark:text-white">MamaCare</span>
            <span className="rounded-md bg-pink-100 px-1.5 py-0.5 text-xs font-semibold text-pink-600 dark:bg-pink-900/40 dark:text-pink-400">AI</span>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white">{t('nav.signIn')}</Link>
            <Link href="/register" className="inline-flex h-9 items-center rounded-lg bg-pink-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-pink-700 hover:shadow-md">{t('nav.getStarted')}</Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden px-4 py-20 sm:py-28 lg:px-8">
          <div className="absolute inset-0 bg-gradient-to-b from-pink-50 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950" />
          <div className="absolute right-0 top-0 -mr-40 mt-20 h-80 w-80 rounded-full bg-pink-200/30 blur-3xl dark:bg-pink-900/10" />
          <div className="absolute bottom-0 left-0 -ml-40 mb-20 h-80 w-80 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-900/10" />
          <div className="relative mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-1.5 text-sm font-medium text-pink-600 dark:border-pink-900 dark:bg-pink-950/30 dark:text-pink-400">
              <Sparkles className="h-4 w-4" /> {t('hero.badge')}
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-5xl lg:text-6xl">
              {t('hero.title')}{' '}
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">{t('hero.titleHighlight')}</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-500 dark:text-zinc-400">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-pink-600 px-8 text-base font-medium text-white shadow-lg shadow-pink-200 transition-all hover:bg-pink-700 hover:shadow-xl dark:shadow-pink-900/30">
                {t('hero.cta')} <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="inline-flex h-12 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-8 text-base font-medium text-zinc-700 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
                {t('hero.altCta')}
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-zinc-100 bg-zinc-50 px-4 py-20 dark:border-zinc-800 dark:bg-zinc-900/50 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white">{t('features.title')}</h2>
              <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t('features.subtitle')}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.titleKey} className="group rounded-xl border border-zinc-200 bg-white p-6 transition-all hover:border-pink-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-pink-900">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-600 transition-colors group-hover:bg-pink-100 dark:bg-pink-950/30 dark:text-pink-400">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-white">{t(feature.titleKey)}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{t(feature.descKey)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 px-8 py-16 text-center text-white shadow-xl">
              <h2 className="mb-4 text-3xl font-bold">{t('cta.title')}</h2>
              <p className="mb-8 text-lg text-pink-100">{t('cta.subtitle')}</p>
              <Link href="/register" className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-8 text-base font-medium text-pink-600 shadow-lg transition-all hover:bg-pink-50 hover:shadow-xl">
                {t('cta.button')} <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-zinc-100 bg-white px-4 py-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Heart className="h-4 w-4 text-pink-500" />
            MamaCare AI &copy; {new Date().getFullYear()}. {t('footer.copyright')}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Shield className="h-3 w-3" /> {t('footer.tagline')}
          </div>
        </div>
      </footer>
    </div>
  );
}


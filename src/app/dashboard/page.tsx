'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatCard } from '@/components/shared/stat-card';
import { HealthScoreCard } from '@/components/shared/health-score-card';
import { PregnancyProgress } from '@/components/shared/pregnancy-progress';
import { RiskBadge } from '@/components/shared/risk-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { useTrackingStore } from '@/lib/store/tracking-store';
import { calculateGestationalAge, getTrimester, getDaysUntilDue } from '@/lib/utils/date';
import { getBloodPressureCategory, getBloodSugarCategory, assessRiskLevel } from '@/lib/utils/calculations';
import { Heart, Weight, Activity, Droplets, Baby, CalendarDays, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { motherProfile, pregnancyProfile, loadProfiles } = useProfileStore();
  const { weightEntries, bloodPressureEntries, bloodSugarEntries, loadTrackingData } = useTrackingStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { if (user?.id) loadProfiles(user.id); }, [user?.id, loadProfiles]);
  useEffect(() => { if (motherProfile?.id) loadTrackingData(motherProfile.id); }, [motherProfile?.id, loadTrackingData]);

  if (!mounted) return null;

  const latestWeight = weightEntries[0];
  const latestBP = bloodPressureEntries[0];
  const latestBS = bloodSugarEntries[0];
  const gestationalAge = pregnancyProfile?.gestationalAge ?? 0;
  const trimester = pregnancyProfile?.trimester ?? 1;
  const daysUntilDue = pregnancyProfile?.dueDate ? getDaysUntilDue(pregnancyProfile.dueDate) : 0;
  const bpCategory = latestBP ? getBloodPressureCategory(latestBP.systolic, latestBP.diastolic) : null;
  const bsCategory = latestBS ? getBloodSugarCategory(latestBS.level, latestBS.type) : null;
  const riskLevel = assessRiskLevel(
    bpCategory === 'Stage 2' || bpCategory === 'Crisis' ? 30 : bpCategory === 'Stage 1' ? 60 : bpCategory === 'Elevated' ? 80 : 90
  );

  const quickActions = [
    { label: 'Health Tracking', href: '/dashboard/tracking', icon: <Activity className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
    { label: 'AI Assessment', href: '/dashboard/ai-intelligence', icon: <Heart className="h-4 w-4" />, color: 'text-pink-600 bg-pink-50' },
    { label: 'Emergency SOS', href: '/dashboard/emergency', icon: <AlertTriangle className="h-4 w-4" />, color: 'text-red-600 bg-red-50' },
    { label: 'Reminders', href: '/dashboard/reminders', icon: <CalendarDays className="h-4 w-4" />, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome, {user?.fullName?.split(' ')[0] || 'Mother'}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Here&apos;s your pregnancy health overview</p>
          </div>
          <RiskBadge level={riskLevel} />
        </div>

        {pregnancyProfile && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <PregnancyProgress currentWeek={gestationalAge} dueDate={pregnancyProfile.dueDate} trimester={trimester} />
            </div>
            <HealthScoreCard score={85} label="Maternal Health Score" size="md" />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={"flex h-10 w-10 items-center justify-center rounded-lg " + action.color}>{action.icon}</div>
                  <span className="flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">{action.label}</span>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Current Weight" value={latestWeight ? latestWeight.weight + ' kg' : '--'} icon={<Weight className="h-5 w-5" />} variant="primary" />
          <StatCard title="Blood Pressure" value={latestBP ? latestBP.systolic + '/' + latestBP.diastolic : '--'} icon={<Activity className="h-5 w-5" />} description={bpCategory || 'No data'} variant={bpCategory === 'Normal' || !bpCategory ? 'default' : 'warning'} />
          <StatCard title="Blood Sugar" value={latestBS ? latestBS.level + ' mg/dL' : '--'} icon={<Droplets className="h-5 w-5" />} description={bsCategory || 'No data'} variant={bsCategory === 'Normal' || !bsCategory ? 'default' : 'warning'} />
          <StatCard title="Days Until Due" value={daysUntilDue > 0 ? daysUntilDue : 0} icon={<Baby className="h-5 w-5" />} variant="success" description={daysUntilDue > 0 ? 'remaining' : 'past due'} />
        </div>

        {!pregnancyProfile && (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <Baby className="h-12 w-12 text-pink-300" />
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Start Your Pregnancy Journey</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Set up your pregnancy profile to begin tracking</p>
              </div>
              <Link href="/dashboard/profile">
                <span className="inline-flex h-10 items-center rounded-lg bg-pink-600 px-4 text-sm font-medium text-white hover:bg-pink-700">Set Up Profile</span>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

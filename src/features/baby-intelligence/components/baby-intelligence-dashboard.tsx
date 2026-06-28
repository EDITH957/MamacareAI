'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { RiskBadge } from '@/components/shared/risk-badge';
import { db } from '@/lib/services/database';
import { generateBabyAIAssessment } from '@/lib/services/ai-service';
import { BrainCircuit, TrendingUp, Apple, AlertTriangle, RefreshCw, Sparkles, Baby } from 'lucide-react';
import type { BabyProfile, BabyHealthMetric, FeedingEntry, BabyAIAssessment } from '@/types';

export function BabyIntelligenceDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, loadProfiles } = useProfileStore();
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [assessment, setAssessment] = useState<BabyAIAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user?.id) loadProfiles(user.id); }, [user?.id, loadProfiles]);

  const loadBabyAndAssess = async () => {
    if (!motherProfile) return;
    const babies = await db.babyProfiles.where('motherId').equals(motherProfile.id).toArray();
    if (!babies.length) return;
    setBaby(babies[0]);
    setLoading(true);
    try {
      const [metrics, feedings] = await Promise.all([
        db.babyHealthMetrics.where('babyId').equals(babies[0].id).toArray(),
        db.feedingEntries.where('babyId').equals(babies[0].id).toArray(),
      ]);
      const result = await generateBabyAIAssessment({
        babyId: babies[0].id,
        age: babies[0].dateOfBirth ? Math.floor((Date.now() - new Date(babies[0].dateOfBirth).getTime()) / (1000 * 60 * 60 * 24)) : 0,
        weight: babies[0].birthWeight,
        height: babies[0].birthHeight,
        headCircumference: 0,
        feedingType: babies[0].feedingType,
      });
      setAssessment(result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!motherProfile) return;
    (async () => {
      const babies = await db.babyProfiles.where('motherId').equals(motherProfile.id).toArray();
      if (!babies.length) return;
      setBaby(babies[0]);
      setLoading(true);
      try {
        const [metrics, feedings] = await Promise.all([
          db.babyHealthMetrics.where('babyId').equals(babies[0].id).toArray(),
          db.feedingEntries.where('babyId').equals(babies[0].id).toArray(),
        ]);
        const result = await generateBabyAIAssessment({
          babyId: babies[0].id,
          age: babies[0].dateOfBirth ? Math.floor((Date.now() - new Date(babies[0].dateOfBirth).getTime()) / (1000 * 60 * 60 * 24)) : 0,
          weight: babies[0].birthWeight,
          height: babies[0].birthHeight,
          headCircumference: 0,
          feedingType: babies[0].feedingType,
        });
        setAssessment(result);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [motherProfile]);

  if (!baby) {
    return (
      <div className="space-y-6">
        <PageHeader title="Baby Intelligence" description="AI-powered newborn health analysis" />
        <EmptyState icon={<Baby className="h-7 w-7" />} title="No baby profile" description="Add your baby in Postnatal Care first." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Baby Intelligence" description={"AI analysis for " + baby.name}
        actions={<Button size="sm" variant="outline" onClick={loadBabyAndAssess} loading={loading} icon={<RefreshCw className="h-4 w-4" />}>Refresh</Button>} />

      {assessment && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Infection Risk" value={assessment.infectionRisk.charAt(0).toUpperCase() + assessment.infectionRisk.slice(1)} icon={<AlertTriangle className="h-5 w-5" />} variant={assessment.infectionRisk === 'high' ? 'danger' : assessment.infectionRisk === 'moderate' ? 'warning' : 'success'} />
          <StatCard title="Growth Forecasts" value={assessment.growthTrend.length} icon={<TrendingUp className="h-5 w-5" />} variant="primary" description="Active trends" />
          <StatCard title="Development Forecasts" value={assessment.developmentForecast.length} icon={<Sparkles className="h-5 w-5" />} variant="success" description="Upcoming milestones" />
          <StatCard title="Feeding Tips" value={assessment.feedingOptimization.length} icon={<Apple className="h-5 w-5" />} variant="warning" description="Optimization tips" />
        </div>
      )}

      {loading && <LoadingState message="Analyzing baby health data..." />}

      {assessment && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Feeding Optimization</CardTitle></CardHeader><CardContent>
            <ul className="space-y-2">{assessment.feedingOptimization.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-pink-50 px-3 py-2 text-sm text-pink-700 dark:bg-pink-950/30 dark:text-pink-300"><Apple className="mt-0.5 h-4 w-4 shrink-0" />{tip}</li>
            ))}</ul>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Growth Trend Analysis</CardTitle></CardHeader><CardContent>
            <ul className="space-y-2">{assessment.growthTrend.map((trend, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"><TrendingUp className="mt-0.5 h-4 w-4 shrink-0" />{trend}</li>
            ))}</ul>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Development Milestone Forecast</CardTitle></CardHeader><CardContent>
            <ul className="space-y-2">{assessment.developmentForecast.map((dev, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"><Sparkles className="mt-0.5 h-4 w-4 shrink-0" />{dev}</li>
            ))}</ul>
          </CardContent></Card>

          <Card><CardHeader><CardTitle>Health Trend Predictions</CardTitle></CardHeader><CardContent>
            <ul className="space-y-2">{assessment.healthTrendPrediction.map((pred, i) => (
              <li key={i} className="flex items-start gap-2 rounded-lg bg-purple-50 px-3 py-2 text-sm text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"><BrainCircuit className="mt-0.5 h-4 w-4 shrink-0" />{pred}</li>
            ))}</ul>
          </CardContent></Card>
        </div>
      )}

      {assessment && (
        <Card><CardHeader><CardTitle>Personalized Care Recommendations</CardTitle></CardHeader><CardContent>
          <ul className="space-y-2">{assessment.recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-950/30"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <p className="text-sm text-amber-700 dark:text-amber-300">{rec}</p>
            </li>
          ))}</ul>
        </CardContent></Card>
      )}
    </div>
  );
}

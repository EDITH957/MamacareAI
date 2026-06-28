'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { HealthScoreCard } from '@/components/shared/health-score-card';
import { RiskBadge } from '@/components/shared/risk-badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { generatePregnancyAssessment } from '@/lib/services/ai-service';
import { BrainCircuit, AlertTriangle, CheckCircle, Lightbulb, Sparkles, RefreshCw } from 'lucide-react';
import type { AIAssessment } from '@/types';

export function AIIntelligenceDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, pregnancyProfile, loadProfiles } = useProfileStore();
  const [assessment, setAssessment] = useState<AIAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => { if (user?.id) loadProfiles(user.id); }, [user?.id, loadProfiles]);

  const runAssessment = async () => {
    if (!motherProfile || !pregnancyProfile) return;
    setLoading(true);
    try {
      const result = await generatePregnancyAssessment({
        motherId: motherProfile.id,
        age: motherProfile.age,
        pregnancyType: motherProfile.pregnancyType,
        gestationalWeek: pregnancyProfile.gestationalAge,
        recentMetrics: [],
        weightEntries: [],
        bpEntries: [],
        sugarEntries: [],
        previousPreterm: false,
        fetusesCount: pregnancyProfile.fetuses?.length || 1,
      });
      setAssessment(result);
    } catch (err) {
      console.error('Assessment failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!motherProfile || !pregnancyProfile || assessment) return;
    (async () => {
      setLoading(true);
      try {
        const result = await generatePregnancyAssessment({
          motherId: motherProfile.id,
          age: motherProfile.age,
          pregnancyType: motherProfile.pregnancyType,
          gestationalWeek: pregnancyProfile.gestationalAge,
          recentMetrics: [],
          weightEntries: [],
          bpEntries: [],
          sugarEntries: [],
          previousPreterm: false,
          fetusesCount: pregnancyProfile.fetuses?.length || 1,
        });
        setAssessment(result);
      } catch (err) {
        console.error('Assessment failed:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [motherProfile, pregnancyProfile, assessment]);

  const tabs = [
    { id: 'overview', label: 'Health Overview', icon: <BrainCircuit className="h-4 w-4" /> },
    { id: 'risk', label: 'Risk Assessment', icon: <AlertTriangle className="h-4 w-4" /> },
    { id: 'recommendations', label: 'Recommendations', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'insights', label: 'Daily Insights', icon: <Sparkles className="h-4 w-4" /> },
  ];

  if (!motherProfile || !pregnancyProfile) {
    return (
      <div className="space-y-6">
        <PageHeader title="AI Intelligence" description="AI-powered pregnancy health analysis" />
        <EmptyState icon={<BrainCircuit className="h-7 w-7" />} title="Set up your profile first" description="Complete your profile and pregnancy information to enable AI assessments." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Intelligence"
        description="AI-powered pregnancy health analysis and risk assessment"
        actions={
          <Button size="sm" variant="outline" onClick={runAssessment} loading={loading} icon={<RefreshCw className="h-4 w-4" />}>
            Refresh Analysis
          </Button>
        }
      />

      {assessment && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Preterm Labor Risk" value={assessment.pretermRisk.charAt(0).toUpperCase() + assessment.pretermRisk.slice(1)} icon={<AlertTriangle className="h-5 w-5" />} variant={assessment.pretermRisk === 'high' ? 'danger' : assessment.pretermRisk === 'moderate' ? 'warning' : 'success'} />
          <StatCard title="Wellbeing Score" value={assessment.wellbeingScore + '/100'} icon={<BrainCircuit className="h-5 w-5" />} variant={assessment.wellbeingScore >= 80 ? 'success' : assessment.wellbeingScore >= 50 ? 'warning' : 'danger'} />
          <StatCard title="Risk Assessment" value={assessment.riskAssessment} icon={<AlertTriangle className="h-5 w-5" />} variant={assessment.riskAssessment.toLowerCase() === 'high' ? 'danger' : assessment.riskAssessment.toLowerCase() === 'moderate' ? 'warning' : 'success'} />
          <StatCard title="Nutritional Tips" value={assessment.nutritionalGuidance.length} icon={<Sparkles className="h-5 w-5" />} variant="primary" description="Available tips" />
        </div>
      )}

      {assessment && (
        <div className="grid gap-4 lg:grid-cols-2">
          <HealthScoreCard score={assessment.maternalHealthScore} label="Maternal Health Score" size="lg" />
          <Card>
            <CardHeader><CardTitle>Fetal Growth Forecast</CardTitle><CardDescription>Projected growth for each fetus</CardDescription></CardHeader>
            <CardContent className="space-y-3">
              {assessment.fetalGrowthForecast.map((f, i) => (
                <div key={i} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">Fetus {i + 1}</span>
                    <RiskBadge level={f.risk} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs text-zinc-500">
                    <div><span className="block font-medium text-zinc-700 dark:text-zinc-300">Current</span>{f.currentWeight}g</div>
                    <div><span className="block font-medium text-zinc-700 dark:text-zinc-300">Projected</span>{f.projectedWeight}g</div>
                    <div><span className="block font-medium text-zinc-700 dark:text-zinc-300">Growth Rate</span>{f.growthRate}g/week</div>
                  </div>
                  <Progress value={f.percentile} max={100} size="sm" variant="default" className="mt-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline">
        {(tabId) => (
          <>
            {tabId === 'overview' && assessment && (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Nutritional Guidance</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessment.nutritionalGuidance.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-300">
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" /> {tip}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Daily Insights</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessment.dailyInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" /> {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {tabId === 'risk' && assessment && (
              <Card>
                <CardHeader><CardTitle>Risk Assessment Details</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">Preterm Labor Risk</span>
                      <RiskBadge level={assessment.pretermRisk} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">Overall Risk Level</span>
                      <Badge variant={assessment.riskAssessment.toLowerCase() === 'high' ? 'danger' : assessment.riskAssessment.toLowerCase() === 'moderate' ? 'warning' : 'success'}>{assessment.riskAssessment}</Badge>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-zinc-500">Maternal Health Score</span>
                      <Progress value={assessment.maternalHealthScore} max={100} size="lg" variant={assessment.maternalHealthScore >= 80 ? 'success' : assessment.maternalHealthScore >= 50 ? 'warning' : 'danger'} showLabel className="mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {tabId === 'recommendations' && assessment && (
              <Card>
                <CardHeader><CardTitle>Personalized Recommendations</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg bg-purple-50 px-4 py-3 dark:bg-purple-950/30">
                        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" />
                        <div><p className="text-sm font-medium text-purple-900 dark:text-purple-200">Recommendation {i + 1}</p><p className="text-sm text-purple-700 dark:text-purple-300">{rec}</p></div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {tabId === 'insights' && assessment && (
              <Card>
                <CardHeader><CardTitle>Daily Health Insights</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.dailyInsights.map((insight, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg bg-pink-50 px-4 py-3 dark:bg-pink-950/30">
                        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
                        <p className="text-sm text-pink-700 dark:text-pink-300">{insight}</p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Tabs>
    </div>
  );
}

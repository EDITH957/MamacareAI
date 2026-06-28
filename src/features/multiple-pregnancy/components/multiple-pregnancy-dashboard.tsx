'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { HealthScoreCard } from '@/components/shared/health-score-card';
import { RiskBadge } from '@/components/shared/risk-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Progress } from '@/components/ui/progress';
import { generateMultiplePregnancyAssessment, analyzeBabyCry, generateMultiBabyHealthAlerts } from '@/lib/services/ai-service';
import { db } from '@/lib/services/database';
import { toast } from 'sonner';
import {
  Baby, Activity, AlertTriangle, TrendingUp, RefreshCw, Heart, CheckCircle,
  Apple, AudioWaveform, Bell, Stethoscope, Sun, Thermometer, Weight,
  Plus, Baby as BabyIcon, Clock, Mic, Sparkles,
} from 'lucide-react';
import type { MultiplePregnancyAssessment, Fetus, BabyProfile, FeedingEntry, CryAnalysisResult, MultiBabyAlert, TwinFeedingSession, TwinCrySession } from '@/types';

export function MultiplePregnancyDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, pregnancyProfile, loadProfiles, updateFetus, addFetus } = useProfileStore();
  const [assessment, setAssessment] = useState<MultiplePregnancyAssessment | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showFetusModal, setShowFetusModal] = useState(false);
  const [fetusData, setFetusData] = useState<Record<string, { weight: string; height: string; heartRate: string; movement: string }>>({});
  const [showBirthModal, setShowBirthModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [showCryModal, setShowCryModal] = useState(false);
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [feedings, setFeedings] = useState<FeedingEntry[]>([]);
  const [cryResults, setCryResults] = useState<CryAnalysisResult[]>([]);
  const [alerts, setAlerts] = useState<MultiBabyAlert[]>([]);
  const [feedingForm, setFeedingForm] = useState<Record<string, { type: string; amount: string; duration: string; notes: string }>>({});
  const [cryForm, setCryForm] = useState<Record<string, { duration: string; intensity: string; notes: string }>>({});

  const loadBabiesAndData = useCallback(async () => {
    if (!motherProfile) return;
    const found = await db.babyProfiles.where('motherId').equals(motherProfile.id).toArray();
    setBabies(found);
    if (found.length > 0) {
      const allFeedings = await db.feedingEntries.where('babyId').anyOf(found.map(b => b.id)).toArray();
      setFeedings(allFeedings);
      const allCries = await db.cryAnalysisResults.where('babyId').anyOf(found.map(b => b.id)).toArray();
      setCryResults(allCries);
      const allAlerts = await db.multiBabyAlerts.where('motherId').equals(motherProfile.id).toArray();
      setAlerts(allAlerts.filter(a => !a.isResolved));
    }
  }, [motherProfile]);

  useEffect(() => { if (user?.id) loadProfiles(user.id); }, [user?.id, loadProfiles]);
  useEffect(() => {
    if (!motherProfile) return;
    (async () => {
      const found = await db.babyProfiles.where('motherId').equals(motherProfile.id).toArray();
      setBabies(found);
      if (found.length > 0) {
        const allFeedings = await db.feedingEntries.where('babyId').anyOf(found.map(b => b.id)).toArray();
        setFeedings(allFeedings);
        const allCries = await db.cryAnalysisResults.where('babyId').anyOf(found.map(b => b.id)).toArray();
        setCryResults(allCries);
        const allAlerts = await db.multiBabyAlerts.where('motherId').equals(motherProfile.id).toArray();
        setAlerts(allAlerts.filter(a => !a.isResolved));
      }
    })();
  }, [motherProfile]);

  const runAssessment = async () => {
    if (!motherProfile || !pregnancyProfile || !pregnancyProfile.fetuses) return;
    setLoading(true);
    try {
      const result = await generateMultiplePregnancyAssessment({
        motherId: motherProfile.id,
        age: motherProfile.age,
        fetusCount: pregnancyProfile.fetuses?.length || 1,
        gestationalWeek: pregnancyProfile.gestationalAge,
        bpSystolic: 120,
        bpDiastolic: 80,
        bloodSugar: 95,
      });
      setAssessment(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!pregnancyProfile?.fetuses?.length || assessment) return;
    (async () => {
      if (!motherProfile) return;
      setLoading(true);
      try {
        const result = await generateMultiplePregnancyAssessment({
          motherId: motherProfile.id,
          age: motherProfile.age,
          fetusCount: pregnancyProfile.fetuses?.length || 1,
          gestationalWeek: pregnancyProfile.gestationalAge,
          bpSystolic: 120,
          bpDiastolic: 80,
          bloodSugar: 95,
        });
        setAssessment(result);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [pregnancyProfile, assessment, motherProfile]);

  const isMultiple = motherProfile?.pregnancyType === 'twin' || motherProfile?.pregnancyType === 'triplet';
  const fetusList = pregnancyProfile?.fetuses || [];

  const handleUpdateFetus = async (fetusId: string) => {
    if (!pregnancyProfile) return;
    const data = fetusData[fetusId];
    if (!data) return;
    try {
      await updateFetus(pregnancyProfile.id, fetusId, {
        estimatedWeight: parseFloat(data.weight) || 0,
        estimatedHeight: parseFloat(data.height) || 0,
        heartRate: parseInt(data.heartRate) || 0,
        movementCount: parseInt(data.movement) || 0,
      });
      toast.success('Fetus data updated');
      runAssessment();
    } catch { toast.error('Update failed'); }
  };

  const handleRegisterBirths = async () => {
    if (!motherProfile || !pregnancyProfile) return;
    try {
      for (const fetus of fetusList) {
        const exists = babies.find(b => b.name === fetus.label);
        if (!exists) {
          const newBaby: BabyProfile = {
            id: crypto.randomUUID(),
            motherId: motherProfile.id,
            name: fetus.label,
            gender: 'unknown',
            dateOfBirth: new Date().toISOString(),
            birthWeight: Math.round(fetus.estimatedWeight / 1000 * 100) / 100,
            birthHeight: fetus.estimatedHeight,
            bloodType: '',
            feedingType: 'breast',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await db.babyProfiles.add(newBaby);
        }
      }
      setShowBirthModal(false);
      await loadBabiesAndData();
      toast.success(`Birth registered for ${fetusList.length} babies`);
    } catch { toast.error('Failed to register births'); }
  };

  const handleLogFeeding = async () => {
    if (!motherProfile) return;
    try {
      for (const [babyId, data] of Object.entries(feedingForm)) {
        if (!data.type) continue;
        const entry: FeedingEntry = {
          id: crypto.randomUUID(),
          babyId,
          date: new Date().toISOString().split('T')[0],
          time: new Date().toISOString(),
          type: data.type as 'breast' | 'formula' | 'mixed',
          amount: data.amount ? parseFloat(data.amount) : undefined,
          duration: data.duration ? parseInt(data.duration) : undefined,
          notes: data.notes,
        };
        await db.feedingEntries.add(entry);
      }
      setShowFeedingModal(false);
      setFeedingForm({});
      await loadBabiesAndData();
      toast.success('Feedings logged');
    } catch { toast.error('Failed to log feedings'); }
  };

  const handleAnalyzeCry = async () => {
    if (!motherProfile) return;
    try {
      for (const [babyId, data] of Object.entries(cryForm)) {
        if (!data.duration) continue;
        const result = analyzeBabyCry({
          babyId,
          duration: parseInt(data.duration),
          frequency: 1,
          context: data.notes,
        });
        await db.cryAnalysisResults.add(result);
      }
      setShowCryModal(false);
      setCryForm({});
      await loadBabiesAndData();
      toast.success('Cry analysis complete');
    } catch { toast.error('Failed to analyze cries'); }
  };

  const refreshAlerts = async () => {
    if (!motherProfile || babies.length === 0) return;
    setLoading(true);
    try {
      const babyData = babies.map(b => ({
        id: b.id,
        label: b.name,
        profile: b,
        feedings: feedings.filter(f => f.babyId === b.id),
      }));
      const newAlerts = generateMultiBabyHealthAlerts({ motherId: motherProfile.id, babies: babyData });
      for (const alert of newAlerts) await db.multiBabyAlerts.add(alert);
      setAlerts(prev => [...newAlerts, ...prev]);
      toast.success('Health alerts updated');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resolveAlert = async (alertId: string) => {
    await db.multiBabyAlerts.update(alertId, { isResolved: true, resolvedAt: new Date().toISOString() });
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast.success('Alert resolved');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Baby className="h-4 w-4" /> },
    { id: 'individual', label: 'Individual Profiles', icon: <Heart className="h-4 w-4" /> },
    { id: 'comparison', label: 'Growth Comparison', icon: <TrendingUp className="h-4 w-4" /> },
    ...(babies.length > 0 ? [
      { id: 'postnatal', label: 'Postnatal Care', icon: <Stethoscope className="h-4 w-4" /> },
      { id: 'cry', label: 'Cry Coordination', icon: <AudioWaveform className="h-4 w-4" /> },
      { id: 'alerts', label: 'Health Alerts', icon: <Bell className="h-4 w-4" /> },
    ] : []),
  ];

  if (!isMultiple) {
    return (
      <div className="space-y-6">
        <PageHeader title="Multiple Pregnancy Intelligence" description="Advanced monitoring for twin & triplet pregnancies" />
        <EmptyState icon={<Baby className="h-7 w-7" />} title="Multiple Pregnancy Mode" description="This feature is for twin and triplet pregnancies. Update your pregnancy type in your profile." />
      </div>
    );
  }

  const alertSeverityVariant: Record<string, 'danger' | 'warning' | 'success'> = {
    critical: 'danger', warning: 'warning', info: 'success',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multiple Pregnancy Intelligence"
        description={"Advanced monitoring for your " + motherProfile?.pregnancyType + " pregnancy"}
        actions={
          <div className="flex gap-2">
            {babies.length === 0 && fetusList.length > 0 && (
              <Button size="sm" icon={<BabyIcon className="h-4 w-4" />} onClick={() => setShowBirthModal(true)}>
                Register Birth{isMultiple ? 'es' : ''}
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => { runAssessment(); refreshAlerts(); }} loading={loading} icon={<RefreshCw className="h-4 w-4" />}>
              Refresh
            </Button>
          </div>
        }
      />

      {assessment && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Growth Disparity" value={assessment.growthDisparity.toFixed(1) + '%'} icon={<Activity className="h-5 w-5" />} variant={assessment.growthDisparityRisk === 'high' ? 'danger' : assessment.growthDisparityRisk === 'moderate' ? 'warning' : 'success'} />
          <StatCard title="Twin-to-Twin Risk" value={assessment.twinToTwinRisk.charAt(0).toUpperCase() + assessment.twinToTwinRisk.slice(1)} icon={<AlertTriangle className="h-5 w-5" />} variant={assessment.twinToTwinRisk === 'high' ? 'danger' : assessment.twinToTwinRisk === 'moderate' ? 'warning' : 'success'} />
          <StatCard title="Preterm Birth Risk" value={assessment.pretermBirthRisk.charAt(0).toUpperCase() + assessment.pretermBirthRisk.slice(1)} icon={<Baby className="h-5 w-5" />} variant={assessment.pretermBirthRisk === 'high' ? 'danger' : assessment.pretermBirthRisk === 'moderate' ? 'warning' : 'success'} />
          <StatCard title="Overall Score" value={assessment.overallScore + '/100'} icon={<Heart className="h-5 w-5" />} variant={assessment.overallScore >= 80 ? 'success' : assessment.overallScore >= 50 ? 'warning' : 'danger'} />
        </div>
      )}

      {assessment && (
        <div className="grid gap-4 lg:grid-cols-2">
          <HealthScoreCard score={assessment.overallScore} label="Multiple Pregnancy Health Score" size="lg" />
          <Card>
            <CardHeader><CardTitle>Anomaly Detection</CardTitle></CardHeader>
            <CardContent>
              {assessment.anomalies.length === 0 ? (
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-4 dark:bg-emerald-950/30">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">No anomalies detected. Everything looks normal.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {assessment.anomalies.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {a}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline">
        {(tabId) => (
          <>
            {tabId === 'overview' && assessment && (
              <div className="grid gap-4 lg:grid-cols-2">
                {assessment.individualScores.map((score) => (
                  <Card key={score.fetusId}>
                    <CardHeader><CardTitle>{score.label}</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between"><span className="text-sm text-zinc-500">Health Score</span><span className={"font-bold text-lg " + (score.healthScore >= 80 ? 'text-emerald-500' : score.healthScore >= 50 ? 'text-amber-500' : 'text-red-500')}>{score.healthScore}/100</span></div>
                      <Progress value={score.healthScore} max={100} size="sm" variant={score.healthScore >= 80 ? 'success' : score.healthScore >= 50 ? 'warning' : 'danger'} />
                      <div className="grid grid-cols-2 gap-2 text-sm"><div><span className="block text-zinc-500">Growth %ile</span><span className="font-medium text-zinc-900 dark:text-white">{score.growthPercentile}th</span></div><div><span className="block text-zinc-500">Heart Rate</span><span className="font-medium text-zinc-900 dark:text-white">{score.heartRate} bpm</span></div><div><span className="block text-zinc-500">Movement</span><span className="font-medium text-zinc-900 dark:text-white">{score.movementRate}/hr</span></div><div><span className="block text-zinc-500">Risk</span><RiskBadge level={score.riskLevel} size="sm" /></div></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {tabId === 'individual' && (
              <div className="grid gap-4 lg:grid-cols-2">
                {fetusList.map((fetus) => (
                  <Card key={fetus.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {fetus.label}
                        <RiskBadge level={fetus.riskLevel} size="sm" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                          <span className="block text-xs text-zinc-500">Weight</span>
                          <span className="text-lg font-bold text-zinc-900 dark:text-white">{fetus.estimatedWeight > 0 ? fetus.estimatedWeight + 'g' : '--'}</span>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                          <span className="block text-xs text-zinc-500">Height</span>
                          <span className="text-lg font-bold text-zinc-900 dark:text-white">{fetus.estimatedHeight > 0 ? fetus.estimatedHeight + 'cm' : '--'}</span>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                          <span className="block text-xs text-zinc-500">Heart Rate</span>
                          <span className="text-lg font-bold text-zinc-900 dark:text-white">{fetus.heartRate > 0 ? fetus.heartRate + ' bpm' : '--'}</span>
                        </div>
                        <div className="rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50">
                          <span className="block text-xs text-zinc-500">Movements</span>
                          <span className="text-lg font-bold text-zinc-900 dark:text-white">{fetus.movementCount > 0 ? fetus.movementCount + '/hr' : '--'}</span>
                        </div>
                      </div>
                      <div><span className="text-xs font-medium text-zinc-500">Growth Percentile</span><Progress value={fetus.percentile} max={100} size="sm" variant="default" showLabel className="mt-1" /></div>
                      <Button variant="outline" size="sm" fullWidth onClick={() => { setShowFetusModal(true); setFetusData((prev) => ({ ...prev, [fetus.id]: { weight: fetus.estimatedWeight.toString(), height: fetus.estimatedHeight.toString(), heartRate: fetus.heartRate.toString(), movement: fetus.movementCount.toString() } })); }}>Update Measurements</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {tabId === 'comparison' && assessment && (
              <Card>
                <CardHeader><CardTitle>Growth Comparison</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className={"grid gap-4 " + (fetusList.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                      {fetusList.map((fetus) => (
                        <div key={fetus.id} className="text-center">
                          <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-white">{fetus.label}</p>
                          <div className="flex h-32 items-end justify-center gap-1">
                            <div className="w-10 rounded-t-lg bg-pink-400 transition-all" style={{ height: Math.max(10, (fetus.estimatedWeight || 1) / 10) + 'px' }} />
                          </div>
                          <p className="mt-1 text-xs text-zinc-500">{fetus.estimatedWeight}g</p>
                        </div>
                      ))}
                    </div>
                    {assessment.alerts.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Alerts</p>
                        {assessment.alerts.map((alert, i) => (
                          <div key={i} className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> {alert}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {tabId === 'postnatal' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Per-Baby Feeding & Vitals</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Track feeding, weight, and vitals for each baby</p>
                  </div>
                  <Button size="sm" icon={<Apple className="h-4 w-4" />} onClick={() => {
                    const initial: Record<string, { type: string; amount: string; duration: string; notes: string }> = {};
                    babies.forEach(b => { initial[b.id] = { type: 'breast', amount: '', duration: '', notes: '' }; });
                    setFeedingForm(initial);
                    setShowFeedingModal(true);
                  }}>Log Feeding Session</Button>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {babies.map((b) => {
                    const babyFeedings = feedings.filter(f => f.babyId === b.id).slice(0, 5);
                    return (
                      <Card key={b.id}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-500" />
                            {b.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/50">
                              <span className="block text-xs text-zinc-500">Birth Weight</span>
                              <span className="font-semibold text-zinc-900 dark:text-white">{b.birthWeight > 0 ? b.birthWeight + ' kg' : '--'}</span>
                            </div>
                            <div className="rounded-lg bg-zinc-50 p-2 dark:bg-zinc-800/50">
                              <span className="block text-xs text-zinc-500">Feeding</span>
                              <span className="font-semibold text-zinc-900 dark:text-white capitalize">{b.feedingType}</span>
                            </div>
                          </div>

                          <div>
                            <span className="text-xs font-medium text-zinc-500">Today&apos;s Feedings ({babyFeedings.filter(f => f.date === new Date().toISOString().split('T')[0]).length})</span>
                            {babyFeedings.length === 0 ? (
                              <p className="mt-1 text-xs text-zinc-400">No feedings recorded</p>
                            ) : (
                              <div className="mt-1 space-y-1">
                                {babyFeedings.map(f => (
                                  <div key={f.id} className="flex items-center justify-between rounded bg-zinc-50 px-2 py-1 text-xs dark:bg-zinc-800/50">
                                    <span className="text-zinc-600 dark:text-zinc-400">{new Date(f.time).toLocaleTimeString()}</span>
                                    <span className="font-medium text-zinc-900 dark:text-white capitalize">{f.type} {f.amount ? `(${f.amount}ml)` : f.duration ? `(${f.duration}min)` : ''}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            fullWidth
                            icon={<AudioWaveform className="h-3 w-3" />}
                            onClick={() => {
                              setCryForm({ [b.id]: { duration: '15', intensity: 'moderate', notes: '' } });
                              setShowCryModal(true);
                            }}
                          >
                            Analyze {b.name}&apos;s Cry
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">Multi-Baby Feeding Summary</h4>
                  <div className="space-y-2">
                    {babies.map(b => {
                      const todayCount = feedings.filter(f => f.babyId === b.id && f.date === new Date().toISOString().split('T')[0]).length;
                      return (
                        <div key={b.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{b.name}</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-sm font-bold ${todayCount >= 8 ? 'text-emerald-500' : todayCount >= 4 ? 'text-amber-500' : 'text-red-500'}`}>
                              {todayCount}/12 today
                            </span>
                            <Progress value={(todayCount / 12) * 100} max={100} size="sm" variant={todayCount >= 8 ? 'success' : todayCount >= 4 ? 'warning' : 'danger'} className="w-20" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {tabId === 'cry' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Cry Coordination</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Analyze and compare cry patterns across babies</p>
                  </div>
                  <Button size="sm" icon={<Mic className="h-4 w-4" />} onClick={() => {
                    const initial: Record<string, { duration: string; intensity: string; notes: string }> = {};
                    babies.forEach(b => { initial[b.id] = { duration: '15', intensity: 'moderate', notes: '' }; });
                    setCryForm(initial);
                    setShowCryModal(true);
                  }}>Log Cry Session</Button>
                </div>

                {cryResults.length === 0 ? (
                  <EmptyState icon={<AudioWaveform className="h-7 w-7" />} title="No cry data" description="Log a cry session to analyze patterns for each baby." />
                ) : (
                  <>
                    <div className="grid gap-6 lg:grid-cols-2">
                      {babies.map(b => {
                        const babyCries = cryResults.filter(c => c.babyId === b.id).slice(0, 5);
                        return (
                          <Card key={b.id}>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <AudioWaveform className="h-4 w-4 text-pink-500" />
                                {b.name}&apos;s Cry Patterns
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {babyCries.length === 0 ? (
                                <p className="text-sm text-zinc-400">No cry analyses yet</p>
                              ) : (
                                <div className="space-y-2">
                                  {babyCries.map(c => (
                                    <div key={c.id} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                                      <div className="flex items-center justify-between">
                                        <Badge variant={c.cryType === 'pain' ? 'danger' : c.cryType === 'colic' ? 'warning' : 'success'}>
                                          {c.cryType}
                                        </Badge>
                                        <span className="text-xs text-zinc-400">{c.confidence}% confidence</span>
                                      </div>
                                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{c.probableCause}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Cry Comparison Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {babies.map(b => {
                            const babyCries = cryResults.filter(c => c.babyId === b.id);
                            const cryTypes = babyCries.map(c => c.cryType);
                            const dominantCry = cryTypes.length > 0
                              ? cryTypes.sort((a, b2) =>
                                  cryTypes.filter(v => v === b2).length - cryTypes.filter(v => v === a).length
                                )[0]
                              : 'none';
                            return (
                              <div key={b.id} className="rounded-lg border border-zinc-200 p-3 text-center dark:border-zinc-800">
                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{b.name}</p>
                                <p className="mt-1 text-2xl font-bold text-pink-500 capitalize">{dominantCry}</p>
                                <p className="text-xs text-zinc-500">{babyCries.length} cry analyses</p>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            )}

            {tabId === 'alerts' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Multi-Baby Health Alerts</h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{alerts.length} active alert{alerts.length !== 1 ? 's' : ''}</p>
                  </div>
                  <Button size="sm" variant="outline" icon={<RefreshCw className="h-4 w-4" />} onClick={refreshAlerts} loading={loading}>
                    Scan for Alerts
                  </Button>
                </div>

                {alerts.length === 0 ? (
                  <EmptyState
                    icon={<Bell className="h-7 w-7" />}
                    title="All clear"
                    description="No active health alerts. Run a scan to check for potential issues."
                    action={<Button variant="outline" size="sm" icon={<RefreshCw className="h-4 w-4" />} onClick={refreshAlerts}>Run Scan</Button>}
                  />
                ) : (
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`rounded-xl border-2 p-4 ${
                          alert.severity === 'critical' ? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30' :
                          alert.severity === 'warning' ? 'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30' :
                          'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {alert.severity === 'critical' ? (
                              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                            ) : alert.severity === 'warning' ? (
                              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                            ) : (
                              <Bell className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-zinc-900 dark:text-white">{alert.title}</span>
                                <Badge variant={alertSeverityVariant[alert.severity]}>{alert.severity}</Badge>
                              </div>
                              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{alert.description}</p>
                              <div className="mt-2 rounded-lg bg-white/60 px-3 py-2 text-sm dark:bg-zinc-900/60">
                                <span className="font-medium text-zinc-700 dark:text-zinc-300">Recommendation: </span>
                                <span className="text-zinc-500 dark:text-zinc-400">{alert.recommendation}</span>
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => resolveAlert(alert.id)} className="shrink-0">
                            Resolve
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Tabs>

      <Modal open={showFetusModal} onClose={() => setShowFetusModal(false)} title="Update Fetus Measurements" size="lg">
        {fetusList.map((fetus) => {
          const data = fetusData[fetus.id] || { weight: '', height: '', heartRate: '', movement: '' };
          return (
            <div key={fetus.id} className="mb-4 border-b border-zinc-100 pb-4 last:border-0 dark:border-zinc-800">
              <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">{fetus.label}</p>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Weight (g)" type="number" value={data.weight} onChange={(e) => setFetusData((prev) => ({ ...prev, [fetus.id]: { ...prev[fetus.id], weight: e.target.value } }))} />
                <Input label="Height (cm)" type="number" step="0.1" value={data.height} onChange={(e) => setFetusData((prev) => ({ ...prev, [fetus.id]: { ...prev[fetus.id], height: e.target.value } }))} />
                <Input label="Heart Rate (bpm)" type="number" value={data.heartRate} onChange={(e) => setFetusData((prev) => ({ ...prev, [fetus.id]: { ...prev[fetus.id], heartRate: e.target.value } }))} />
                <Input label="Movements/hr" type="number" value={data.movement} onChange={(e) => setFetusData((prev) => ({ ...prev, [fetus.id]: { ...prev[fetus.id], movement: e.target.value } }))} />
              </div>
              <Button size="sm" className="mt-3" onClick={() => handleUpdateFetus(fetus.id)}>Update {fetus.label}</Button>
            </div>
          );
        })}
      </Modal>

      <Modal open={showBirthModal} onClose={() => setShowBirthModal(false)} title={`Register Baby Birth${isMultiple ? 'es' : ''}`} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This will create baby profiles for {fetusList.length} babies using their current fetal measurements as birth data.
          </p>
          {fetusList.map((fetus) => (
            <div key={fetus.id} className="rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
              <p className="font-medium text-zinc-900 dark:text-white">{fetus.label}</p>
              <p className="text-xs text-zinc-500">Est. Weight: {fetus.estimatedWeight}g | Est. Height: {fetus.estimatedHeight}cm</p>
            </div>
          ))}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowBirthModal(false)}>Cancel</Button>
            <Button onClick={handleRegisterBirths}>Confirm Birth Registration</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showFeedingModal} onClose={() => setShowFeedingModal(false)} title="Log Feeding Session (All Babies)" size="lg">
        <div className="space-y-4">
          {babies.map(b => {
            const form = feedingForm[b.id] || { type: 'breast', amount: '', duration: '', notes: '' };
            return (
              <div key={b.id} className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">{b.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Select label="Type" options={[
                    { value: 'breast', label: 'Breastfeeding' },
                    { value: 'formula', label: 'Formula' },
                    { value: 'mixed', label: 'Mixed' },
                  ]} value={form.type} onChange={(e) => setFeedingForm(p => ({ ...p, [b.id]: { ...p[b.id], type: e.target.value } }))} />
                  <Input label="Amount (ml)" type="number" placeholder="e.g. 120" value={form.amount} onChange={(e) => setFeedingForm(p => ({ ...p, [b.id]: { ...p[b.id], amount: e.target.value } }))} />
                  <Input label="Duration (min)" type="number" placeholder="e.g. 20" value={form.duration} onChange={(e) => setFeedingForm(p => ({ ...p, [b.id]: { ...p[b.id], duration: e.target.value } }))} />
                  <Input label="Notes" placeholder="Optional" value={form.notes} onChange={(e) => setFeedingForm(p => ({ ...p, [b.id]: { ...p[b.id], notes: e.target.value } }))} />
                </div>
              </div>
            );
          })}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowFeedingModal(false)}>Cancel</Button>
            <Button onClick={handleLogFeeding}>Save Feedings</Button>
          </div>
        </div>
      </Modal>

      <Modal open={showCryModal} onClose={() => setShowCryModal(false)} title="Log Cry Session (All Babies)" size="lg">
        <div className="space-y-4">
          {babies.map(b => {
            const form = cryForm[b.id] || { duration: '15', intensity: 'moderate', notes: '' };
            return (
              <div key={b.id} className="rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                <p className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">{b.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Duration (seconds)" type="number" placeholder="e.g. 15" value={form.duration} onChange={(e) => setCryForm(p => ({ ...p, [b.id]: { ...p[b.id], duration: e.target.value } }))} />
                  <Select label="Intensity" options={[
                    { value: 'low', label: 'Low' },
                    { value: 'moderate', label: 'Moderate' },
                    { value: 'high', label: 'High' },
                  ]} value={form.intensity} onChange={(e) => setCryForm(p => ({ ...p, [b.id]: { ...p[b.id], intensity: e.target.value } }))} />
                  <div className="col-span-2">
                    <Input label="Context / Notes" placeholder="e.g. After feeding, while sleeping" value={form.notes} onChange={(e) => setCryForm(p => ({ ...p, [b.id]: { ...p[b.id], notes: e.target.value } }))} />
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCryModal(false)}>Cancel</Button>
            <Button onClick={handleAnalyzeCry}>Analyze Cries</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

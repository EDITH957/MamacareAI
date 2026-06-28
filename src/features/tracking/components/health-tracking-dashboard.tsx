'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { useTrackingStore } from '@/lib/store/tracking-store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { toast } from 'sonner';
import { getBloodPressureCategory, getBloodSugarCategory } from '@/lib/utils/calculations';
import { Weight, Activity, Droplets, TrendingUp, Plus, Timer, Heart } from 'lucide-react';

export function HealthTrackingDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, pregnancyProfile, loadProfiles } = useProfileStore();
  const { weightEntries, bloodPressureEntries, bloodSugarEntries, loadTrackingData, addWeightEntry, addBloodPressureEntry, addBloodSugarEntry } = useTrackingStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showBPModal, setShowBPModal] = useState(false);
  const [showBSModal, setShowBSModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [sugarLevel, setSugarLevel] = useState('');
  const [sugarType, setSugarType] = useState<'fasting' | 'postprandial' | 'random'>('fasting');

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
  const bpCategory = latestBP ? getBloodPressureCategory(latestBP.systolic, latestBP.diastolic) : null;
  const bsCategory = latestBS ? getBloodSugarCategory(latestBS.level, latestBS.type) : null;

  const handleAddWeight = async () => {
    if (!motherProfile || !weight || !pregnancyProfile) return;
    try {
      await addWeightEntry({ motherId: motherProfile.id, date: new Date().toISOString(), weight: parseFloat(weight), week: pregnancyProfile.gestationalAge });
      setShowWeightModal(false); setWeight('');
      toast.success('Weight entry added');
    } catch { toast.error('Failed to add weight'); }
  };

  const handleAddBP = async () => {
    if (!motherProfile || !systolic || !diastolic || !pregnancyProfile) return;
    try {
      await addBloodPressureEntry({ motherId: motherProfile.id, date: new Date().toISOString(), systolic: parseInt(systolic), diastolic: parseInt(diastolic), week: pregnancyProfile.gestationalAge });
      setShowBPModal(false); setSystolic(''); setDiastolic('');
      toast.success('Blood pressure entry added');
    } catch { toast.error('Failed to add BP entry'); }
  };

  const handleAddBS = async () => {
    if (!motherProfile || !sugarLevel || !pregnancyProfile) return;
    try {
      await addBloodSugarEntry({ motherId: motherProfile.id, date: new Date().toISOString(), level: parseFloat(sugarLevel), type: sugarType, week: pregnancyProfile.gestationalAge });
      setShowBSModal(false); setSugarLevel('');
      toast.success('Blood sugar entry added');
    } catch { toast.error('Failed to add blood sugar entry'); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Heart className="h-4 w-4" /> },
    { id: 'weight', label: 'Weight', icon: <Weight className="h-4 w-4" /> },
    { id: 'blood-pressure', label: 'Blood Pressure', icon: <Activity className="h-4 w-4" /> },
    { id: 'blood-sugar', label: 'Blood Sugar', icon: <Droplets className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Health Tracking"
        description="Monitor your maternal health metrics"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Current Weight" value={latestWeight ? latestWeight.weight + ' kg' : '--'} icon={<Weight className="h-5 w-5" />} variant="primary" onClick={() => setShowWeightModal(true)} />
        <StatCard title="Blood Pressure" value={latestBP ? latestBP.systolic + '/' + latestBP.diastolic : '--'} icon={<Activity className="h-5 w-5" />} description={bpCategory || ''} variant={bpCategory === 'Normal' || !bpCategory ? 'default' : 'warning'} onClick={() => setShowBPModal(true)} />
        <StatCard title="Blood Sugar" value={latestBS ? latestBS.level + ' mg/dL' : '--'} icon={<Droplets className="h-5 w-5" />} description={bsCategory || ''} variant={bsCategory === 'Normal' || !bsCategory ? 'default' : 'warning'} onClick={() => setShowBSModal(true)} />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline">
        {(tabId) => (
          <>
            {tabId === 'overview' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader><CardTitle>Weight History</CardTitle></CardHeader>
                  <CardContent>
                    {weightEntries.length === 0 ? <EmptyState title="No weight data" description="Start tracking your weight during pregnancy." /> : (
                      <div className="space-y-2">
                        {weightEntries.slice(0, 5).map((e) => (
                          <div key={e.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                            <span className="text-sm text-zinc-500">Week {e.week}</span>
                            <span className="font-medium text-zinc-900 dark:text-white">{e.weight} kg</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Recent Measurements</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {latestBP && (
                      <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                        <span className="text-xs font-medium text-zinc-500">Latest BP</span>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">{latestBP.systolic}/{latestBP.diastolic} <span className="text-sm font-normal text-zinc-400">mmHg</span></p>
                      </div>
                    )}
                    {latestBS && (
                      <div className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
                        <span className="text-xs font-medium text-zinc-500">Latest Blood Sugar ({latestBS.type})</span>
                        <p className="text-lg font-semibold text-zinc-900 dark:text-white">{latestBS.level} <span className="text-sm font-normal text-zinc-400">mg/dL</span></p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {tabId === 'weight' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Weight Tracking</CardTitle>
                  <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowWeightModal(true)}>Add Weight</Button>
                </CardHeader>
                <CardContent>
                  {weightEntries.length === 0 ? (
                    <EmptyState title="No weight entries" description="Track your weight throughout pregnancy." action={<Button size="sm" onClick={() => setShowWeightModal(true)}>Add First Entry</Button>} />
                  ) : (
                    <div className="space-y-2">
                      {weightEntries.map((e) => (
                        <div key={e.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800">
                          <div><p className="text-sm font-medium text-zinc-900 dark:text-white">Week {e.week}</p><p className="text-xs text-zinc-500">{new Date(e.date).toLocaleDateString()}</p></div>
                          <span className="text-lg font-bold text-zinc-900 dark:text-white">{e.weight} kg</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tabId === 'blood-pressure' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Blood Pressure Tracking</CardTitle>
                  <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowBPModal(true)}>Add Reading</Button>
                </CardHeader>
                <CardContent>
                  {bloodPressureEntries.length === 0 ? (
                    <EmptyState title="No BP readings" description="Monitor your blood pressure regularly." action={<Button size="sm" onClick={() => setShowBPModal(true)}>Add First Reading</Button>} />
                  ) : (
                    <div className="space-y-2">
                      {bloodPressureEntries.map((e) => {
                        const cat = getBloodPressureCategory(e.systolic, e.diastolic);
                        return (
                          <div key={e.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800">
                            <div><p className="text-sm font-medium text-zinc-900 dark:text-white">Week {e.week}</p><p className="text-xs text-zinc-500">{new Date(e.date).toLocaleDateString()} - {cat}</p></div>
                            <span className="text-lg font-bold text-zinc-900 dark:text-white">{e.systolic}/{e.diastolic} <span className="text-sm font-normal text-zinc-400">mmHg</span></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tabId === 'blood-sugar' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Blood Sugar Tracking</CardTitle>
                  <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowBSModal(true)}>Add Reading</Button>
                </CardHeader>
                <CardContent>
                  {bloodSugarEntries.length === 0 ? (
                    <EmptyState title="No blood sugar readings" description="Track your glucose levels." action={<Button size="sm" onClick={() => setShowBSModal(true)}>Add First Reading</Button>} />
                  ) : (
                    <div className="space-y-2">
                      {bloodSugarEntries.map((e) => {
                        const cat = getBloodSugarCategory(e.level, e.type);
                        return (
                          <div key={e.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800">
                            <div><p className="text-sm font-medium text-zinc-900 dark:text-white">Week {e.week} - {e.type}</p><p className="text-xs text-zinc-500">{new Date(e.date).toLocaleDateString()} - {cat}</p></div>
                            <span className="text-lg font-bold text-zinc-900 dark:text-white">{e.level} <span className="text-sm font-normal text-zinc-400">mg/dL</span></span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Tabs>

      <Modal open={showWeightModal} onClose={() => setShowWeightModal(false)} title="Add Weight Entry">
        <div className="space-y-4">
          <Input label="Weight (kg)" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 65.5" />
          <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowWeightModal(false)}>Cancel</Button><Button onClick={handleAddWeight}>Save</Button></div>
        </div>
      </Modal>

      <Modal open={showBPModal} onClose={() => setShowBPModal(false)} title="Add Blood Pressure Reading">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Systolic (mmHg)" type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} placeholder="e.g., 120" />
            <Input label="Diastolic (mmHg)" type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} placeholder="e.g., 80" />
          </div>
          <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowBPModal(false)}>Cancel</Button><Button onClick={handleAddBP}>Save</Button></div>
        </div>
      </Modal>

      <Modal open={showBSModal} onClose={() => setShowBSModal(false)} title="Add Blood Sugar Reading">
        <div className="space-y-4">
          <Input label="Blood Sugar Level (mg/dL)" type="number" step="0.1" value={sugarLevel} onChange={(e) => setSugarLevel(e.target.value)} placeholder="e.g., 95" />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reading Type</label>
            <div className="flex gap-2">
              {(['fasting', 'postprandial', 'random'] as const).map((t) => (
                <button key={t} onClick={() => setSugarType(t)} className={"flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors " + (sugarType === t ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400')}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowBSModal(false)}>Cancel</Button><Button onClick={handleAddBS}>Save</Button></div>
        </div>
      </Modal>
    </div>
  );
}

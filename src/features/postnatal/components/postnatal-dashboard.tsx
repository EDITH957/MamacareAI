'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/shared/empty-state';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { db } from '@/lib/services/database';
import { Baby, Weight, Thermometer, Apple, Syringe, TrendingUp, Plus, Stethoscope } from 'lucide-react';
import type { BabyProfile, FeedingEntry, Vaccination, DevelopmentMilestone, BabyHealthMetric } from '@/types';

export function PostnatalDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, loadProfiles } = useProfileStore();
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<BabyHealthMetric[]>([]);
  const [feedingEntries, setFeedingEntries] = useState<FeedingEntry[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBabyModal, setShowBabyModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [showVaccinationModal, setShowVaccinationModal] = useState(false);
  const [babyForm, setBabyForm] = useState({ name: '', gender: 'unknown' as string, dateOfBirth: '', birthWeight: '', birthHeight: '', bloodType: '', feedingType: 'breast' as string });

  useEffect(() => { if (user?.id) loadProfiles(user.id); }, [user?.id, loadProfiles]);

  const loadBabyData = async () => {
    if (!motherProfile) return;
    const babies = await db.babyProfiles.where('motherId').equals(motherProfile.id).toArray();
    if (babies.length > 0) {
      setBaby(babies[0]);
      const [metrics, feedings, vax] = await Promise.all([
        db.babyHealthMetrics.where('babyId').equals(babies[0].id).toArray(),
        db.feedingEntries.where('babyId').equals(babies[0].id).toArray(),
        db.vaccinations.where('babyId').equals(babies[0].id).toArray(),
      ]);
      setHealthMetrics(metrics.reverse());
      setFeedingEntries(feedings.reverse());
      setVaccinations(vax.reverse());
    }
  };

  useEffect(() => {
    if (!motherProfile) return;
    (async () => {
      const babies = await db.babyProfiles.where('motherId').equals(motherProfile.id).toArray();
      if (babies.length > 0) {
        setBaby(babies[0]);
        const [metrics, feedings, vax] = await Promise.all([
          db.babyHealthMetrics.where('babyId').equals(babies[0].id).toArray(),
          db.feedingEntries.where('babyId').equals(babies[0].id).toArray(),
          db.vaccinations.where('babyId').equals(babies[0].id).toArray(),
        ]);
        setHealthMetrics(metrics.reverse());
        setFeedingEntries(feedings.reverse());
        setVaccinations(vax.reverse());
      }
    })();
  }, [motherProfile]);

  const handleCreateBaby = async () => {
    if (!motherProfile || !babyForm.name || !babyForm.dateOfBirth) return;
    try {
      const newBaby: BabyProfile = {
        id: crypto.randomUUID(),
        motherId: motherProfile.id,
        name: babyForm.name,
        gender: babyForm.gender as 'male' | 'female' | 'unknown',
        dateOfBirth: new Date(babyForm.dateOfBirth).toISOString(),
        birthWeight: parseFloat(babyForm.birthWeight) || 0,
        birthHeight: parseFloat(babyForm.birthHeight) || 0,
        bloodType: babyForm.bloodType,
        feedingType: babyForm.feedingType as 'breast' | 'formula' | 'mixed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.babyProfiles.add(newBaby);
      setBaby(newBaby);
      setShowBabyModal(false);
      toast.success('Baby profile created');
    } catch { toast.error('Failed to create profile'); }
  };

  const handleAddFeeding = async () => {
    if (!baby) return;
    const form = document.getElementById('feeding-form') as HTMLFormElement;
    if (!form) return;
    const data = new FormData(form);
    try {
      const type = (data.get('type') as string) || 'breast';
      const entry: FeedingEntry = {
        id: crypto.randomUUID(), babyId: baby.id, date: new Date().toISOString().split('T')[0],
        time: new Date().toISOString(), type: type as 'breast' | 'formula' | 'mixed',
        amount: data.get('amount') ? parseFloat(data.get('amount') as string) : undefined,
        duration: data.get('duration') ? parseInt(data.get('duration') as string) : undefined,
        notes: data.get('notes') as string,
      };
      await db.feedingEntries.add(entry);
      setFeedingEntries([entry, ...feedingEntries]);
      setShowFeedingModal(false);
      toast.success('Feeding logged');
    } catch { toast.error('Failed to log feeding'); }
  };

  const handleAddVaccination = async () => {
    if (!baby) return;
    const form = document.getElementById('vax-form') as HTMLFormElement;
    if (!form) return;
    const data = new FormData(form);
    try {
      const vax: Vaccination = {
        id: crypto.randomUUID(), babyId: baby.id,
        name: data.get('name') as string,
        scheduledDate: new Date(data.get('scheduledDate') as string).toISOString(),
        isCompleted: false,
      };
      await db.vaccinations.add(vax);
      setVaccinations([vax, ...vaccinations]);
      setShowVaccinationModal(false);
      toast.success('Vaccination added');
    } catch { toast.error('Failed to add vaccination'); }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Baby className="h-4 w-4" /> },
    { id: 'growth', label: 'Growth', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'feeding', label: 'Feeding', icon: <Apple className="h-4 w-4" /> },
    { id: 'vaccinations', label: 'Vaccinations', icon: <Syringe className="h-4 w-4" /> },
  ];

  if (!baby) {
    return (
      <div className="space-y-6">
        <PageHeader title="Postnatal Care" description="Newborn health monitoring and care management" />
        <EmptyState icon={<Baby className="h-7 w-7" />} title="Add Your Baby" description="Create a baby profile to start tracking growth, feeding, and vaccinations."
          action={<Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowBabyModal(true)}>Add Baby</Button>} />
        <Modal open={showBabyModal} onClose={() => setShowBabyModal(false)} title="Add Baby Profile">
          <div className="space-y-4">
            <Input label="Baby's Name" value={babyForm.name} onChange={(e) => setBabyForm({ ...babyForm, name: e.target.value })} placeholder="Full name" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Gender" options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }, { value: 'unknown', label: 'Unknown' }]} value={babyForm.gender} onChange={(e) => setBabyForm({ ...babyForm, gender: e.target.value })} />
              <Select label="Feeding Type" options={[{ value: 'breast', label: 'Breastfeeding' }, { value: 'formula', label: 'Formula' }, { value: 'mixed', label: 'Mixed' }]} value={babyForm.feedingType} onChange={(e) => setBabyForm({ ...babyForm, feedingType: e.target.value })} />
            </div>
            <Input label="Date of Birth" type="date" value={babyForm.dateOfBirth} onChange={(e) => setBabyForm({ ...babyForm, dateOfBirth: e.target.value })} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Birth Weight (kg)" type="number" step="0.01" value={babyForm.birthWeight} onChange={(e) => setBabyForm({ ...babyForm, birthWeight: e.target.value })} />
              <Input label="Birth Height (cm)" type="number" step="0.1" value={babyForm.birthHeight} onChange={(e) => setBabyForm({ ...babyForm, birthHeight: e.target.value })} />
            </div>
            <Input label="Blood Type" value={babyForm.bloodType} onChange={(e) => setBabyForm({ ...babyForm, bloodType: e.target.value })} placeholder="e.g., A+" />
            <div className="flex justify-end gap-3"><Button variant="outline" onClick={() => setShowBabyModal(false)}>Cancel</Button><Button onClick={handleCreateBaby}>Save Baby Profile</Button></div>
          </div>
        </Modal>
      </div>
    );
  }

  const latestWeight = healthMetrics.find(m => m.weight > 0);
  const latestTemp = healthMetrics.find(m => m.temperature > 0);
  const completedVax = vaccinations.filter(v => v.isCompleted).length;

  return (
    <div className="space-y-6">
      <PageHeader title={"Welcome, " + baby.name} description="Newborn health monitoring and care management"
        actions={<Badge variant="primary" size="lg">{baby.feedingType} fed</Badge>} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Current Weight" value={latestWeight ? latestWeight.weight + ' kg' : baby.birthWeight + ' kg (birth)'} icon={<Weight className="h-5 w-5" />} variant="primary" />
        <StatCard title="Temperature" value={latestTemp ? latestTemp.temperature + '°C' : '--'} icon={<Thermometer className="h-5 w-5" />} variant="default" />
        <StatCard title="Feedings Today" value={feedingEntries.filter(e => e.date === new Date().toISOString().split('T')[0]).length} icon={<Apple className="h-5 w-5" />} variant="success" />
        <StatCard title="Vaccinations" value={completedVax + '/' + vaccinations.length} icon={<Syringe className="h-5 w-5" />} variant="warning" />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline">
        {(tabId) => (
          <>
            {tabId === 'overview' && (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card><CardHeader><CardTitle>Growth History</CardTitle></CardHeader><CardContent>
                  {healthMetrics.length === 0 ? <EmptyState title="No growth data" description="Start tracking your baby's growth." /> :
                    <div className="space-y-2">{healthMetrics.slice(0, 5).map((m) => (
                      <div key={m.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                        <span className="text-sm text-zinc-500">{new Date(m.date).toLocaleDateString()}</span>
                        <span className="font-medium text-zinc-900 dark:text-white">{m.weight > 0 ? m.weight + ' kg' : ''} {m.height > 0 ? '/' + m.height + ' cm' : ''}</span>
                      </div>
                    ))}</div>}
                </CardContent></Card>
                <Card><CardHeader><CardTitle>Recent Feedings</CardTitle></CardHeader><CardContent>
                  {feedingEntries.length === 0 ? <EmptyState title="No feeding data" /> :
                    <div className="space-y-2">{feedingEntries.slice(0, 5).map((e) => (
                      <div key={e.id} className="flex items-center justify-between rounded-lg bg-zinc-50 px-3 py-2 dark:bg-zinc-800/50">
                        <div><span className="text-sm font-medium text-zinc-900 dark:text-white">{e.type}</span><span className="ml-2 text-xs text-zinc-500">{new Date(e.time).toLocaleTimeString()}</span></div>
                        <span className="text-sm text-zinc-600">{e.amount ? e.amount + 'ml' : e.duration ? e.duration + 'min' : ''}</span>
                      </div>
                    ))}</div>}
                </CardContent></Card>
              </div>
            )}
            {tabId === 'growth' && (
              <Card><CardHeader><CardTitle>Growth Tracking</CardTitle></CardHeader><CardContent>
                <div className="mb-4 flex items-center gap-4"><Button size="sm" icon={<Plus className="h-4 w-4" />}>Add Measurement</Button></div>
                {healthMetrics.length === 0 ? <EmptyState title="No measurements yet" /> :
                  <div className="space-y-2">{healthMetrics.map((m) => (
                    <div key={m.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800">
                      <div><p className="text-sm font-medium">{new Date(m.date).toLocaleDateString()}</p></div>
                      <div className="flex gap-4 text-sm"><span>{m.weight > 0 ? m.weight + ' kg' : ''}</span><span>{m.height > 0 ? m.height + ' cm' : ''}</span><span>{m.headCircumference > 0 ? m.headCircumference + ' cm' : ''}</span></div>
                    </div>
                  ))}</div>}
              </CardContent></Card>
            )}
            {tabId === 'feeding' && (
              <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Feeding Log</CardTitle><Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowFeedingModal(true)}>Log Feeding</Button></CardHeader><CardContent>
                {feedingEntries.length === 0 ? <EmptyState title="No feedings logged" /> :
                  <div className="space-y-2">{feedingEntries.map((e) => (
                    <div key={e.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800">
                      <div><p className="text-sm font-medium text-zinc-900 dark:text-white capitalize">{e.type}</p><p className="text-xs text-zinc-500">{new Date(e.time).toLocaleString()}</p></div>
                      <span className="text-sm font-medium">{e.amount ? e.amount + ' ml' : e.duration ? e.duration + ' min' : ''}</span>
                    </div>
                  ))}</div>}
              </CardContent></Card>
            )}
            {tabId === 'vaccinations' && (
              <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle>Vaccination Schedule</CardTitle><Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowVaccinationModal(true)}>Add Vaccination</Button></CardHeader><CardContent>
                {vaccinations.length === 0 ? <EmptyState title="No vaccinations added" /> :
                  <div className="space-y-2">{vaccinations.map((v) => (
                    <div key={v.id} className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 dark:border-zinc-800">
                      <div><p className="text-sm font-medium text-zinc-900 dark:text-white">{v.name}</p><p className="text-xs text-zinc-500">Due: {new Date(v.scheduledDate).toLocaleDateString()}</p></div>
                      <Badge variant={v.isCompleted ? 'success' : 'warning'}>{v.isCompleted ? 'Completed' : 'Pending'}</Badge>
                    </div>
                  ))}</div>}
              </CardContent></Card>
            )}
          </>
        )}
      </Tabs>

      <Modal open={showFeedingModal} onClose={() => setShowFeedingModal(false)} title="Log Feeding">
        <form id="feeding-form" onSubmit={(e) => { e.preventDefault(); handleAddFeeding(); }} className="space-y-4">
          <Select label="Type" name="type" options={[{ value: 'breast', label: 'Breastfeeding' }, { value: 'formula', label: 'Formula' }, { value: 'mixed', label: 'Mixed' }]} />
          <Input label="Amount (ml)" name="amount" type="number" placeholder="e.g., 120" />
          <Input label="Duration (min)" name="duration" type="number" placeholder="e.g., 20" />
          <Input label="Notes" name="notes" placeholder="Any notes" />
          <div className="flex justify-end gap-3"><Button variant="outline" type="button" onClick={() => setShowFeedingModal(false)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </Modal>

      <Modal open={showVaccinationModal} onClose={() => setShowVaccinationModal(false)} title="Add Vaccination">
        <form id="vax-form" onSubmit={(e) => { e.preventDefault(); handleAddVaccination(); }} className="space-y-4">
          <Input label="Vaccine Name" name="name" placeholder="e.g., BCG, Hepatitis B" />
          <Input label="Scheduled Date" name="scheduledDate" type="date" />
          <div className="flex justify-end gap-3"><Button variant="outline" type="button" onClick={() => setShowVaccinationModal(false)}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </Modal>
    </div>
  );
}

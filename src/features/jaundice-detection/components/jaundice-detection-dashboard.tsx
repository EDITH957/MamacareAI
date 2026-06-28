'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { db } from '@/lib/services/database';
import { assessJaundice } from '@/lib/services/ai-service';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import {
  Sun,
  Droplets,
  AlertTriangle,
  Baby,
  Stethoscope,
  RefreshCw,
  CheckCircle2,
  FlaskConical,
} from 'lucide-react';
import type { JaundiceAssessment, BabyProfile } from '@/types';

const commonSymptoms = [
  'Yellowing of skin (face)',
  'Yellowing of skin (chest/abdomen)',
  'Yellowing of eyes',
  'Poor feeding',
  'Dark urine',
  'Pale stools',
  'Excessive sleepiness',
  'High-pitched cry',
];

const symptomOptions = commonSymptoms.map(s => ({ value: s, label: s }));

export function JaundiceDetectionDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, loadProfiles } = useProfileStore();
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [bilirubin, setBilirubin] = useState('');
  const [babyAgeDays, setBabyAgeDays] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [gestationalWeeks, setGestationalWeeks] = useState('');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [assessment, setAssessment] = useState<JaundiceAssessment | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) loadProfiles(user.id);
  }, [user?.id, loadProfiles]);

  const loadBabies = async () => {
    if (!motherProfile) return;
    const found = await db.babyProfiles.where('motherId').equals(motherProfile.id).toArray();
    setBabies(found);
    if (found.length > 0) {
      setSelectedBabyId(found[0].id || '');
      setBaby(found[0]);
    }
  };

  useEffect(() => {
    if (!motherProfile) return;
    (async () => {
      const found = await db.babyProfiles.where('motherId').equals(motherProfile.id).toArray();
      setBabies(found);
      if (found.length > 0) {
        setSelectedBabyId(found[0].id || '');
        setBaby(found[0]);
      }
    })();
  }, [motherProfile]);

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]
    );
  };

  const handleAssess = async () => {
    if (!selectedBabyId || !bilirubin || !babyAgeDays || !birthWeight || !gestationalWeeks) return;
    setLoading(true);
    try {
      const result = assessJaundice({
        babyId: selectedBabyId,
        babyAgeDays: Number(babyAgeDays),
        birthWeight: Number(birthWeight),
        gestationalAgeWeeks: Number(gestationalWeeks),
        bilirubinLevel: Number(bilirubin),
        symptoms: selectedSymptoms,
      });
      await db.jaundiceAssessments.add(result);
      setAssessment(result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const riskVariant: Record<string, 'success' | 'warning' | 'danger' | undefined> = {
    low: 'success',
    moderate: 'warning',
    high: 'danger',
    critical: 'danger',
  };

  const riskColor: Record<string, string> = {
    low: 'text-emerald-600 dark:text-emerald-400',
    moderate: 'text-amber-600 dark:text-amber-400',
    high: 'text-red-600 dark:text-red-400',
    critical: 'text-red-700 dark:text-red-300',
  };

  const riskBg: Record<string, string> = {
    low: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900',
    moderate: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900',
    high: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900',
    critical: 'bg-red-100 dark:bg-red-950/50 border-red-300 dark:border-red-800',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jaundice Detection"
        description="AI-powered newborn jaundice risk assessment"
      />

      <Card>
        <CardHeader>
          <CardTitle>Newborn Jaundice Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {babies.length === 0 ? (
            <EmptyState
              icon={<Baby className="h-7 w-7" />}
              title="No baby profile found"
              description="Add your baby's profile in Postnatal Care first."
            />
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Baby</label>
                  <select
                    value={selectedBabyId}
                    onChange={e => {
                      setSelectedBabyId(e.target.value);
                      setBaby(babies.find(b => b.id === e.target.value) || null);
                    }}
                    className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    {babies.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <Input label="Bilirubin Level (mg/dL)" type="number" step="0.1" placeholder="e.g. 12.5" value={bilirubin} onChange={e => setBilirubin(e.target.value)} />
                <Input label="Baby Age (days)" type="number" placeholder="e.g. 3" value={babyAgeDays} onChange={e => setBabyAgeDays(e.target.value)} />
                <Input label="Birth Weight (grams)" type="number" placeholder="e.g. 3200" value={birthWeight} onChange={e => setBirthWeight(e.target.value)} />
                <Input label="Gestational Age (weeks)" type="number" placeholder="e.g. 39" value={gestationalWeeks} onChange={e => setGestationalWeeks(e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Symptoms Observed</label>
                <div className="flex flex-wrap gap-2">
                  {symptomOptions.map(s => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => toggleSymptom(s.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        selectedSymptoms.includes(s.value)
                          ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleAssess} loading={loading} icon={<FlaskConical className="h-4 w-4" />}>
                Analyze Jaundice Risk
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {loading && <LoadingState message="Analyzing jaundice indicators..." />}

      {assessment && (
        <>
          <div className={`rounded-xl border-2 p-6 ${riskBg[assessment.riskLevel]}`}>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${riskColor[assessment.riskLevel]}`} />
                  <h3 className={`text-lg font-bold ${riskColor[assessment.riskLevel]}`}>
                    {assessment.riskLevel === 'low' ? 'Low Risk' :
                     assessment.riskLevel === 'moderate' ? 'Moderate Risk' :
                     assessment.riskLevel === 'high' ? 'High Risk - Action Required' :
                     'CRITICAL - Emergency Required'}
                  </h3>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Bilirubin: {assessment.bilirubinLevel} mg/dL | Age: {assessment.babyAgeDays} day(s) | Gestational: {assessment.gestationalAgeWeeks} weeks
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={assessment.requiresPhototherapy ? 'warning' : 'success'}>
                  {assessment.requiresPhototherapy ? 'Phototherapy Needed' : 'No Phototherapy'}
                </Badge>
                {assessment.requiresExchangeTransfusion && (
                  <Badge variant="danger">Exchange Transfusion</Badge>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Clinical Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {assessment.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 dark:bg-blue-950/30 dark:text-blue-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Follow-Up Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                      {assessment.followUpAction}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Phototherapy Required</span>
                      <Badge variant={assessment.requiresPhototherapy ? 'warning' : 'success'}>
                        {assessment.requiresPhototherapy ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-zinc-400">Exchange Transfusion Needed</span>
                      <Badge variant={assessment.requiresExchangeTransfusion ? 'danger' : 'success'}>
                        {assessment.requiresExchangeTransfusion ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={Math.min(100, (assessment.bilirubinLevel / 30) * 100)}
                    variant={assessment.riskLevel === 'critical' ? 'danger' : assessment.riskLevel === 'high' ? 'warning' : 'default'}
                    label={`Bilirubin: ${assessment.bilirubinLevel} mg/dL`}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Observed Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              {assessment.symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {assessment.symptoms.map((sym, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600 dark:bg-pink-950/30 dark:text-pink-400">
                      <Droplets className="h-3 w-3" />
                      {sym}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No symptoms recorded</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

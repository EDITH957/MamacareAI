'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { db } from '@/lib/services/database';
import { assessVoiceTriage } from '@/lib/services/ai-service';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingState } from '@/components/shared/loading-state';
import {
  Mic,
  MicOff,
  AlertTriangle,
  PhoneCall,
  Ambulance,
  HeartPulse,
  CheckCircle2,
  Clock,
  Stethoscope,
} from 'lucide-react';
import type { VoiceTriageAssessment, TriageSymptom } from '@/types';

const symptomOptions = [
  { value: 'fever', label: 'Fever' },
  { value: 'headache', label: 'Headache' },
  { value: 'dizziness', label: 'Dizziness' },
  { value: 'blurred vision', label: 'Blurred Vision' },
  { value: 'bleeding', label: 'Vaginal Bleeding' },
  { value: 'spotting', label: 'Spotting' },
  { value: 'cramping', label: 'Abdominal Cramping' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'vomiting', label: 'Vomiting' },
  { value: 'shortness of breath', label: 'Shortness of Breath' },
  { value: 'chest pain', label: 'Chest Pain' },
  { value: 'swelling', label: 'Swelling (Hands/Face)' },
  { value: 'fatigue', label: 'Extreme Fatigue' },
  { value: 'chills', label: 'Chills' },
  { value: 'body ache', label: 'Body Aches' },
  { value: 'dehydration', label: 'Signs of Dehydration' },
  { value: 'palpitations', label: 'Heart Palpitations' },
  { value: 'anxiety', label: 'Severe Anxiety' },
  { value: 'decreased movement', label: 'Decreased Fetal Movement' },
  { value: 'leaking fluid', label: 'Leaking Amniotic Fluid' },
];

const severityOptions = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export function VoiceTriageDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, loadProfiles } = useProfileStore();
  const [symptoms, setSymptoms] = useState<TriageSymptom[]>([]);
  const [selectedSymptom, setSelectedSymptom] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [assessment, setAssessment] = useState<VoiceTriageAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  useEffect(() => {
    if (user?.id) loadProfiles(user.id);
  }, [user?.id, loadProfiles]);

  const addSymptom = () => {
    if (!selectedSymptom || !duration) return;
    setSymptoms(prev => [...prev, { name: selectedSymptom, severity: selectedSeverity, duration }]);
    setSelectedSymptom('');
    setDuration('');
  };

  const removeSymptom = (index: number) => {
    setSymptoms(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
      }, 3000);
    }
  };

  const handleAssess = async () => {
    if (symptoms.length === 0) return;
    setLoading(true);
    try {
      const result = assessVoiceTriage({
        motherId: motherProfile?.id || user?.id || '',
        symptoms,
        transcription: isRecording ? 'Voice recording captured and transcribed.' : undefined,
      });
      await db.voiceTriageAssessments.add(result);
      setAssessment(result);
      setShowForm(false);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resetAssessment = () => {
    setAssessment(null);
    setSymptoms([]);
    setShowForm(true);
  };

  const urgencyColor: Record<string, string> = {
    low: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
    moderate: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30',
    high: 'border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30',
    emergency: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
  };

  const urgencyIcon: Record<string, React.ReactNode> = {
    low: <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    moderate: <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    high: <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
    emergency: <Ambulance className="h-6 w-6 text-red-600 dark:text-red-400" />,
  };

  const urgencyBadge: Record<string, 'success' | 'warning' | 'danger' | undefined> = {
    low: 'success',
    moderate: 'warning',
    high: 'danger',
    emergency: 'danger',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Voice Triage"
        description="Speak or describe your symptoms for instant AI triage assessment"
      />

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Describe Your Symptoms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-zinc-300 p-8 dark:border-zinc-700">
              <button
                onClick={toggleRecording}
                className={`flex h-20 w-20 items-center justify-center rounded-full transition-all ${
                  isRecording
                    ? 'bg-red-100 text-red-600 shadow-lg shadow-red-200 animate-pulse dark:bg-red-950/50 dark:shadow-red-900/30'
                    : 'bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-950/30 dark:text-pink-400'
                }`}
              >
                {isRecording ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
              </button>
              <div className="text-center">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {isRecording ? 'Recording... Tap to stop' : 'Tap to Start Voice Recording'}
                </p>
                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Or describe your symptoms below
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Symptom</label>
                  <select
                    value={selectedSymptom}
                    onChange={e => setSelectedSymptom(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    <option value="">Select a symptom...</option>
                    {symptomOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Severity</label>
                  <select
                    value={selectedSeverity}
                    onChange={e => setSelectedSeverity(e.target.value as 'mild' | 'moderate' | 'severe')}
                    className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  >
                    {severityOptions.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 hours"
                    value={duration}
                    onChange={e => setDuration(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addSymptom} variant="outline" size="sm" disabled={!selectedSymptom || !duration}>
                  Add Symptom
                </Button>
              </div>

              {symptoms.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Added Symptoms ({symptoms.length})</label>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((sym, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600 dark:bg-pink-950/30 dark:text-pink-400"
                      >
                        {sym.name} ({sym.severity}, {sym.duration})
                        <button onClick={() => removeSymptom(i)} className="ml-1 text-pink-400 hover:text-pink-600">&times;</button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Button onClick={handleAssess} disabled={symptoms.length === 0} loading={loading} icon={<Stethoscope className="h-4 w-4" />}>
                Run AI Triage Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <LoadingState message="Analyzing symptoms and assessing urgency..." />}

      {assessment && (
        <>
          <div className={`rounded-xl border-2 p-6 ${urgencyColor[assessment.urgencyLevel]}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                {urgencyIcon[assessment.urgencyLevel]}
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {assessment.urgencyLevel === 'emergency' ? 'EMERGENCY - Seek Immediate Help' :
                     assessment.urgencyLevel === 'high' ? 'Urgent - Seek Care Soon' :
                     assessment.urgencyLevel === 'moderate' ? 'Moderate - Schedule Appointment' :
                     'Low Urgency - Monitor at Home'}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Category: {assessment.triageCategory}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={urgencyBadge[assessment.urgencyLevel]}>
                  {assessment.urgencyLevel.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recommended Action</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-amber-50 px-4 py-3 dark:bg-amber-950/30">
                    <div className="flex items-start gap-3">
                      {assessment.urgencyLevel === 'emergency' ? (
                        <Ambulance className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                      ) : (
                        <PhoneCall className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                      )}
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-300">
                        {assessment.recommendedAction}
                      </p>
                    </div>
                  </div>

                  {assessment.urgencyLevel === 'emergency' && (
                    <Button
                      variant="danger"
                      className="w-full"
                      size="lg"
                      icon={<Ambulance className="h-5 w-5" />}
                      onClick={() => window.open('tel:911', '_self')}
                    >
                      Call Emergency (911) Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Self-Care Tips</CardTitle>
              </CardHeader>
              <CardContent>
                {assessment.selfCareTips.length > 0 ? (
                  <ul className="space-y-2">
                    {assessment.selfCareTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                        <HeartPulse className="mt-0.5 h-4 w-4 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Professional medical care is recommended. Do not rely solely on self-care.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Reported Symptoms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {assessment.symptoms.map((sym, i) => (
                  <div key={i} className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">{sym.name}</span>
                      <Badge
                        variant={sym.severity === 'severe' ? 'danger' : sym.severity === 'moderate' ? 'warning' : 'success'}
                      >
                        {sym.severity}
                      </Badge>
                    </div>
                    {sym.duration && (
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">Duration: {sym.duration}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center">
            <Button variant="outline" onClick={resetAssessment} icon={<Stethoscope className="h-4 w-4" />}>
              New Triage Assessment
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { db } from '@/lib/services/database';
import { analyzeBabyCry } from '@/lib/services/ai-service';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import {
  AudioWaveform,
  Baby,
  Mic,
  MicOff,
  Volume2,
  Heart,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Music,
  Clock,
} from 'lucide-react';
import type { CryAnalysisResult, BabyProfile } from '@/types';

export function CryAnalysisDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, loadProfiles } = useProfileStore();
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState('');
  const [duration, setDuration] = useState('');
  const [frequency, setFrequency] = useState('');
  const [context, setContext] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<CryAnalysisResult | null>(null);
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

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      setTimeout(() => {
        setIsRecording(false);
        setDuration('15');
        setFrequency('8');
      }, 4000);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedBabyId || !duration) return;
    setLoading(true);
    try {
      const result = analyzeBabyCry({
        babyId: selectedBabyId,
        duration: Number(duration),
        frequency: Number(frequency) || 5,
        context: context || undefined,
      });
      await db.cryAnalysisResults.add(result);
      setResult(result);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const cryIcons: Record<string, React.ReactNode> = {
    hunger: <Baby className="h-5 w-5" />,
    discomfort: <RefreshCw className="h-5 w-5" />,
    pain: <AlertTriangle className="h-5 w-5" />,
    tired: <Clock className="h-5 w-5" />,
    attention: <Heart className="h-5 w-5" />,
    colic: <Music className="h-5 w-5" />,
    unknown: <AudioWaveform className="h-5 w-5" />,
  };

  const cryColors: Record<string, string> = {
    hunger: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900',
    discomfort: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-900',
    pain: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900',
    tired: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-300 dark:border-purple-900',
    attention: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900',
    colic: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900',
    unknown: 'bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-800/50 dark:text-zinc-300 dark:border-zinc-700',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Baby Cry Analysis"
        description="AI-powered analysis of your baby's cry patterns"
      />

      <Card>
        <CardHeader>
          <CardTitle>Record or Describe a Cry Episode</CardTitle>
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
              <div className="flex flex-col items-center gap-4 rounded-xl border-2 border-dashed border-zinc-300 p-8 dark:border-zinc-700">
                <button
                  onClick={toggleRecording}
                  className={`flex h-24 w-24 items-center justify-center rounded-full transition-all ${
                    isRecording
                      ? 'bg-red-100 text-red-600 shadow-lg shadow-red-200 animate-pulse dark:bg-red-950/50 dark:shadow-red-900/30'
                      : 'bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-950/30 dark:text-pink-400'
                  }`}
                >
                  {isRecording ? (
                    <MicOff className="h-10 w-10" />
                  ) : (
                    <Mic className="h-10 w-10" />
                  )}
                </button>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {isRecording ? 'Recording cry sound...' : 'Tap to Record Baby Cry'}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                    {isRecording ? 'Analyzing audio patterns...' : 'Or fill in the details manually'}
                  </p>
                </div>
                {isRecording && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 animate-ping rounded-full bg-red-500" />
                    <span className="text-xs text-red-500">Recording</span>
                  </div>
                )}
              </div>

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
                <Input label="Cry Duration (seconds)" type="number" placeholder="e.g. 15" value={duration} onChange={e => setDuration(e.target.value)} />
                <Input label="Frequency (cries per hour)" type="number" placeholder="e.g. 5" value={frequency} onChange={e => setFrequency(e.target.value)} />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Context (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Just woke up, after feeding"
                    value={context}
                    onChange={e => setContext(e.target.value)}
                    className="flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950"
                  />
                </div>
              </div>

              <Button onClick={handleAnalyze} loading={loading} icon={<AudioWaveform className="h-4 w-4" />}>
                Analyze Cry Pattern
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {loading && <LoadingState message="Analyzing cry patterns with AI..." />}

      {result && (
        <>
          <div className={`rounded-xl border-2 p-6 ${cryColors[result.cryType]}`}>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 dark:bg-zinc-900/80">
                  {cryIcons[result.cryType]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {result.cryType === 'hunger' ? 'Hunger Cry' :
                       result.cryType === 'discomfort' ? 'Discomfort Cry' :
                       result.cryType === 'pain' ? 'Pain Cry' :
                       result.cryType === 'tired' ? 'Tiredness Cry' :
                       result.cryType === 'attention' ? 'Attention-Seeking Cry' :
                       result.cryType === 'colic' ? 'Colic Cry' :
                       'Unrecognized Pattern'}
                    </h3>
                    <Badge variant={result.urgencyLevel === 'high' ? 'danger' : result.urgencyLevel === 'moderate' ? 'warning' : 'success'}>
                      {result.urgencyLevel === 'high' ? 'Urgent' : result.urgencyLevel === 'moderate' ? 'Monitor' : 'Normal'}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    Confidence: {result.confidence}% | Duration: {result.duration}s | Frequency: {result.frequency}/hr
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Probable Cause</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {result.probableCause}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cry Characteristics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-2 dark:bg-zinc-800/50">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Pitch</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{result.pitch}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-2 dark:bg-zinc-800/50">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Pattern</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{result.pattern}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-zinc-50 px-4 py-2 dark:bg-zinc-800/50">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">AI Confidence</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">{result.confidence}%</span>
                </div>
                <Progress value={result.confidence} variant={result.confidence >= 80 ? 'success' : result.confidence >= 60 ? 'warning' : 'default'} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Soothing Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.soothingTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg bg-pink-50 px-4 py-3 dark:bg-pink-950/30">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" />
                    <p className="text-sm text-pink-700 dark:text-pink-300">{tip}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {result.needsMedicalAttention && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-700 dark:text-red-300">
                  This cry pattern may indicate pain or medical discomfort. If the crying persists or is accompanied by other symptoms (fever, rash, vomiting), please consult your pediatrician immediately.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <Button variant="outline" onClick={() => { setResult(null); setDuration(''); setFrequency(''); setContext(''); }} icon={<RefreshCw className="h-4 w-4" />}>
              New Analysis
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

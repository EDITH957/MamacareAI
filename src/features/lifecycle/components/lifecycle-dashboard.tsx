'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/services/database';
import { History, Heart, Baby, CalendarDays, FileText, Activity, Stethoscope } from 'lucide-react';
import type { TimelineEvent, MedicalRecord } from '@/types';

export function LifecycleDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, pregnancyProfile, loadProfiles } = useProfileStore();
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [activeTab, setActiveTab] = useState('History');
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user?.id) loadProfiles(user.id); }, [user?.id, loadProfiles]);

  const loadLifecycleData = async () => {
    if (!motherProfile) return;
    setLoading(true);
    try {
      const [events, records] = await Promise.all([
        db.timelineEvents.where('motherId').equals(motherProfile.id).toArray(),
        db.medicalRecords.where('motherId').equals(motherProfile.id).toArray(),
      ]);
      setTimelineEvents(events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setMedicalRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!motherProfile) return;
    (async () => {
      setLoading(true);
      try {
        const [events, records] = await Promise.all([
          db.timelineEvents.where('motherId').equals(motherProfile.id).toArray(),
          db.medicalRecords.where('motherId').equals(motherProfile.id).toArray(),
        ]);
        setTimelineEvents(events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setMedicalRecords(records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, [motherProfile]);

  const tabs = [
    { id: 'History', label: 'Pregnancy History', icon: <History className="h-4 w-4" /> },
    { id: 'records', label: 'Medical Records', icon: <FileText className="h-4 w-4" /> },
    { id: 'journey', label: 'Health Journey', icon: <Activity className="h-4 w-4" /> },
  ];

  const timelineIconMap: Record<string, React.ReactNode> = {
    pregnancy_start: <Heart className="h-4 w-4 text-pink-500" />,
    quickening: <Baby className="h-4 w-4 text-blue-500" />,
    birth: <Baby className="h-4 w-4 text-emerald-500" />,
    scan: <Stethoscope className="h-4 w-4 text-purple-500" />,
    milestone: <CalendarDays className="h-4 w-4 text-amber-500" />,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Lifecycle Health Journey" description="Your complete maternal health History and records" />

      {!motherProfile ? (
        <EmptyState icon={<History className="h-7 w-7" />} title="Set up your profile" description="Create your profile to start your health journey." />
      ) : (
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="underline">
          {(tabId) => (
            <>
              {tabId === 'History' && (
                <div className="space-y-4">
                  {timelineEvents.length === 0 ? (
                    <EmptyState icon={<History className="h-7 w-7" />} title="Your pregnancy History" description="Key events will appear here as you progress through your journey." />
                  ) : (
                    <div className="relative space-y-0">
                      <div className="absolute left-5 top-0 h-full w-0.5 bg-zinc-200 dark:bg-zinc-700" />
                      {timelineEvents.map((event) => (
                        <div key={event.id} className="relative flex gap-4 pb-8 pl-0">
                          <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white bg-zinc-100 shadow dark:border-zinc-900 dark:bg-zinc-800">
                            {timelineIconMap[event.type] || <CalendarDays className="h-4 w-4 text-zinc-500" />}
                          </div>
                          <div className="flex-1 rounded-lg border border-zinc-100 p-4 dark:border-zinc-800">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-sm font-semibold text-zinc-900 dark:text-white">{event.title}</h4>
                              <span className="text-xs text-zinc-400">{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            {event.description && <p className="text-sm text-zinc-500">{event.description}</p>}
                            {event.completed && <Badge variant="success" size="sm" className="mt-2">Completed</Badge>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {tabId === 'records' && (
                <div className="space-y-4">
                  {medicalRecords.length === 0 ? (
                    <EmptyState icon={<FileText className="h-7 w-7" />} title="No medical records yet" description="Your medical records and documents will be stored here." />
                  ) : (
                    medicalRecords.map((record) => (
                      <Card key={record.id}>
                        <CardContent className="flex items-start gap-4 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800">
                            <FileText className="h-5 w-5 text-zinc-500" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-zinc-900 dark:text-white">{record.title}</h4>
                              <Badge variant="outline" size="sm">{record.type}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-zinc-500">{record.provider} - {record.facility}</p>
                            <p className="mt-1 text-xs text-zinc-400">{new Date(record.date).toLocaleDateString()}</p>
                            {record.description && <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{record.description}</p>}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}

              {tabId === 'journey' && (
                <div className="grid gap-4 lg:grid-cols-3">
                  <Card><CardContent className="p-5 text-center"><Heart className="mx-auto mb-3 h-8 w-8 text-pink-500" /><h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Pregnancy Phase</h3><p className="mt-1 text-xs text-zinc-500">From conception to birth</p>{pregnancyProfile && <p className="mt-2 text-lg font-bold text-pink-600">Week {pregnancyProfile.gestationalAge}</p>}</CardContent></Card>
                  <Card><CardContent className="p-5 text-center"><Baby className="mx-auto mb-3 h-8 w-8 text-emerald-500" /><h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Birth Phase</h3><p className="mt-1 text-xs text-zinc-500">Labor, delivery & recovery</p></CardContent></Card>
                  <Card><CardContent className="p-5 text-center"><Activity className="mx-auto mb-3 h-8 w-8 text-blue-500" /><h3 className="text-sm font-semibold text-zinc-900 dark:text-white">Newborn Phase</h3><p className="mt-1 text-xs text-zinc-500">Postnatal care & development</p></CardContent></Card>
                </div>
              )}
            </>
          )}
        </Tabs>
      )}
    </div>
  );
}


'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { VoiceTriageDashboard } from '@/features/voice-triage/components/voice-triage-dashboard';

export default function VoiceTriagePage() {
  return (
    <DashboardLayout>
      <VoiceTriageDashboard />
    </DashboardLayout>
  );
}

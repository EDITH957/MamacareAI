'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { HealthTrackingDashboard } from '@/features/tracking/components/health-tracking-dashboard';

export default function TrackingPage() {
  return (
    <DashboardLayout>
      <HealthTrackingDashboard />
    </DashboardLayout>
  );
}

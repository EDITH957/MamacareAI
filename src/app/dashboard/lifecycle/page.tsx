'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { LifecycleDashboard } from '@/features/lifecycle/components/lifecycle-dashboard';

export default function LifecyclePage() {
  return (
    <DashboardLayout>
      <LifecycleDashboard />
    </DashboardLayout>
  );
}

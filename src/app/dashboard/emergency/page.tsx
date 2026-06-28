'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { EmergencyDashboard } from '@/features/emergency/components/emergency-dashboard';

export default function EmergencyPage() {
  return (
    <DashboardLayout>
      <EmergencyDashboard />
    </DashboardLayout>
  );
}

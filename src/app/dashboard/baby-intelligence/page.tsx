'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { BabyIntelligenceDashboard } from '@/features/baby-intelligence/components/baby-intelligence-dashboard';

export default function BabyIntelligencePage() {
  return (
    <DashboardLayout>
      <BabyIntelligenceDashboard />
    </DashboardLayout>
  );
}

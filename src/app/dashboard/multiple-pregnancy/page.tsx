'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { MultiplePregnancyDashboard } from '@/features/multiple-pregnancy/components/multiple-pregnancy-dashboard';

export default function MultiplePregnancyPage() {
  return (
    <DashboardLayout>
      <MultiplePregnancyDashboard />
    </DashboardLayout>
  );
}

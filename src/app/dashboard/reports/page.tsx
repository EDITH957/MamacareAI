'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { ReportsDashboard } from '@/features/reports/components/reports-dashboard';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <ReportsDashboard />
    </DashboardLayout>
  );
}

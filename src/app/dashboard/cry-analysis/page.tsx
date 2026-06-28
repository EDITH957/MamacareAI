'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CryAnalysisDashboard } from '@/features/cry-analysis/components/cry-analysis-dashboard';

export default function CryAnalysisPage() {
  return (
    <DashboardLayout>
      <CryAnalysisDashboard />
    </DashboardLayout>
  );
}

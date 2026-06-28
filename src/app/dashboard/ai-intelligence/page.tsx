'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { AIIntelligenceDashboard } from '@/features/ai-intelligence/components/ai-intelligence-dashboard';

export default function AIIntelligencePage() {
  return (
    <DashboardLayout>
      <AIIntelligenceDashboard />
    </DashboardLayout>
  );
}

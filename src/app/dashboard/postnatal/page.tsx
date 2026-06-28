'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PostnatalDashboard } from '@/features/postnatal/components/postnatal-dashboard';

export default function PostnatalPage() {
  return (
    <DashboardLayout>
      <PostnatalDashboard />
    </DashboardLayout>
  );
}

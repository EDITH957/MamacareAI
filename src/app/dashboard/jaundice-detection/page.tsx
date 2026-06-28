'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { JaundiceDetectionDashboard } from '@/features/jaundice-detection/components/jaundice-detection-dashboard';

export default function JaundiceDetectionPage() {
  return (
    <DashboardLayout>
      <JaundiceDetectionDashboard />
    </DashboardLayout>
  );
}

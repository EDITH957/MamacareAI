'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { RemindersDashboard } from '@/features/reminders/components/reminders-dashboard';

export default function RemindersPage() {
  return (
    <DashboardLayout>
      <RemindersDashboard />
    </DashboardLayout>
  );
}

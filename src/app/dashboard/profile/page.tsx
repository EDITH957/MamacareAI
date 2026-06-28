'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PageHeader } from '@/components/shared/page-header';
import { MotherProfileForm } from '@/features/profile/components/mother-profile-form';

export default function ProfilePage() {
  return (
    <DashboardLayout>
      <MotherProfileForm />
    </DashboardLayout>
  );
}

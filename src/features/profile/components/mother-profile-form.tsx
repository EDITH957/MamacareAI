'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { EmptyState } from '@/components/shared/empty-state';
import { LoadingState } from '@/components/shared/loading-state';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import {
  calculateDueDate,
  calculateGestationalAge,
  getTrimester,
} from '@/lib/utils/date';
import {
  User,
  Phone,
  Plus,
  Trash2,
  Stethoscope,
  ClipboardList,
  Baby,
  CalendarDays,
} from 'lucide-react';
import type { PregnancyType, EmergencyContact, HealthcareProvider, MedicalHistory } from '@/types';

const PREGNANCY_TYPES: Array<{ value: PregnancyType; label: string }> = [
  { value: 'single', label: 'Single Pregnancy' },
  { value: 'twin', label: 'Twin Pregnancy' },
  { value: 'triplet', label: 'Triplet Pregnancy' },
];

export function MotherProfileForm() {
  const { user } = useAuthStore();
  const {
    motherProfile,
    pregnancyProfile,
    isLoading,
    loadProfiles,
    createMotherProfile,
    updateMotherProfile,
    createPregnancyProfile,
    updatePregnancyProfile,
    addEmergencyContact,
    removeEmergencyContact,
    updateHealthcareProvider,
    updateMedicalHistory,
  } = useProfileStore();

  const [activeTab, setActiveTab] = useState('personal');
  const [showContactModal, setShowContactModal] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', relationship: '', phone: '', alternatePhone: '', isPrimary: false });

  useEffect(() => {
    if (user?.id) {
      loadProfiles(user.id);
    }
  }, [user?.id, loadProfiles]);

  const handleCreateProfile = async () => {
    if (!user) return;
    try {
      await createMotherProfile({
        userId: user.id,
        fullName: user.fullName,
        dateOfBirth: '',
        age: 0,
        pregnancyType: 'single',
        medicalHistory: {
          preExistingConditions: [],
          allergies: [],
          medications: [],
          previousPregnancies: 0,
          previousC_sections: 0,
          bloodType: '',
          rhFactor: 'positive',
          geneticDisorders: [],
        },
        emergencyContacts: [],
        healthcareProvider: { name: '', facility: '', phone: '', address: '', specialty: '' },
      });
      toast.success('Profile created successfully');
    } catch {
      toast.error('Failed to create profile');
    }
  };

  const handlePersonalInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!motherProfile) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateMotherProfile(motherProfile.id, {
        fullName: formData.get('fullName') as string,
        dateOfBirth: formData.get('dateOfBirth') as string,
        age: parseInt(formData.get('age') as string) || 0,
        pregnancyType: (formData.get('pregnancyType') as PregnancyType) || 'single',
      });
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handlePregnancySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const startDate = formData.get('startDate') as string;
    if (!startDate || !motherProfile) return;

    const dueDate = calculateDueDate(startDate);
    const gestationalAge = calculateGestationalAge(startDate);
    const trimester = getTrimester(gestationalAge);
    const pregnancyType = motherProfile.pregnancyType;
    const fetusCount = pregnancyType === 'twin' ? 2 : pregnancyType === 'triplet' ? 3 : 1;

    try {
      if (pregnancyProfile) {
        await updatePregnancyProfile(pregnancyProfile.id, {
          startDate,
          dueDate,
          gestationalAge,
          trimester,
        });
        await updateMotherProfile(motherProfile.id, { pregnancyType });
        toast.success('Pregnancy info updated');
      } else {
        await createPregnancyProfile({
          motherId: motherProfile.id,
          startDate,
          dueDate,
          gestationalAge,
          trimester,
          fetuses: Array.from({ length: fetusCount }, (_, i) => ({
            id: crypto.randomUUID(),
            label: fetusCount > 1 ? `Fetus ${i + 1}` : 'Baby',
            estimatedWeight: 0,
            estimatedHeight: 0,
            heartRate: 0,
            movementCount: 0,
            healthScore: 100,
            percentile: 50,
            riskLevel: 'low' as const,
            lastUpdated: new Date().toISOString(),
          })),
        });
        toast.success('Pregnancy profile created');
      }
    } catch {
      toast.error('Failed to save pregnancy info');
    }
  };

  const handleAddContact = async () => {
    if (!motherProfile || !newContact.name || !newContact.phone) {
      toast.error('Name and phone are required');
      return;
    }
    try {
      await addEmergencyContact(motherProfile.id, newContact);
      setShowContactModal(false);
      setNewContact({ name: '', relationship: '', phone: '', alternatePhone: '', isPrimary: false });
      toast.success('Emergency contact added');
    } catch {
      toast.error('Failed to add contact');
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    if (!motherProfile) return;
    try {
      await removeEmergencyContact(motherProfile.id, contactId);
      toast.success('Contact removed');
    } catch {
      toast.error('Failed to remove contact');
    }
  };

  const handleProviderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!motherProfile) return;
    const formData = new FormData(e.currentTarget);
    try {
      await updateHealthcareProvider(motherProfile.id, {
        name: formData.get('providerName') as string,
        facility: formData.get('facility') as string,
        phone: formData.get('providerPhone') as string,
        address: formData.get('address') as string,
        email: formData.get('email') as string,
        specialty: formData.get('specialty') as string,
      });
      toast.success('Healthcare provider updated');
    } catch {
      toast.error('Failed to update provider');
    }
  };

  if (isLoading) return <LoadingState message="Loading profile..." />;

  if (!motherProfile) {
    return (
      <EmptyState
        icon={<User className="h-7 w-7" />}
        title="Create Your Profile"
        description="Set up your maternal health profile to get started with personalized care."
        action={
          <Button onClick={handleCreateProfile} size="lg">
            Create Profile
          </Button>
        }
      />
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <User className="h-4 w-4" /> },
    { id: 'pregnancy', label: 'Pregnancy', icon: <Baby className="h-4 w-4" /> },
    { id: 'contacts', label: 'Emergency Contacts', icon: <Phone className="h-4 w-4" /> },
    { id: 'provider', label: 'Healthcare Provider', icon: <Stethoscope className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Manage your personal and pregnancy information
        </p>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills">
        {(tabId) => (
          <>
            {tabId === 'personal' && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        name="fullName"
                        label="Full Name"
                        defaultValue={motherProfile.fullName}
                        placeholder="Enter your full name"
                      />
                      <Input
                        name="dateOfBirth"
                        label="Date of Birth"
                        type="date"
                        defaultValue={motherProfile.dateOfBirth}
                      />
                      <Input
                        name="age"
                        label="Age"
                        type="number"
                        defaultValue={motherProfile.age || ''}
                        placeholder="Your age"
                      />
                      <Select
                        name="pregnancyType"
                        label="Pregnancy Type"
                        options={PREGNANCY_TYPES}
                        defaultValue={motherProfile.pregnancyType}
                      />
                    </div>
                    <Button type="submit">Save Changes</Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {tabId === 'pregnancy' && (
              <Card>
                <CardHeader>
                  <CardTitle>Pregnancy Information</CardTitle>
                  <CardDescription>
                    Track your pregnancy dates and progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pregnancyProfile && (
                    <div className="mb-6 grid gap-4 rounded-lg bg-pink-50 p-4 dark:bg-pink-950/30 sm:grid-cols-3">
                      <div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Gestational Age</span>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          Week {pregnancyProfile.gestationalAge}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Due Date</span>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          {new Date(pregnancyProfile.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Trimester</span>
                        <p className="text-lg font-bold text-zinc-900 dark:text-white">
                          {pregnancyProfile.trimester === 1 ? 'First' : pregnancyProfile.trimester === 2 ? 'Second' : 'Third'}
                        </p>
                      </div>
                    </div>
                  )}
                  <form onSubmit={handlePregnancySubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        name="startDate"
                        label="LMP Start Date"
                        type="date"
                        defaultValue={
                          pregnancyProfile?.startDate?.split('T')[0]
                        }
                        helperText="First day of your last menstrual period"
                      />
                      <Input
                        name="dueDate"
                        label="Estimated Due Date"
                        type="date"
                        value={
                          pregnancyProfile
                            ? new Date(pregnancyProfile.dueDate).toISOString().split('T')[0]
                            : ''
                        }
                        disabled
                        helperText="Automatically calculated"
                      />
                    </div>
                    <Button type="submit">
                      {pregnancyProfile ? 'Update Pregnancy Info' : 'Save Pregnancy Info'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {tabId === 'contacts' && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Emergency Contacts</CardTitle>
                    <CardDescription>
                      People to notify in case of emergency
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setShowContactModal(true)}
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Add Contact
                  </Button>
                </CardHeader>
                <CardContent>
                  {motherProfile.emergencyContacts?.length === 0 ? (
                    <EmptyState
                      icon={<Phone className="h-7 w-7" />}
                      title="No emergency contacts"
                      description="Add emergency contacts for quick access during emergencies."
                      action={
                        <Button
                          size="sm"
                          onClick={() => setShowContactModal(true)}
                        >
                          Add Contact
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-3">
                      {motherProfile.emergencyContacts?.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center justify-between rounded-lg border border-zinc-200 p-4 dark:border-zinc-700"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-zinc-900 dark:text-white">
                                {contact.name}
                              </span>
                              {contact.isPrimary && (
                                <Badge variant="primary" size="sm">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-zinc-500">{contact.relationship}</p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">{contact.phone}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveContact(contact.id)}
                            className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tabId === 'provider' && (
              <Card>
                <CardHeader>
                  <CardTitle>Healthcare Provider</CardTitle>
                  <CardDescription>
                    Your doctor or midwife information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProviderSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        name="providerName"
                        label="Provider Name"
                        defaultValue={motherProfile.healthcareProvider?.name}
                      />
                      <Input
                        name="specialty"
                        label="Specialty"
                        defaultValue={motherProfile.healthcareProvider?.specialty}
                      />
                      <Input
                        name="facility"
                        label="Hospital / Clinic"
                        defaultValue={motherProfile.healthcareProvider?.facility}
                      />
                      <Input
                        name="providerPhone"
                        label="Phone"
                        type="tel"
                        defaultValue={motherProfile.healthcareProvider?.phone}
                      />
                      <Input
                        name="email"
                        label="Email"
                        type="email"
                        defaultValue={motherProfile.healthcareProvider?.email}
                        className="sm:col-span-2"
                      />
                      <Input
                        name="address"
                        label="Address"
                        defaultValue={motherProfile.healthcareProvider?.address}
                        className="sm:col-span-2"
                      />
                    </div>
                    <Button type="submit">Save Provider Info</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Tabs>

      <Modal
        open={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Add Emergency Contact"
      >
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={newContact.name}
            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
            placeholder="Contact's full name"
          />
          <Input
            label="Relationship"
            value={newContact.relationship}
            onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
            placeholder="e.g., Husband, Mother, Sister"
          />
          <Input
            label="Phone Number"
            type="tel"
            value={newContact.phone}
            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
            placeholder="Primary phone number"
          />
          <Input
            label="Alternate Phone (optional)"
            type="tel"
            value={newContact.alternatePhone}
            onChange={(e) => setNewContact({ ...newContact, alternatePhone: e.target.value })}
            placeholder="Alternate phone number"
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowContactModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddContact}>Add Contact</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

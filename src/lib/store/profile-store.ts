'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/services/database';
import type {
  MotherProfile,
  PregnancyProfile,
  Fetus,
  EmergencyContact,
  HealthcareProvider,
  MedicalHistory,
} from '@/types';

interface ProfileState {
  motherProfile: MotherProfile | null;
  pregnancyProfile: PregnancyProfile | null;
  isLoading: boolean;
  error: string | null;

  loadProfiles: (userId: string) => Promise<void>;
  createMotherProfile: (data: Omit<MotherProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<MotherProfile>;
  updateMotherProfile: (id: string, data: Partial<MotherProfile>) => Promise<void>;
  createPregnancyProfile: (data: Omit<PregnancyProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<PregnancyProfile>;
  updatePregnancyProfile: (id: string, data: Partial<PregnancyProfile>) => Promise<void>;
  addFetus: (pregnancyId: string, label: string) => Promise<void>;
  updateFetus: (pregnancyId: string, fetusId: string, data: Partial<Fetus>) => Promise<void>;
  addEmergencyContact: (motherId: string, contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  updateEmergencyContact: (motherId: string, contactId: string, data: Partial<EmergencyContact>) => Promise<void>;
  removeEmergencyContact: (motherId: string, contactId: string) => Promise<void>;
  updateHealthcareProvider: (motherId: string, provider: HealthcareProvider) => Promise<void>;
  updateMedicalHistory: (motherId: string, history: MedicalHistory) => Promise<void>;
  clearError: () => void;
}

export const useProfileStore = create<ProfileState>()((set, get) => ({
  motherProfile: null,
  pregnancyProfile: null,
  isLoading: false,
  error: null,

  loadProfiles: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const mother = await db.motherProfiles.where('userId').equals(userId).first();
      if (mother) {
        const pregnancy = await db.pregnancyProfiles.where('motherId').equals(mother.id).first();
        set({ motherProfile: mother, pregnancyProfile: pregnancy || null });
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load profiles' });
    } finally {
      set({ isLoading: false });
    }
  },

  createMotherProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile: MotherProfile = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.motherProfiles.add(profile);
      set({ motherProfile: profile });
      return profile;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateMotherProfile: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await db.motherProfiles.update(id, { ...data, updatedAt: new Date().toISOString() });
      const updated = await db.motherProfiles.get(id);
      if (updated) set({ motherProfile: updated });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  createPregnancyProfile: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const profile: PregnancyProfile = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await db.pregnancyProfiles.add(profile);
      set({ pregnancyProfile: profile });
      return profile;
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to create pregnancy profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updatePregnancyProfile: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      await db.pregnancyProfiles.update(id, { ...data, updatedAt: new Date().toISOString() });
      const updated = await db.pregnancyProfiles.get(id);
      if (updated) set({ pregnancyProfile: updated });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update pregnancy profile' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addFetus: async (pregnancyId, label) => {
    set({ isLoading: true, error: null });
    try {
      const pregnancy = await db.pregnancyProfiles.get(pregnancyId);
      if (!pregnancy) throw new Error('Pregnancy profile not found');
      const newFetus: Fetus = {
        id: uuidv4(),
        label,
        estimatedWeight: 0,
        estimatedHeight: 0,
        heartRate: 0,
        movementCount: 0,
        healthScore: 100,
        percentile: 50,
        riskLevel: 'low',
        lastUpdated: new Date().toISOString(),
      };
      const fetuses = [...(pregnancy.fetuses || []), newFetus];
      await db.pregnancyProfiles.update(pregnancyId, {
        fetuses,
        updatedAt: new Date().toISOString(),
      });
      set({
        pregnancyProfile: { ...pregnancy, fetuses, updatedAt: new Date().toISOString() },
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add fetus' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  updateFetus: async (pregnancyId, fetusId, data) => {
    set({ isLoading: true, error: null });
    try {
      const pregnancy = await db.pregnancyProfiles.get(pregnancyId);
      if (!pregnancy) throw new Error('Pregnancy profile not found');
      const fetuses = (pregnancy.fetuses || []).map((f) =>
        f.id === fetusId ? { ...f, ...data, lastUpdated: new Date().toISOString() } : f
      );
      await db.pregnancyProfiles.update(pregnancyId, {
        fetuses,
        updatedAt: new Date().toISOString(),
      });
      set({
        pregnancyProfile: { ...pregnancy, fetuses, updatedAt: new Date().toISOString() },
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update fetus' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  addEmergencyContact: async (motherId, contact) => {
    try {
      const mother = await db.motherProfiles.get(motherId);
      if (!mother) throw new Error('Mother profile not found');
      const newContact: EmergencyContact = { ...contact, id: uuidv4() };
      const contacts = [...(mother.emergencyContacts || []), newContact];
      await db.motherProfiles.update(motherId, {
        emergencyContacts: contacts,
        updatedAt: new Date().toISOString(),
      });
      set({ motherProfile: { ...mother, emergencyContacts: contacts } });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add contact' });
      throw err;
    }
  },

  updateEmergencyContact: async (motherId, contactId, data) => {
    try {
      const mother = await db.motherProfiles.get(motherId);
      if (!mother) throw new Error('Mother profile not found');
      const contacts = (mother.emergencyContacts || []).map((c) =>
        c.id === contactId ? { ...c, ...data } : c
      );
      await db.motherProfiles.update(motherId, {
        emergencyContacts: contacts,
        updatedAt: new Date().toISOString(),
      });
      set({ motherProfile: { ...mother, emergencyContacts: contacts } });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update contact' });
      throw err;
    }
  },

  removeEmergencyContact: async (motherId, contactId) => {
    try {
      const mother = await db.motherProfiles.get(motherId);
      if (!mother) throw new Error('Mother profile not found');
      const contacts = (mother.emergencyContacts || []).filter((c) => c.id !== contactId);
      await db.motherProfiles.update(motherId, {
        emergencyContacts: contacts,
        updatedAt: new Date().toISOString(),
      });
      set({ motherProfile: { ...mother, emergencyContacts: contacts } });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to remove contact' });
      throw err;
    }
  },

  updateHealthcareProvider: async (motherId, provider) => {
    try {
      const mother = await db.motherProfiles.get(motherId);
      if (!mother) throw new Error('Mother profile not found');
      await db.motherProfiles.update(motherId, {
        healthcareProvider: provider,
        updatedAt: new Date().toISOString(),
      });
      set({ motherProfile: { ...mother, healthcareProvider: provider } });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update provider' });
      throw err;
    }
  },

  updateMedicalHistory: async (motherId, history) => {
    try {
      const mother = await db.motherProfiles.get(motherId);
      if (!mother) throw new Error('Mother profile not found');
      await db.motherProfiles.update(motherId, {
        medicalHistory: history,
        updatedAt: new Date().toISOString(),
      });
      set({ motherProfile: { ...mother, medicalHistory: history } });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to update medical history' });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));

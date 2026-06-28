'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/services/database';
import type {
  HealthMetric,
  WeightEntry,
  BloodPressureEntry,
  BloodSugarEntry,
} from '@/types';

interface TrackingState {
  healthMetrics: HealthMetric[];
  weightEntries: WeightEntry[];
  bloodPressureEntries: BloodPressureEntry[];
  bloodSugarEntries: BloodSugarEntry[];
  isLoading: boolean;
  error: string | null;

  loadTrackingData: (motherId: string) => Promise<void>;
  addHealthMetric: (data: Omit<HealthMetric, 'id'>) => Promise<void>;
  addWeightEntry: (data: Omit<WeightEntry, 'id'>) => Promise<void>;
  addBloodPressureEntry: (data: Omit<BloodPressureEntry, 'id'>) => Promise<void>;
  addBloodSugarEntry: (data: Omit<BloodSugarEntry, 'id'>) => Promise<void>;
  getLatestWeight: () => WeightEntry | undefined;
  getLatestBloodPressure: () => BloodPressureEntry | undefined;
  getLatestBloodSugar: () => BloodSugarEntry | undefined;
  clearError: () => void;
}

export const useTrackingStore = create<TrackingState>()((set, get) => ({
  healthMetrics: [],
  weightEntries: [],
  bloodPressureEntries: [],
  bloodSugarEntries: [],
  isLoading: false,
  error: null,

  loadTrackingData: async (motherId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [metrics, weights, bp, sugar] = await Promise.all([
        db.healthMetrics.where('motherId').equals(motherId).toArray(),
        db.weightEntries.where('motherId').equals(motherId).toArray(),
        db.bloodPressureEntries.where('motherId').equals(motherId).toArray(),
        db.bloodSugarEntries.where('motherId').equals(motherId).toArray(),
      ]);
      set({
        healthMetrics: metrics.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        weightEntries: weights.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        bloodPressureEntries: bp.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
        bloodSugarEntries: sugar.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load tracking data' });
    } finally {
      set({ isLoading: false });
    }
  },

  addHealthMetric: async (data) => {
    try {
      const metric: HealthMetric = { ...data, id: uuidv4() };
      await db.healthMetrics.add(metric);
      set((state) => ({
        healthMetrics: [metric, ...state.healthMetrics],
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add metric' });
      throw err;
    }
  },

  addWeightEntry: async (data) => {
    try {
      const entry: WeightEntry = { ...data, id: uuidv4() };
      await db.weightEntries.add(entry);
      set((state) => ({
        weightEntries: [entry, ...state.weightEntries],
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add weight entry' });
      throw err;
    }
  },

  addBloodPressureEntry: async (data) => {
    try {
      const entry: BloodPressureEntry = { ...data, id: uuidv4() };
      await db.bloodPressureEntries.add(entry);
      set((state) => ({
        bloodPressureEntries: [entry, ...state.bloodPressureEntries],
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add BP entry' });
      throw err;
    }
  },

  addBloodSugarEntry: async (data) => {
    try {
      const entry: BloodSugarEntry = { ...data, id: uuidv4() };
      await db.bloodSugarEntries.add(entry);
      set((state) => ({
        bloodSugarEntries: [entry, ...state.bloodSugarEntries],
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add blood sugar entry' });
      throw err;
    }
  },

  getLatestWeight: () => {
    const entries = get().weightEntries;
    return entries.length > 0 ? entries[0] : undefined;
  },

  getLatestBloodPressure: () => {
    const entries = get().bloodPressureEntries;
    return entries.length > 0 ? entries[0] : undefined;
  },

  getLatestBloodSugar: () => {
    const entries = get().bloodSugarEntries;
    return entries.length > 0 ? entries[0] : undefined;
  },

  clearError: () => set({ error: null }),
}));

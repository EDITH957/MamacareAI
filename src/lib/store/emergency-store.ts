'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/services/database';
import { getCurrentPosition } from '@/lib/services/geolocation';
import type { EmergencySOS, NearbyHospital } from '@/types';

interface EmergencyState {
  activeSOS: EmergencySOS | null;
  nearbyHospitals: NearbyHospital[];
  ambulanceStatus: EmergencySOS['ambulanceStatus'];
  isLoading: boolean;
  error: string | null;

  triggerSOS: (motherId: string, notifyContacts?: string[]) => Promise<void>;
  cancelSOS: (id: string) => Promise<void>;
  resolveSOS: (id: string) => Promise<void>;
  requestAmbulance: (sosId: string) => Promise<void>;
  loadNearbyHospitals: (lat?: number, lng?: number) => Promise<void>;
  clearError: () => void;
}

const MOCK_HOSPITALS: NearbyHospital[] = [
  {
    id: 'h1',
    name: 'City General Hospital',
    address: '123 Healthcare Ave, Medical District',
    phone: '+1-555-0100',
    distance: 1.2,
    lat: 40.7128,
    lng: -74.006,
    emergencyServices: true,
    maternityWard: true,
    rating: 4.5,
  },
  {
    id: 'h2',
    name: 'St. Mary\'s Maternity Center',
    address: '456 Wellness Blvd, Downtown',
    phone: '+1-555-0200',
    distance: 2.5,
    lat: 40.715,
    lng: -74.01,
    emergencyServices: true,
    maternityWard: true,
    rating: 4.8,
  },
  {
    id: 'h3',
    name: 'University Medical Center',
    address: '789 College St, University Area',
    phone: '+1-555-0300',
    distance: 3.8,
    lat: 40.72,
    lng: -74.0,
    emergencyServices: true,
    maternityWard: true,
    rating: 4.3,
  },
  {
    id: 'h4',
    name: 'Community Health Clinic',
    address: '321 Oak Street, Residential Area',
    phone: '+1-555-0400',
    distance: 5.1,
    lat: 40.71,
    lng: -74.015,
    emergencyServices: true,
    maternityWard: false,
    rating: 4.1,
  },
  {
    id: 'h5',
    name: 'Women & Children\'s Hospital',
    address: '555 Family Lane, Health Park',
    phone: '+1-555-0500',
    distance: 6.3,
    lat: 40.725,
    lng: -74.02,
    emergencyServices: true,
    maternityWard: true,
    rating: 4.9,
  },
];

export const useEmergencyStore = create<EmergencyState>()((set, get) => ({
  activeSOS: null,
  nearbyHospitals: [],
  ambulanceStatus: undefined,
  isLoading: false,
  error: null,

  triggerSOS: async (motherId: string, notifyContacts?: string[]) => {
    set({ isLoading: true, error: null });
    try {
      let location = { lat: 40.7128, lng: -74.006 };
      try {
        const pos = await getCurrentPosition();
        location = { lat: pos.lat, lng: pos.lng };
      } catch {
        // Use default location
      }
      const sos: EmergencySOS = {
        id: uuidv4(),
        motherId,
        timestamp: new Date().toISOString(),
        location,
        status: 'active',
        ambulanceRequested: false,
        notifiedContacts: notifyContacts || [],
      };
      await db.emergencySOS.add(sos);
      set({ activeSOS: sos });
      if (notifyContacts?.length) {
        const { sendEmergencyAlert } = await import('@/lib/services/notification');
        sendEmergencyAlert('SOS Alert sent to emergency contacts');
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to trigger SOS' });
    } finally {
      set({ isLoading: false });
    }
  },

  cancelSOS: async (id: string) => {
    try {
      await db.emergencySOS.update(id, { status: 'cancelled' });
      set({ activeSOS: null, ambulanceStatus: undefined });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to cancel SOS' });
    }
  },

  resolveSOS: async (id: string) => {
    try {
      await db.emergencySOS.update(id, { status: 'resolved' });
      set({ activeSOS: null, ambulanceStatus: undefined });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to resolve SOS' });
    }
  },

  requestAmbulance: async (sosId: string) => {
    set({ isLoading: true, error: null });
    try {
      await db.emergencySOS.update(sosId, {
        ambulanceRequested: true,
        ambulanceStatus: 'dispatched',
      });
      set({ ambulanceStatus: 'dispatched' });
      setTimeout(async () => {
        await db.emergencySOS.update(sosId, { ambulanceStatus: 'arrived' });
        set({ ambulanceStatus: 'arrived' });
        const { sendEmergencyAlert } = await import('@/lib/services/notification');
        sendEmergencyAlert('Ambulance has arrived at your location');
      }, 30000);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to request ambulance' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadNearbyHospitals: async (lat?: number, lng?: number) => {
    set({ isLoading: true, error: null });
    try {
      let currentLat = lat;
      let currentLng = lng;
      if (!currentLat || !currentLng) {
        try {
          const pos = await getCurrentPosition();
          currentLat = pos.lat;
          currentLng = pos.lng;
        } catch {
          currentLat = 40.7128;
          currentLng = -74.006;
        }
      }
      const hospitals = MOCK_HOSPITALS.map((h) => ({
        ...h,
        distance: Math.round(
          ((h.lat - currentLat!) ** 2 + (h.lng - currentLng!) ** 2) ** 0.5 * 111 * 10
        ) / 10,
      })).sort((a, b) => a.distance - b.distance);
      set({ nearbyHospitals: hospitals });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load hospitals' });
    } finally {
      set({ isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

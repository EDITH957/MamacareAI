'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { useEmergencyStore } from '@/lib/store/emergency-store';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { Modal } from '@/components/ui/modal';
import { toast } from 'sonner';
import { AlertTriangle, Phone, Ambulance, MapPin } from 'lucide-react';

export function EmergencyDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, loadProfiles } = useProfileStore();
  const { activeSOS, nearbyHospitals, ambulanceStatus, triggerSOS, cancelSOS, requestAmbulance, loadNearbyHospitals } = useEmergencyStore();
  const [showConfirmSOS, setShowConfirmSOS] = useState(false);
  const [showAmbulanceConfirm, setShowAmbulanceConfirm] = useState(false);

  useEffect(() => { if (user?.id) loadProfiles(user.id); }, [user?.id, loadProfiles]);
  useEffect(() => { loadNearbyHospitals(); }, [loadNearbyHospitals]);

  const contacts = motherProfile?.emergencyContacts || [];
  const isSOSActive = activeSOS?.status === 'active';

  const handleTriggerSOS = async () => {
    if (!motherProfile) return;
    setShowConfirmSOS(false);
    await triggerSOS(motherProfile.id, contacts.map(c => c.id));
    toast.success('SOS alert sent');
  };

  const handleRequestAmbulance = () => {
    setShowAmbulanceConfirm(false);
    if (activeSOS) requestAmbulance(activeSOS.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Emergency Response" description="One-tap emergency assistance and hospital locator" />

      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-red-200 bg-gradient-to-b from-red-50 to-white p-8 text-center dark:border-red-900 dark:from-red-950/30 dark:to-zinc-950">
        <AlertTriangle className="mb-3 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-xl font-bold text-zinc-900 dark:text-white">Emergency Assistance</h2>
        <p className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">Tap the SOS button if you need immediate medical help</p>
        <button
          onClick={() => setShowConfirmSOS(true)}
          disabled={isSOSActive}
          className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-200 transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-50 dark:shadow-red-900/30"
        >
          <div className="absolute inset-2 rounded-full border-2 border-white/30" />
          <div className="absolute inset-4 rounded-full border border-white/20" />
          <span className="text-lg font-bold">SOS</span>
        </button>
        {isSOSActive && (
          <div className="mt-4 space-y-2">
            <Badge variant="danger" size="lg">SOS Active</Badge>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => cancelSOS(activeSOS.id)}>Cancel SOS</Button>
              <Button size="sm" onClick={() => setShowAmbulanceConfirm(true)} icon={<Ambulance className="h-4 w-4" />}>Request Ambulance</Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Phone className="h-4 w-4 text-red-500" /> Emergency Contacts</CardTitle></CardHeader>
          <CardContent>
            {contacts.length === 0 ? (
              <EmptyState title="No contacts" description="Add emergency contacts in your profile." />
            ) : (
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                    <div><p className="text-sm font-medium text-zinc-900 dark:text-white">{c.name}</p><p className="text-xs text-zinc-500">{c.relationship}</p></div>
                    <a href={"tel:" + c.phone} className="flex items-center gap-1 rounded-lg bg-pink-50 px-3 py-1.5 text-sm font-medium text-pink-600 hover:bg-pink-100 dark:bg-pink-900/30 dark:text-pink-400"><Phone className="h-3.5 w-3.5" /> Call</a>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><MapPin className="h-4 w-4 text-blue-500" /> Nearby Hospitals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {nearbyHospitals.slice(0, 4).map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 dark:border-zinc-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white">{h.name}</p>
                    <p className="text-xs text-zinc-500">{h.distance} km{h.maternityWard ? ' * Maternity' : ''}</p>
                  </div>
                  <a href={"tel:" + h.phone} className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400"><Phone className="h-4 w-4" /></a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Modal open={showConfirmSOS} onClose={() => setShowConfirmSOS(false)} title="Trigger SOS Emergency?" size="sm">
        <div className="space-y-4 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Your emergency contacts will be notified with your current location.</p>
          <div className="flex gap-3"><Button variant="outline" fullWidth onClick={() => setShowConfirmSOS(false)}>Cancel</Button><Button variant="danger" fullWidth onClick={handleTriggerSOS}>Send SOS</Button></div>
        </div>
      </Modal>

      <Modal open={showAmbulanceConfirm} onClose={() => setShowAmbulanceConfirm(false)} title="Request Ambulance?" size="sm">
        <div className="space-y-4 text-center">
          <Ambulance className="mx-auto h-12 w-12 text-red-500" />
          <p className="text-sm text-zinc-600 dark:text-zinc-400">An ambulance will be dispatched to your current location.</p>
          <div className="flex gap-3"><Button variant="outline" fullWidth onClick={() => setShowAmbulanceConfirm(false)}>Cancel</Button><Button variant="danger" fullWidth onClick={handleRequestAmbulance} icon={<Ambulance className="h-4 w-4" />}>Request Ambulance</Button></div>
        </div>
      </Modal>
    </div>
  );
}

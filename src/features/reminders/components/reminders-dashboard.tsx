'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { useProfileStore } from '@/lib/store/profile-store';
import { useRemindersStore } from '@/lib/store/reminders-store';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/shared/empty-state';
import { Badge } from '@/components/ui/badge';
import { Tabs } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Bell, Plus, Pill, CalendarDays, Syringe, Trash2, Bot, Send, CheckCircle2, Clock } from 'lucide-react';
import type { ReminderType, ChatMessage } from '@/types';

export function RemindersDashboard() {
  const { user } = useAuthStore();
  const { motherProfile, loadProfiles } = useProfileStore();
  const { reminders, chatMessages, loadReminders, loadChatMessages, addReminder, toggleReminder, deleteReminder, sendMessage, isLoading } = useRemindersStore();
  const [activeTab, setActiveTab] = useState('reminders');
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ReminderType>('medication');
  const [scheduledTime, setScheduledTime] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatType, setChatType] = useState<ChatMessage['type']>('general');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (user?.id) { loadProfiles(user.id); } }, [user?.id, loadProfiles]);
  useEffect(() => { if (motherProfile?.id) { loadReminders(motherProfile.id); loadChatMessages(motherProfile.id); } }, [motherProfile?.id, loadReminders, loadChatMessages]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

  const handleAddReminder = async () => {
    if (!motherProfile || !title || !scheduledTime) { toast.error('Title and time required'); return; }
    try {
      await addReminder({ motherId: motherProfile.id, title, description, type, scheduledTime: new Date(scheduledTime).toISOString(), isRecurring: false, isCompleted: false, isActive: true });
      setShowModal(false); setTitle(''); setDescription(''); setScheduledTime('');
      toast.success('Reminder created');
    } catch { toast.error('Failed to create reminder'); }
  };

  const handleSendMessage = async () => {
    if (!motherProfile || !chatInput.trim()) return;
    const msg = chatInput;
    setChatInput('');
    await sendMessage(motherProfile.id, msg, chatType);
  };

  const reminderTypeIcons: Record<ReminderType, React.ReactNode> = {
    medication: <Pill className="h-4 w-4" />,
    appointment: <CalendarDays className="h-4 w-4" />,
    supplement: <Syringe className="h-4 w-4" />,
  };

  const reminderTypeLabels: Record<ReminderType, string> = {
    medication: 'Medication', appointment: 'Appointment', supplement: 'Supplement',
  };

  const tabs = [
    { id: 'reminders', label: 'Reminders', icon: <Bell className="h-4 w-4" />, badge: reminders.filter(r => !r.isCompleted).length },
    { id: 'chat', label: 'AI Chatbot', icon: <Bot className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Reminders & Support" description="Manage your medications, appointments, and AI health assistant" />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="pills">
        {(tabId) => (
          <>
            {tabId === 'reminders' && (
              <>
                <div className="mb-4 flex justify-end">
                  <Button size="sm" icon={<Plus className="h-4 w-4" />} onClick={() => setShowModal(true)}>Add Reminder</Button>
                </div>
                {reminders.length === 0 ? (
                  <EmptyState icon={<Bell className="h-7 w-7" />} title="No reminders yet" description="Create medication, appointment, or supplement reminders." action={<Button size="sm" onClick={() => setShowModal(true)}>Create Reminder</Button>} />
                ) : (
                  <div className="space-y-3">
                    {reminders.map((r) => (
                      <Card key={r.id} className={"transition-all " + (r.isCompleted ? 'opacity-60' : '')}>
                        <CardContent className="flex items-center gap-4 p-4">
                          <button onClick={() => toggleReminder(r.id)} className={"flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors " + (r.isCompleted ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-zinc-300 dark:border-zinc-600')}>
                            {r.isCompleted && <CheckCircle2 className="h-4 w-4" />}
                          </button>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={"text-sm font-medium " + (r.isCompleted ? 'line-through text-zinc-400' : 'text-zinc-900 dark:text-white')}>{r.title}</span>
                              <Badge variant="outline" size="sm">{reminderTypeLabels[r.type]}</Badge>
                            </div>
                            {r.description && <p className="text-xs text-zinc-500">{r.description}</p>}
                            <div className="flex items-center gap-1 text-xs text-zinc-400"><Clock className="h-3 w-3" />{new Date(r.scheduledTime).toLocaleString()}</div>
                          </div>
                          <button onClick={() => deleteReminder(r.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            )}

            {tabId === 'chat' && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-pink-500" /> AI Health Assistant</CardTitle></CardHeader>
                <CardContent>
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                    {(['general', 'nutrition', 'medication', 'symptom', 'education'] as const).map((t) => (
                      <button key={t} onClick={() => setChatType(t)} className={"whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors " + (chatType === t ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400')}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                  <div className="mb-4 max-h-80 space-y-3 overflow-y-auto rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
                    {chatMessages.length === 0 ? (
                      <p className="py-8 text-center text-sm text-zinc-400">Ask me anything about your pregnancy or health!</p>
                    ) : (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className={"flex " + (msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                          <div className={"max-w-[80%] rounded-2xl px-4 py-2.5 text-sm " + (msg.role === 'user' ? 'bg-pink-500 text-white' : 'bg-white text-zinc-800 shadow-sm dark:bg-zinc-700 dark:text-zinc-200')}>
                            <p>{msg.content}</p>
                            <p className={"mt-1 text-[10px] " + (msg.role === 'user' ? 'text-pink-200' : 'text-zinc-400')}>{new Date(msg.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-2">
                    <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type your question..." className="flex-1" />
                    <Button type="submit" size="icon" disabled={!chatInput.trim()}><Send className="h-4 w-4" /></Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Tabs>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Reminder">
        <div className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Take prenatal vitamins" />
          <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Additional details" />
          <Select label="Type" options={[
            { value: 'medication', label: 'Medication' },
            { value: 'appointment', label: 'Appointment' },
            { value: 'supplement', label: 'Supplement' },
          ]} value={type} onChange={(e) => setType(e.target.value as ReminderType)} />
          <Input label="Date & Time" type="datetime-local" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAddReminder}>Create Reminder</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

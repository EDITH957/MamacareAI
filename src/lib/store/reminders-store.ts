'use client';

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/services/database';
import { sendReminderNotification } from '@/lib/services/notification';
import type { Reminder, ChatMessage } from '@/types';

interface RemindersState {
  reminders: Reminder[];
  chatMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  loadReminders: (motherId: string) => Promise<void>;
  loadChatMessages: (motherId: string) => Promise<void>;
  addReminder: (data: Omit<Reminder, 'id' | 'createdAt'>) => Promise<void>;
  toggleReminder: (id: string) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => Promise<void>;
  sendMessage: (motherId: string, content: string, type?: ChatMessage['type']) => Promise<void>;
  clearError: () => void;
}

export const useRemindersStore = create<RemindersState>()((set, get) => ({
  reminders: [],
  chatMessages: [],
  isLoading: false,
  error: null,

  loadReminders: async (motherId: string) => {
    set({ isLoading: true });
    try {
      const items = await db.reminders.where('motherId').equals(motherId).toArray();
      set({
        reminders: items.sort(
          (a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime()
        ),
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load reminders' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadChatMessages: async (motherId: string) => {
    set({ isLoading: true });
    try {
      const messages = await db.chatMessages.where('motherId').equals(motherId).toArray();
      set({
        chatMessages: messages.sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        ),
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to load messages' });
    } finally {
      set({ isLoading: false });
    }
  },

  addReminder: async (data) => {
    try {
      const reminder: Reminder = {
        ...data,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
      };
      await db.reminders.add(reminder);
      set((state) => ({ reminders: [reminder, ...state.reminders] }));
      sendReminderNotification(reminder.title, reminder.description);
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add reminder' });
      throw err;
    }
  },

  toggleReminder: async (id) => {
    try {
      const reminder = await db.reminders.get(id);
      if (reminder) {
        await db.reminders.update(id, { isCompleted: !reminder.isCompleted });
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
          ),
        }));
      }
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to toggle reminder' });
    }
  },

  deleteReminder: async (id) => {
    try {
      await db.reminders.delete(id);
      set((state) => ({
        reminders: state.reminders.filter((r) => r.id !== id),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to delete reminder' });
    }
  },

  addChatMessage: async (message) => {
    try {
      const msg: ChatMessage = { ...message, id: uuidv4() };
      await db.chatMessages.add(msg);
      set((state) => ({ chatMessages: [...state.chatMessages, msg] }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to add message' });
      throw err;
    }
  },

  sendMessage: async (motherId, content, type = 'general') => {
    const userMsg: Omit<ChatMessage, 'id'> = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      type,
    };
    await get().addChatMessage(userMsg);
    const { generateAIResponse } = await import('@/lib/services/ai-service');
    const response = await generateAIResponse(content, type);
    const assistantMsg: Omit<ChatMessage, 'id'> = {
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
      type,
    };
    await get().addChatMessage(assistantMsg);
  },

  clearError: () => set({ error: null }),
}));

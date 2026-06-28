export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, string>;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function sendLocalNotification(payload: NotificationPayload): void {
  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/icon-192.png',
      tag: payload.tag,
      data: payload.data,
    });
  }
}

export function scheduleNotification(payload: NotificationPayload, delayMs: number): void {
  setTimeout(() => sendLocalNotification(payload), delayMs);
}

export function sendReminderNotification(title: string, description: string): void {
  sendLocalNotification({
    title: `MamaCare Reminder: ${title}`,
    body: description,
    tag: 'reminder',
  });
}

export function sendEmergencyAlert(message: string): void {
  sendLocalNotification({
    title: 'MamaCare Emergency Alert',
    body: message,
    tag: 'emergency',
    data: { type: 'emergency' },
  });
}

export function sendHealthAlert(title: string, message: string): void {
  sendLocalNotification({
    title: `Health Alert: ${title}`,
    body: message,
    tag: 'health-alert',
  });
}

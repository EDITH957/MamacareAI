import { format, differenceInDays, differenceInWeeks, addDays, addWeeks, parseISO, isValid } from 'date-fns';

export function formatDate(date: string | Date, fmt: string = 'MMM dd, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(d)) return 'Invalid date';
  return format(d, fmt);
}

export function calculateGestationalAge(startDate: string, currentDate: string = new Date().toISOString()): number {
  const start = parseISO(startDate);
  const current = parseISO(currentDate);
  if (!isValid(start) || !isValid(current)) return 0;
  return Math.max(0, differenceInWeeks(current, start));
}

export function calculateDueDate(startDate: string): string {
  const start = parseISO(startDate);
  if (!isValid(start)) return 'Invalid date';
  return addDays(start, 280).toISOString();
}

export function getTrimester(gestationalAge: number): 1 | 2 | 3 {
  if (gestationalAge <= 12) return 1;
  if (gestationalAge <= 26) return 2;
  return 3;
}

export function getDaysUntilDue(dueDate: string): number {
  const due = parseISO(dueDate);
  const now = new Date();
  if (!isValid(due)) return 0;
  return Math.max(0, differenceInDays(due, now));
}

export function getWeekRange(weekNumber: number) {
  return {
    start: format(addWeeks(new Date(), weekNumber - 40), 'MMM dd'),
    end: format(addWeeks(new Date(), weekNumber - 39), 'MMM dd'),
  };
}

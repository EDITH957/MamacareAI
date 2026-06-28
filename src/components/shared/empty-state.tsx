'use client';

import { type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center dark:border-zinc-700 dark:bg-zinc-900/50',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        {icon || <Inbox className="h-7 w-7 text-zinc-400" />}
      </div>
      <h3 className="mb-1 text-base font-semibold text-zinc-900 dark:text-white">{title}</h3>
      {description && (
        <p className="mb-4 max-w-sm text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
      )}
      {action}
    </div>
  );
}

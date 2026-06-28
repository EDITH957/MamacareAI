'use client';

import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({
  message = 'Loading...',
  size = 'md',
  className,
}: LoadingStateProps) {
  const iconSize = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-5 w-5' : 'h-7 w-7';

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-16',
        className
      )}
    >
      <Loader2 className={cn('animate-spin text-pink-500', iconSize)} />
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{message}</p>
    </div>
  );
}

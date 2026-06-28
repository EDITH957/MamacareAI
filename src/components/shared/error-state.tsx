'use client';

import { cn } from '@/lib/utils/cn';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-red-200 bg-red-50/50 p-12 text-center dark:border-red-900 dark:bg-red-950/30',
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <div>
        <h3 className="mb-1 text-base font-semibold text-red-700 dark:text-red-300">Error</h3>
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} icon={<RefreshCw className="h-4 w-4" />}>
          Try Again
        </Button>
      )}
    </div>
  );
}

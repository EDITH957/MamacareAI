'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/cn';
import { Heart } from 'lucide-react';

interface HealthScoreCardProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HealthScoreCard({
  score,
  label = 'Maternal Health Score',
  size = 'md',
  className,
}: HealthScoreCardProps) {
  const getVariant = (s: number) => {
    if (s >= 80) return 'success';
    if (s >= 50) return 'warning';
    return 'danger';
  };

  const getColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 50) return 'text-amber-500';
    return 'text-red-500';
  };

  const heartSize = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-5 w-5' : 'h-8 w-8';
  const textSize = size === 'lg' ? 'text-5xl' : size === 'sm' ? 'text-2xl' : 'text-4xl';

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'flex items-center justify-center rounded-full',
              size === 'lg' ? 'h-20 w-20' : size === 'sm' ? 'h-12 w-12' : 'h-16 w-16'
            )}
          >
            <Heart
              className={cn(
                heartSize,
                getColor(score),
                'drop-shadow-sm'
              )}
              fill="currentColor"
            />
          </div>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {label}
            </p>
            <p className={cn('font-bold leading-none tracking-tight', textSize, getColor(score))}>
              {score}
              <span className="ml-1 text-sm font-normal text-zinc-400">/ 100</span>
            </p>
            <Progress
              value={score}
              max={100}
              size="sm"
              variant={getVariant(score)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

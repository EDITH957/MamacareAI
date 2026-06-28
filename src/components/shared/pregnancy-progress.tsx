'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { Baby, CalendarDays, Ruler } from 'lucide-react';

interface PregnancyProgressProps {
  currentWeek: number;
  totalWeeks?: number;
  dueDate: string;
  trimester: number;
  className?: string;
}

export function PregnancyProgress({
  currentWeek,
  totalWeeks = 40,
  dueDate,
  trimester,
  className,
}: PregnancyProgressProps) {
  const progress = (currentWeek / totalWeeks) * 100;
  const weeksLeft = totalWeeks - currentWeek;

  const getTrimesterLabel = (t: number) => {
    switch (t) {
      case 1: return 'First Trimester (Weeks 1-13)';
      case 2: return 'Second Trimester (Weeks 14-27)';
      case 3: return 'Third Trimester (Weeks 28-40)';
      default: return '';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-5 py-3">
        <p className="text-xs font-medium text-pink-100">Pregnancy Progress</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            Week {currentWeek}
          </span>
          <span className="text-sm text-pink-200">
            of {totalWeeks}
          </span>
        </div>
      </div>
      <CardContent className="space-y-4 p-5">
        <Progress
          value={progress}
          max={100}
          size="lg"
          variant="default"
          showLabel
        />
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Due Date</span>
            </div>
            <p className="font-medium text-zinc-900 dark:text-white">
              {formatDate(dueDate)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <Ruler className="h-3.5 w-3.5" />
              <span>Time Left</span>
            </div>
            <p className="font-medium text-zinc-900 dark:text-white">
              {weeksLeft} weeks
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-pink-50 px-3 py-2 dark:bg-pink-950/30">
          <Baby className="h-4 w-4 text-pink-500" />
          <span className="text-xs font-medium text-pink-700 dark:text-pink-300">
            {getTrimesterLabel(trimester)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

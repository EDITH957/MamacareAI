'use client';

import { type ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  default: 'bg-white dark:bg-zinc-900',
  primary: 'bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-900/50',
  success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50',
  warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900/50',
  danger: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50',
};

export function StatCard({
  title,
  value,
  icon,
  description,
  trend,
  trendValue,
  variant = 'default',
  className,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'cursor-default transition-all hover:shadow-md',
        variantClasses[variant],
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{title}</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-white">{value}</p>
            {(description || trend) && (
              <div className="flex items-center gap-1.5">
                {trend && trend !== 'neutral' && (
                  <span
                    className={cn(
                      'flex items-center gap-0.5 text-xs font-medium',
                      trend === 'up'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {trend === 'up' ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {trendValue}
                  </span>
                )}
                {description && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {description}
                  </span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg',
                variant === 'primary' && 'bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400',
                variant === 'success' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
                variant === 'warning' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
                variant === 'danger' && 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
                variant === 'default' && 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

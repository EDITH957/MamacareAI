'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import type { RiskLevel } from '@/types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({ level, size = 'md', showIcon = true, className }: RiskBadgeProps) {
  const config = {
    low: {
      variant: 'success' as const,
      icon: CheckCircle,
      label: 'Low Risk',
    },
    moderate: {
      variant: 'warning' as const,
      icon: AlertTriangle,
      label: 'Moderate Risk',
    },
    high: {
      variant: 'danger' as const,
      icon: AlertCircle,
      label: 'High Risk',
    },
  } as const;

  const { variant, icon: Icon, label } = config[level];

  return (
    <Badge variant={variant} size={size} className={cn('gap-1', className)}>
      {showIcon && <Icon className="h-3 w-3" />}
      {label}
    </Badge>
  );
}

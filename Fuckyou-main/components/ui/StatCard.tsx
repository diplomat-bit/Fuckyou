import React from 'react';
import { ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  delta?: string | number;
  deltaType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  help?: string;
  loading?: boolean;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      title,
      value,
      delta,
      deltaType,
      icon: Icon,
      help,
      loading = false,
      className,
      ...props
    },
    ref
  ) => {
    // Determine delta direction and color if not explicitly provided
    const getDeltaDetails = () => {
      if (!delta) return null;

      const deltaStr = String(delta);
      const isNegative = deltaStr.startsWith('-') || deltaType === 'negative';
      const isNeutral = deltaType === 'neutral' || (!deltaStr.startsWith('+') && !deltaStr.startsWith('-') && !deltaType);
      const isPositive = deltaType === 'positive' || (!isNegative && !isNeutral);

      if (isNeutral) {
        return {
          colorClass: 'text-muted-foreground bg-muted/50',
          icon: null,
        };
      }

      if (isNegative) {
        return {
          colorClass: 'text-destructive bg-destructive/10 dark:bg-destructive/20',
          icon: ArrowDownRight,
        };
      }

      return {
        colorClass: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30',
        icon: ArrowUpRight,
      };
    };

    const deltaDetails = getDeltaDetails();
    const DeltaIcon = deltaDetails?.icon;

    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl border bg-card p-6 text-card-foreground shadow-sm transition-all hover:shadow-md',
          className
        )}
        {...props}
      >
        {/* Header: Title, Help Tooltip, and Icon */}
        <div className="flex items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-muted-foreground select-none">
              {title}
            </span>
            {help && (
              <div className="group relative flex items-center">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/70 cursor-help transition-colors hover:text-muted-foreground" />
                <div className="absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 rounded-md bg-popover px-2.5 py-1.5 text-xs font-normal text-popover-foreground shadow-md outline-none group-hover:block w-48 text-center border">
                  {help}
                </div>
              </div>
            )}
          </div>
          {Icon && (
            <div className="rounded-lg bg-muted/60 p-1.5 text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Content: Value and Delta */}
        <div className="flex items-baseline justify-between gap-2 pt-1">
          {loading ? (
            <div className="space-y-2 w-full">
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <>
              <div className="text-2xl font-bold tracking-tight">
                {value}
              </div>
              {delta !== undefined && deltaDetails && (
                <div
                  className={cn(
                    'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium select-none',
                    deltaDetails.colorClass
                  )}
                >
                  {DeltaIcon && <DeltaIcon className="h-3 w-3 shrink-0" />}
                  <span>{delta}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';
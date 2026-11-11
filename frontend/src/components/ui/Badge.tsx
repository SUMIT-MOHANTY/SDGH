// ============================================================
// LibraMS — Badge Component
// Variants: success, warning, error, info
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center font-medium rounded-full';

    const variants = {
      default: 'bg-muted text-muted-foreground',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      error: 'bg-error/10 text-error',
      info: 'bg-info/10 text-info',
    };

    const sizes = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-0.5 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

// Status badge helper for common status strings
interface StatusBadgeProps extends Omit<BadgeProps, 'variant'> {
  status: string;
}

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
  const statusMap: Record<string, BadgeProps['variant']> = {
    // Loan statuses
    ACTIVE: 'info',
    RETURNED: 'success',
    OVERDUE: 'error',
    // Member statuses
    active: 'success',
    inactive: 'default',
    suspended: 'error',
    // Fine statuses
    PENDING: 'warning',
    PAID: 'success',
    WAIVED: 'info',
    // Reservation statuses
    RESERVED: 'info',
    FULFILLED: 'success',
    CANCELLED: 'default',
    EXPIRED: 'error',
    // Generic
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info',
  };

  const variant = statusMap[status] || 'default';

  return (
    <Badge variant={variant} {...props}>
      {status}
    </Badge>
  );
}

export default Badge;

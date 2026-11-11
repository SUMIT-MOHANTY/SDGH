// ============================================================
// LibraMS — Button Component
// Variants: primary, secondary, ghost, destructive
// Sizes: sm, md, lg
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from './LoadingSpinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-primary text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary:
        'bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-secondary',
      ghost:
        'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground focus:ring-accent',
      destructive:
        'bg-error text-white hover:bg-error/90 focus:ring-error',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <LoadingSpinner
            size="sm"
            className={cn(children && iconPosition === 'left' && 'mr-2')}
          />
        )}
        {!loading && icon && iconPosition === 'left' && (
          <span className={cn(children && 'mr-2')}>{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === 'right' && (
          <span className={cn(children && 'ml-2')}>{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

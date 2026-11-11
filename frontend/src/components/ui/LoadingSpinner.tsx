// ============================================================
// LibraMS — Loading Spinner Component
// Sizes: sm, md, lg, xl (full-page)
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullPage?: boolean;
}

export const LoadingSpinner = React.forwardRef<
  HTMLDivElement,
  LoadingSpinnerProps
>(({ className, size = 'md', fullPage = false, ...props }, ref) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div
      ref={ref}
      className={cn(
        'animate-spin rounded-full border-current border-t-transparent',
        sizes[size],
        className
      )}
      {...props}
    />
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;

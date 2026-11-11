// ============================================================
// LibraMS — Empty State Component
// Icon + message + optional CTA button
// ============================================================

import React from 'react';
import { Package, Search, FileX, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: 'package' | 'search' | 'file' | 'inbox' | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  className?: string;
}

const iconMap = {
  package: Package,
  search: Search,
  file: FileX,
  inbox: Inbox,
};

export function EmptyState({
  icon = 'package',
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const IconComponent =
    typeof icon === 'string' ? iconMap[icon] || Package : null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8',
        className
      )}
    >
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        {IconComponent ? (
          <IconComponent className="w-8 h-8 text-muted-foreground" />
        ) : (
          icon
        )}
      </div>
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} icon={action.icon}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;

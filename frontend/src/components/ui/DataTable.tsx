// ============================================================
// LibraMS — Data Table Component
// Generic, sortable columns, row-click handler, empty state
// ============================================================

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmptyState } from './EmptyState';
import { LoadingSpinner } from './LoadingSpinner';

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string | number;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyState?: {
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
  };
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = React.useMemo(() => {
    if (!sortColumn || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortColumn);
      const bValue = getNestedValue(b, sortColumn);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="bg-muted/50 h-10" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 border-t border-border bg-card">
              <div className="flex items-center h-full px-4">
                <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return (
      <div className="border border-border rounded-lg">
        <EmptyState
          icon="search"
          title={emptyState.title}
          description={emptyState.description}
          action={emptyState.action}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border border-border rounded-lg overflow-hidden',
        className
      )}
    >
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider',
                  column.sortable && 'cursor-pointer hover:bg-muted',
                  column.width
                )}
                style={{ width: column.width }}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && (
                    <span className="inline-flex flex-col">
                      <ChevronUp
                        className={cn(
                          'w-3 h-3 -mb-0.5',
                          sortColumn === column.key && sortDirection === 'asc'
                            ? 'text-foreground'
                            : 'text-muted-foreground/30'
                        )}
                      />
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 -mt-0.5',
                          sortColumn === column.key && sortDirection === 'desc'
                            ? 'text-foreground'
                            : 'text-muted-foreground/30'
                        )}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {sortedData.map((row) => (
            <tr
              key={keyExtractor(row)}
              className={cn(
                onRowClick && 'cursor-pointer hover:bg-muted/50',
                'transition-colors'
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((column) => {
                const value = getNestedValue(row, String(column.key));
                return (
                  <td key={String(column.key)} className="px-4 py-3 text-sm">
                    {column.render
                      ? column.render(value, row)
                      : String(value ?? '-')}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return (acc as Record<string, unknown>)[part];
  }, obj);
}

export default DataTable;

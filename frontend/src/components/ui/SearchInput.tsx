// ============================================================
// LibraMS — Search Input Component
// Debounced, clear button, real-time onChange
// ============================================================

import React, { useState, useCallback, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
  debounceMs?: number;
  showClear?: boolean;
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<
  HTMLInputElement,
  SearchInputProps
>(
  (
    {
      className,
      onChange,
      debounceMs = 300,
      showClear = true,
      containerClassName,
      value: controlledValue,
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState(controlledValue || '');

    // Sync with controlled value
    useEffect(() => {
      if (controlledValue !== undefined) {
        setInputValue(controlledValue);
      }
    }, [controlledValue]);

    // Debounced onChange
    useEffect(() => {
      const timer = setTimeout(() => {
        onChange(inputValue as string);
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [inputValue, debounceMs, onChange]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value);
      },
      []
    );

    const handleClear = useCallback(() => {
      setInputValue('');
      onChange('');
    }, [onChange]);

    return (
      <div className={cn('relative', containerClassName)}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          className={cn(
            'w-full pl-10 pr-10 py-2 bg-background border border-input rounded-md',
            'text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          value={inputValue}
          onChange={handleChange}
          {...props}
        />
        {showClear && inputValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;

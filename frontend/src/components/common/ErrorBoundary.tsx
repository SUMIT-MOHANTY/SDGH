// ============================================================
// LibraMS — Error Boundary
// Catches runtime errors and displays fallback UI
// ============================================================

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card border border-border rounded-lg shadow-card p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-error" />
            </div>
            <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-muted-foreground mb-6">
              We apologize for the inconvenience. An unexpected error has occurred.
            </p>
            {this.state.error && (
              <div className="bg-muted rounded-md p-4 mb-6 text-left">
                <p className="text-sm font-mono text-error break-all">
                  {this.state.error.message}
                </p>
              </div>
            )}
            <Button
              onClick={this.handleReset}
              className="w-full"
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

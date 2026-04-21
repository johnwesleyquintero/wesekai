import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw, Copy, Check, SearchX } from 'lucide-react';
import { JikanRateLimitError } from '../lib/errors';
import { ApiError } from '../lib/api-manager';

interface Props {
  children: ReactNode;
  onJikanRateLimitRetry?: () => void; // New prop for specific retry action
}

interface State {
  hasError: boolean;
  error: Error | null;
  isJikanRateLimitError: boolean; // New state to identify Jikan rate limit errors
  isNotFoundError: boolean;
  copied: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isJikanRateLimitError: false,
      isNotFoundError: false,
      copied: false,
    };
  }

  // This method is called after an error has been thrown by a descendant component.
  // It receives the error that was thrown as a parameter.
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isJikanRateLimitError: error instanceof JikanRateLimitError,
      isNotFoundError:
        (error instanceof ApiError && error.category === 'NOT_FOUND') ||
        (typeof error === 'object' &&
          error !== null &&
          'category' in error &&
          // We cast to { category: unknown } to safely access the property, then compare its value.
          (error as { category: unknown }).category === 'NOT_FOUND'),
      copied: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    if (this.state.hasError) {
      this.setState({ hasError: false, error: null }, () => {
        // If the reset didn't fix the render cycle, a hard reload is the safest fallback
        setTimeout(() => {
          if (this.state.hasError) window.location.reload();
        }, 100);
      });
    }
  };

  handleCopyError = () => {
    if (this.state.error) {
      const errorDetails = `${this.state.error.name}: ${this.state.error.message}\n\nStack Trace:\n${this.state.error.stack}`;
      navigator.clipboard.writeText(errorDetails);
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.state.isJikanRateLimitError && this.props.onJikanRateLimitRetry) {
        return (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-zinc-900/50 border border-orange-500/20 rounded-3xl backdrop-blur-xl">
            <div className="p-4 bg-orange-500/10 rounded-full mb-6">
              <AlertCircle className="w-12 h-12 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Jikan API Rate Limit Exceeded</h2>
            <p className="text-zinc-400 mb-8 max-w-md">
              The Jikan API is currently rate-limiting requests. We can try fetching from the Elite
              Fallback dataset instead.
            </p>
            <button
              onClick={this.props.onJikanRateLimitRetry}
              className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Retry with Elite Fallback
            </button>
          </div>
        );
      } else if (this.state.isNotFoundError) {
        return (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-zinc-900/50 border border-indigo-500/20 rounded-3xl backdrop-blur-xl">
            <div className="p-4 bg-indigo-500/10 rounded-full mb-6">
              <SearchX className="w-12 h-12 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Resource Not Found</h2>
            <p className="text-zinc-400 mb-8 max-w-md">
              The Intelligence Layer could not locate the requested entity. This may occur during
              temporal API synchronization.
            </p>
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Re-synchronize Data
            </button>
          </div>
        );
      } else {
        // Generic error handling
        return (
          <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-zinc-900/50 border border-red-500/20 rounded-3xl backdrop-blur-xl">
            <div className="p-4 bg-red-500/10 rounded-full mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
            <p className="text-zinc-400 mb-8 max-w-md">
              An unexpected error occurred in the intelligence layer. We&apos;ve been notified and
              are looking into it.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                Reload Application
              </button>
              <button
                onClick={this.handleCopyError}
                className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-300 rounded-xl font-bold hover:bg-zinc-700 transition-colors border border-zinc-700"
              >
                {this.state.copied ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                {this.state.copied ? 'Copied!' : 'Copy Technical Details'}
              </button>
            </div>
          </div>
        );
      }
    }

    return this.props.children;
  }
}

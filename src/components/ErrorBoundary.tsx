import React, { ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { JikanRateLimitError } from '../lib/errors';

interface Props {
  children: ReactNode;
  onJikanRateLimitRetry?: () => void; // New prop for specific retry action
}

interface State {
  hasError: boolean;
  error: Error | null;
  isJikanRateLimitError: boolean; // New state to identify Jikan rate limit errors
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, isJikanRateLimitError: false };
  }

  // This method is called after an error has been thrown by a descendant component.
  // It receives the error that was thrown as a parameter.
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isJikanRateLimitError: error instanceof JikanRateLimitError,
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
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Application
            </button>
          </div>
        );
      }
    }

    return this.props.children;
  }
}

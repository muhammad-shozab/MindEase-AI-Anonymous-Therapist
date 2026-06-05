import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-red-950 border border-red-800 rounded-2xl p-8">
            <h1 className="text-3xl font-bold text-red-400 mb-4">
              Something went wrong
            </h1>
            <p className="text-red-300 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <details className="mb-4">
              <summary className="text-red-400 cursor-pointer mb-2">
                Error Details
              </summary>
              <pre className="text-xs text-red-300 bg-gradient-to-br from-sky-100 via-purple-100 to-pink-100 dark:from-slate-900 dark:via-violet-950 dark:to-fuchsia-950 p-4 rounded overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-slate-800 dark:text-slate-100 px-6 py-3 rounded-lg transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

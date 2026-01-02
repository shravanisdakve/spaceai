import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-200 p-8">
            <div className="max-w-2xl mx-auto text-center">
                <h1 className="text-4xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h1>
                <p className="text-lg text-slate-400 mb-6">
                    We've encountered an unexpected error. Please try refreshing the page.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors"
                >
                    Refresh Page
                </button>
                {/* For development, it's useful to see the error */}
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-8 p-4 bg-slate-800 rounded-lg text-left">
                        <summary className="cursor-pointer font-semibold text-slate-300">Error Details</summary>
                        <pre className="mt-2 text-sm text-red-400 whitespace-pre-wrap">
                            {this.state.error?.toString()}
                            <br />
                            {this.state.error?.stack}
                        </pre>
                    </details>
                )}
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

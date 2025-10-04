import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-4">🚨</div>
              <div>
                <h1 className="text-2xl font-bold text-red-800">Application Error</h1>
                <p className="text-red-600">Something went wrong while loading PromptsGo</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <h2 className="text-red-800 font-semibold mb-2">Error Details:</h2>
              <p className="text-red-700 font-mono text-sm">
                {this.state.error && this.state.error.toString()}
              </p>
            </div>

            {this.state.errorInfo && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-4">
                <h2 className="text-gray-800 font-semibold mb-2">Stack Trace:</h2>
                <pre className="text-gray-700 font-mono text-xs overflow-auto max-h-48">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                🔄 Reload Page
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                🔧 Try Again
              </button>
            </div>

            <div className="mt-6 text-sm text-gray-600">
              <p><strong>Common Solutions:</strong></p>
              <ul className="list-disc list-inside mt-2">
                <li>Check if Supabase schema has been applied to your database</li>
                <li>Verify environment variables are correctly set</li>
                <li>Check browser console for additional error details</li>
                <li>Try clearing browser cache and cookies</li>
              </ul>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
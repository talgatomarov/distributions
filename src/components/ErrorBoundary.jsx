import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error for debugging
    console.error('Error boundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render error UI
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center text-red-500 max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <div className="text-xl font-medium text-gray-700 mb-2">Something went wrong</div>
            <div className="text-sm text-gray-500 mb-4">
              An error occurred while rendering this component. Please try refreshing the page or adjusting your parameters.
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600">
                  Show Error Details (Development Only)
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-red-50 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
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
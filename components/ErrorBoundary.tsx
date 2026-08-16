import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    window.location.reload();
  };

  private handleCopy = () => {
    const { error, errorInfo } = this.state;
    const errorDetails = `
Error: ${error?.message}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
    `.trim();

    navigator.clipboard.writeText(errorDetails).then(() => {
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 2000);
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      let errorMessage = "An unexpected error occurred.";
      let errorDetails = "";

      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.operationType) {
            errorMessage = `Firestore ${parsed.operationType} error: ${parsed.error}`;
            errorDetails = `Path: ${parsed.path || 'unknown'}`;
          }
        }
      } catch (e) {
        errorMessage = this.state.error?.message || errorMessage;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-950 text-center text-gray-100">
          <div className="bg-gray-900 p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-red-900/50">
            <div className="bg-red-950/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <AlertTriangle className="text-red-500 w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">System Exception Detected</h1>
            <p className="text-gray-400 mb-4 text-sm">{errorMessage}</p>
            
            {errorDetails && (
              <p className="text-xs font-mono bg-gray-950 p-3 rounded-lg mb-4 text-red-400 border border-red-950 break-all text-left">
                {errorDetails}
              </p>
            )}

            {this.state.error?.stack && (
              <div className="text-left mb-6">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Stack Trace</span>
                <pre className="mt-1 text-xs font-mono bg-gray-950 p-4 rounded-lg text-gray-400 overflow-auto max-h-40 border border-gray-800">
                  {this.state.error.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleCopy}
                className="flex items-center justify-center flex-1 gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-3 px-6 rounded-xl transition-all border border-gray-700"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Error Details
                  </>
                )}
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/30"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { lastBossService } from '../services/LastBossService';
import { securityService } from '../services/SecurityService';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; resetErrorBoundary: () => void }) => ReactNode);
  onReset?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  name?: string;
  resetKeys?: Array<any>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
  copied: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Call optional onError callback
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (e) {
        console.error("Error in ErrorBoundary onError callback:", e);
      }
    }

    // Log to Security Service
    try {
      if (securityService && typeof securityService.logError === 'function') {
        securityService.logError(error, errorInfo);
      } else {
        console.error("SecurityService logError is not available", error, errorInfo);
      }
    } catch (e) {
      console.error("Failed to log to SecurityService:", e);
    }

    // Log to Last Boss Service
    try {
      if (lastBossService && typeof lastBossService.reportException === 'function') {
        lastBossService.reportException(error, errorInfo);
      }
    } catch (e) {
      console.error("Failed to log to LastBossService:", e);
    }
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    const { hasError } = this.state;
    const { resetKeys } = this.props;

    if (hasError && resetKeys && this.hasArrayChanged(prevProps.resetKeys, resetKeys)) {
      this.handleReset();
    }
  }

  private hasArrayChanged(a: Array<any> | undefined, b: Array<any> | undefined): boolean {
    if (!a || !b) return true;
    if (a.length !== b.length) return true;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return true;
    }
    return false;
  }

  handleReset = () => {
    if (this.props.onReset) {
      try {
        this.props.onReset();
      } catch (e) {
        console.error("Error in ErrorBoundary onReset callback:", e);
      }
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
      copied: false,
    });
  };

  handleHardReload = () => {
    window.location.reload();
  };

  handleClearCacheAndReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    } catch (e) {
      console.error("Failed to clear cache:", e);
      window.location.reload();
    }
  };

  handleCopyDiagnostics = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;

    const report = {
      timestamp: new Date().toISOString(),
      component: this.props.name || 'Unknown Component',
      errorMessage: error.message,
      errorStack: error.stack || 'No stack trace available',
      componentStack: errorInfo?.componentStack || 'No component stack available',
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    navigator.clipboard.writeText(JSON.stringify(report, null, 2))
      .then(() => {
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 3000);
      })
      .catch((err) => {
        console.error('Failed to copy diagnostics:', err);
      });
  };

  render() {
    const { hasError, error, errorInfo, showDetails, copied } = this.state;
    const { children, fallback, name } = this.props;

    if (hasError && error) {
      // If custom fallback is provided as a function
      if (typeof fallback === 'function') {
        return fallback({ error, resetErrorBoundary: this.handleReset });
      }

      // If custom fallback is provided as a ReactNode
      if (fallback) {
        return fallback;
      }

      // Default high-tech visual fallback
      return (
        <div className="min-h-[450px] w-full flex items-center justify-center p-6 bg-slate-950/90 border border-rose-500/20 rounded-2xl backdrop-blur-xl shadow-2xl shadow-rose-950/10 text-slate-100 font-sans">
          <div className="max-w-3xl w-full space-y-6">
            {/* Header Section */}
            <div className="flex items-start space-x-4 bg-rose-950/10 border border-rose-500/20 p-6 rounded-xl">
              <div className="flex-shrink-0 p-3 bg-rose-500/10 rounded-lg border border-rose-500/30 animate-pulse">
                <svg className="h-8 w-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-rose-400 tracking-wide uppercase">
                    {name ? `[${name}] Execution Fault` : 'Sovereign System Exception'}
                  </h3>
                  <span className="px-2 py-0.5 text-xs font-mono bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                    CRITICAL_ERR
                  </span>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">
                  An unhandled exception occurred within the neural runtime. The sandbox has isolated the blast radius to protect the global ledger and system state.
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 font-mono text-sm">
              <div className="text-slate-500 text-xs uppercase tracking-wider mb-2 border-b border-slate-800 pb-2 flex justify-between items-center">
                <span>Exception Message</span>
                <span className="text-rose-400/80">Type: {error.name || 'Error'}</span>
              </div>
              <div className="text-rose-200 break-words select-all font-semibold">
                {error.message || 'Unknown runtime error occurred.'}
              </div>
            </div>

            {/* Action Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-900/20 border border-emerald-500/30 hover:scale-[1.02]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H16" />
                </svg>
                <span>Attempt Recovery</span>
              </button>

              <button
                onClick={this.handleHardReload}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-medium rounded-xl transition-all duration-200 border border-slate-700 hover:scale-[1.02]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Hard Reload</span>
              </button>

              <button
                onClick={this.handleClearCacheAndReload}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-amber-950/40 hover:bg-amber-900/40 active:bg-amber-950 text-amber-300 font-medium rounded-xl transition-all duration-200 border border-amber-500/20 hover:scale-[1.02]"
                title="Clears localStorage, sessionStorage, and reloads the page"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Clear Cache & Reload</span>
              </button>

              <button
                onClick={this.handleCopyDiagnostics}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 font-medium rounded-xl transition-all duration-200 border hover:scale-[1.02] ${
                  copied
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                {copied ? (
                  <>
                    <svg className="h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy Diagnostics</span>
                  </>
                )}
              </button>
            </div>

            {/* Expandable Diagnostics */}
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <button
                onClick={() => this.setState({ showDetails: !showDetails })}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-200 transition-colors duration-150 text-xs font-mono uppercase tracking-wider"
              >
                <span>Technical Diagnostics Log</span>
                <svg
                  className={`h-4 w-4 transform transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDetails && (
                <div className="p-4 bg-black/40 border-t border-slate-800 space-y-4 font-mono text-xs text-slate-400 max-h-96 overflow-y-auto select-text">
                  <div>
                    <div className="text-rose-400/80 font-bold mb-1 uppercase tracking-wider">Stack Trace:</div>
                    <pre className="whitespace-pre-wrap break-all bg-black/60 p-3 rounded border border-slate-900 leading-relaxed">
                      {error.stack || 'No stack trace available.'}
                    </pre>
                  </div>

                  {errorInfo && (
                    <div>
                      <div className="text-amber-400/80 font-bold mb-1 uppercase tracking-wider">Component Stack:</div>
                      <pre className="whitespace-pre-wrap break-all bg-black/60 p-3 rounded border border-slate-900 leading-relaxed">
                        {errorInfo.componentStack || 'No component stack available.'}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-[10px] text-slate-500">
                    <div>Environment: {process.env.NODE_ENV || 'production'}</div>
                    <div>Timestamp: {new Date().toISOString()}</div>
                    <div className="md:col-span-2 break-all">URL: {window.location.href}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary;
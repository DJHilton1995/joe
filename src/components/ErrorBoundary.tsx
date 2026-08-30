import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React UI error captured by Joey Sentinel ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 select-none font-mono">
          <div className="max-w-xl w-full bg-slate-900/90 border border-red-500/30 rounded-xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-amber-500 to-cyan-500 animate-pulse" />
            
            <div className="flex items-center gap-3 text-red-400 mb-4">
              <ShieldAlert className="w-8 h-8 animate-bounce" />
              <h2 className="text-xl font-bold tracking-wider">SENTINEL ISOLATION PROTOCOL ENGAGED</h2>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed">
              An unhandled runtime anomaly was safely intercepted by Joey's Sentinel Error Boundary. 
              The subsystem state has been isolated to prevent process crash or data leakage.
            </p>

            {this.state.error && (
              <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 mb-6 text-xs font-mono text-red-300 overflow-x-auto max-h-40">
                <div className="flex items-center gap-1 font-semibold text-red-400 mb-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Fault Signature:</span>
                </div>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={this.handleReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-lg shadow-cyan-600/20 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Recover Subsystem
              </button>
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all border border-slate-700 active:scale-95"
              >
                Reload Sentinel Core
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

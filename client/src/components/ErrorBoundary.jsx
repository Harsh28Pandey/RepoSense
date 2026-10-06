import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] w-full flex items-center justify-center p-6 bg-[#EEF1F5] text-[#1F2A37]">
          <div className="max-w-md w-full p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] shadow-sm text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FEF2F2] border border-[#F87171]/20 flex items-center justify-center mx-auto text-[#DC2626]">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#1F2A37]">Something went wrong</h2>
              <p className="text-xs text-[#5B6778]">
                An unexpected error occurred while rendering this page.
              </p>
            </div>
            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-[#E8ECF1] border border-[#D3D9E2] text-left text-[11px] font-mono text-[#5B6778] overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <button
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

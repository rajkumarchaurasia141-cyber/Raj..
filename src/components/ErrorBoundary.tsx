import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BSEB ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-stone-200 text-center space-y-5">
            <div className="w-16 h-16 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-inner">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-stone-900">
                पेज लोड करने में कोई समस्या हुई
              </h2>
              <p className="text-sm text-stone-600 font-medium leading-relaxed">
                चिंता न करें, आपका कोई भी डाटा नहीं गायब हुआ है। कृपया नीचे दिए गए बटन पर क्लिक करके ऐप को पुनः प्रारंभ करें।
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-red-700 hover:bg-red-800 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md transition-all cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>होम पर जाएं</span>
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>रीलोड करें</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

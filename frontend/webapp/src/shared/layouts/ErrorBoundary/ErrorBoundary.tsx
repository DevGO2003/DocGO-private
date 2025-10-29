import { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@shared/components';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/';
  };

  handleBack = () => {
    const currentUrl = window.location.href;
    const referrer = document.referrer;

    const navigateToReferrerOrHome = () => {
      try {
        if (referrer && new URL(referrer).origin === window.location.origin) {
          window.location.href = referrer;
          return;
        }
      } catch (_) {
        // Ignore URL parsing errors and fall through to home redirect
      }
      window.location.href = '/';
    };

    if (window.history.length > 1) {
      window.history.back();
      // If back navigation has no effect (same URL), fallback quickly
      setTimeout(() => {
        if (window.location.href === currentUrl) {
          navigateToReferrerOrHome();
        }
      }, 300);
    } else {
      navigateToReferrerOrHome();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle className="text-red-600">⚠️ Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-700">
                  We're sorry, but something unexpected happened. Please try refreshing the page.
                </p>
                
                {this.state.error && (
                  <details className="bg-gray-100 p-4 rounded-lg">
                    <summary className="cursor-pointer font-semibold text-gray-900 mb-2">
                      Error Details
                    </summary>
                    <pre className="text-xs text-gray-700 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                )}

                <div className="flex gap-4 flex-wrap">
                  <Button 
                    variant="outline" 
                    onClick={this.handleBack}
                  >
                    Quay lại
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={this.handleReset}
                  >
                    Go to Home
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    Reload Page
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

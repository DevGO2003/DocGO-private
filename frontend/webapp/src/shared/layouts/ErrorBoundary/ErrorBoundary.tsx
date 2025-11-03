import { Component, ErrorInfo, ReactNode } from 'react';
import { withTranslation, type WithTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@shared/components';

interface Props extends WithTranslation {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundaryBase extends Component<Props, State> {
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

    try {
      if (referrer) {
        const ref = new URL(referrer);
        if (ref.origin === window.location.origin && ref.href !== currentUrl) {
          window.location.replace(ref.href);
          return;
        }
      }
    } catch {}

    window.location.replace('/');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#f9fafb' }} >
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <CardTitle style={{ color: '#dc2626' }} >⚠️ {this.props.t('errorBoundary.title', 'Something went wrong')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p style={{ color: '#374151' }} >
                  {this.props.t('errorBoundary.message', "We're sorry, but something unexpected happened. Please try refreshing the page.")}
                </p>
                
                {this.state.error && (
                  <details className="p-4 rounded-lg" style={{ backgroundColor: '#f3f4f6' }} >
                    <summary className="cursor-pointer font-semibold mb-2" style={{ color: '#111827' }} >
                      {this.props.t('errorBoundary.details', 'Error Details')}
                    </summary>
                    <pre className="text-xs overflow-auto" style={{ color: '#374151' }} >
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
                    {this.props.t('errorBoundary.back', 'Quay lại')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={this.handleReset}
                  >
                    {this.props.t('errorBoundary.home', 'Về trang chủ')}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()}
                  >
                    {this.props.t('errorBoundary.reload', 'Tải lại trang')}
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

export const ErrorBoundary = withTranslation()(ErrorBoundaryBase);

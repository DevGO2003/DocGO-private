
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
  overlay?: boolean; // positions spinner absolutely within parent
  transparentBg?: boolean; // when overlay/fullScreen, make background transparent
}

export const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...',
  fullScreen = false,
  overlay = false,
  transparentBg = false,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const spinnerContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeClasses[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
      />
      {text && (
        <p className="font-medium" style={ color: '#4b5563' }>
          {text}
        </p>
      )}
    </div>
  );

  // Only allow full-screen overlay when ControlMainLayout exists
  if (fullScreen) {
    const canFullScreen = typeof window !== 'undefined' && typeof document !== 'undefined' && !!document.getElementById('control-main-layout-root');
    if (canFullScreen) {
      return (
        <div className={`fixed inset-0 ${transparentBg ? 'bg-transparent' : 'bg-white bg-opacity-90'} flex items-center justify-center z-50`}>
          {spinnerContent}
        </div>
      );
    }
    // Fallback: if overlay requested, use overlay; otherwise render inline
    if (overlay) {
      return (
        <div className={`absolute inset-0 ${transparentBg ? 'bg-transparent' : 'bg-white/60'} flex items-center justify-center z-20`}>
          {spinnerContent}
        </div>
      );
    }
    return <div className="flex items-center justify-center p-8">{spinnerContent}</div>;
  }

  if (overlay) {
    return (
      <div className={`absolute inset-0 ${transparentBg ? 'bg-transparent' : 'bg-white/60'} flex items-center justify-center z-20`}>
        {spinnerContent}
      </div>
    );
  }

  return <div className="flex items-center justify-center p-8">{spinnerContent}</div>;
};

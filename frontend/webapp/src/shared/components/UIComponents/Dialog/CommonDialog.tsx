import { ReactNode, useEffect, useRef } from 'react';
import anime from 'animejs';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../Card';
import { CommonIcon } from '../Icon/CommonIcon';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

const maxWidthClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Dialog = ({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}: DialogProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && backdropRef.current && dialogRef.current) {
      anime({
        targets: backdropRef.current,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad',
      });
      anime({
        targets: dialogRef.current,
        opacity: [0, 1],
        scale: [0.95, 1],
        translateY: [20, 0],
        duration: 300,
        easing: 'easeOutQuad',
      });
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        style={{ opacity: 0 }}
      />

      {/* Dialog */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          ref={dialogRef}
          className={`w-full ${maxWidthClasses[maxWidth]}`}
          style={{ opacity: 0 }}
        >
              <Card className="shadow-2xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    <button
                      onClick={onClose}
                      className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <CommonIcon name="x" size={20} color="#6b7280" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="py-6">
                  {children}
                </CardContent>
                {footer && (
                  <CardFooter className="flex justify-end gap-3">
                    {footer}
                  </CardFooter>
                )}
              </Card>
        </div>
      </div>
    </>
  );
};

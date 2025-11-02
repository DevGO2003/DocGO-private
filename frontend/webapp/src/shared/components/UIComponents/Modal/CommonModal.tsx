import { forwardRef, ReactNode, useRef, useEffect } from 'react';
import anime from 'animejs';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonIcon } from '../Icon/CommonIcon';

interface CommonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

export const CommonModal = forwardRef<HTMLDivElement, CommonModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      footer,
      size = 'md',
      closeOnBackdropClick = true,
    },
    ref
  ) => {
    const backdropRef = useRef<HTMLDivElement>(null);
    const modalRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawCanvas = () => {
      if (!modalRef.current || !canvasRef.current) return;
      const container = modalRef.current;
      const canvas = canvasRef.current;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      if (width === 0 || height === 0) return;
      canvas.width = width;
      canvas.height = height;
      const rc = createRoughCanvas(canvas);
      drawRoughRect(rc, 6, 6, width - 12, height - 12, {
        stroke: '#94a3b8',
        strokeWidth: 2,
        roughness: 1.5,
      });
    };

    useEffect(() => {
      if (isOpen) {
        // Animate backdrop
        anime.set(backdropRef.current, {
          opacity: 0,
        });
        anime({
          targets: backdropRef.current,
          opacity: 1,
          duration: 300,
          easing: 'easeOutQuad',
        });

        // Animate modal
        anime.set(modalRef.current, {
          opacity: 0,
          scale: 0.95,
        });
        anime({
          targets: modalRef.current,
          opacity: 1,
          scale: 1,
          duration: 300,
          easing: 'easeOutQuad',
        });

        // Draw hand-drawn border
        const t = setTimeout(drawCanvas, 50);
        return () => clearTimeout(t);

        // Prevent body scroll
        document.body.style.overflow = 'hidden';
      } else {
        // Animate out
        if (backdropRef.current && modalRef.current) {
          anime({
            targets: backdropRef.current,
            opacity: 0,
            duration: 200,
            easing: 'easeInQuad',
          });
          anime({
            targets: modalRef.current,
            opacity: 0,
            scale: 0.95,
            duration: 200,
            easing: 'easeInQuad',
          });
        }

        // Restore body scroll
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
      <div
        ref={ref || backdropRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={(e) => {
          if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          ref={modalRef}
          className={`relative w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl overflow-hidden`}
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%' }}
          />
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <CommonIcon name="x" size={20} />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CommonModal.displayName = 'CommonModal';

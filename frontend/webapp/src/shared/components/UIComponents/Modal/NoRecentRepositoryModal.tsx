import React, { useRef, useEffect } from 'react';
import anime from 'animejs';
import { ArrowRight, X } from 'lucide-react';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';

interface NoRecentRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoToRepositories: () => void;
}

export const NoRecentRepositoryModal: React.FC<NoRecentRepositoryModalProps> = ({
  isOpen,
  onClose,
  onGoToRepositories,
}) => {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const iconCanvasRef = useRef<HTMLCanvasElement>(null);
  const buttonCanvasRef1 = useRef<HTMLCanvasElement>(null);
  const buttonCanvasRef2 = useRef<HTMLCanvasElement>(null);

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
    drawRoughRect(rc, 8, 8, width - 16, height - 16, {
      stroke: '#374151',
      strokeWidth: 3,
      roughness: 2.5,
      fill: '#f9fafb',
    });
  };

  const drawIconCanvas = () => {
    if (!iconCanvasRef.current) return;
    const canvas = iconCanvasRef.current;
    const size = 80;
    canvas.width = size;
    canvas.height = size;
    const rc = createRoughCanvas(canvas);
    
    // Draw folder icon
    drawRoughRect(rc, 10, 20, 50, 40, {
      stroke: '#3b82f6',
      strokeWidth: 3,
      roughness: 2,
      fill: '#dbeafe',
    });
    
    // Draw folder tab
    drawRoughRect(rc, 10, 15, 30, 15, {
      stroke: '#3b82f6',
      strokeWidth: 3,
      roughness: 2,
      fill: '#dbeafe',
    });
  };

  const drawButtonCanvas = (canvasRef: React.RefObject<HTMLCanvasElement>, color: string) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const rc = createRoughCanvas(canvas);
    drawRoughRect(rc, 2, 2, canvas.width - 4, canvas.height - 4, {
      stroke: color,
      strokeWidth: 2,
      roughness: 1.8,
      fill: color === '#374151' ? '#f3f4f6' : '#3b82f6',
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
        duration: 400,
        easing: 'easeOutQuad',
      });

      // Animate modal
      anime.set(modalRef.current, {
        opacity: 0,
        scale: 0.9,
        rotateY: -10,
      });
      anime({
        targets: modalRef.current,
        opacity: 1,
        scale: 1,
        rotateY: 0,
        duration: 500,
        easing: 'easeOutBack',
      });

      // Draw hand-drawn borders
      const t1 = setTimeout(drawCanvas, 100);
      const t2 = setTimeout(drawIconCanvas, 150);
      const t3 = setTimeout(() => drawButtonCanvas(buttonCanvasRef1, '#374151'), 200);
      const t4 = setTimeout(() => drawButtonCanvas(buttonCanvasRef2, '#3b82f6'), 250);

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        clearTimeout(t4);
      };
    } else {
      // Animate out
      if (backdropRef.current && modalRef.current) {
        anime({
          targets: backdropRef.current,
          opacity: 0,
          duration: 250,
          easing: 'easeInQuad',
        });
        anime({
          targets: modalRef.current,
          opacity: 0,
          scale: 0.9,
          rotateY: 10,
          duration: 300,
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
      ref={backdropRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-transparent overflow-hidden"
        style={{ fontFamily: '"Kalam", "Comic Sans MS", cursive' }}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Header */}
        <div className="relative px-8 py-6">
          <div className="flex items-center justify-between">
            <h2 
              className="text-2xl font-bold"
              style={{ 
                color: '#374151',
                textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
                transform: 'rotate(-1deg)'
              }}
            >
              📁 Chưa có repository gần đây
            </h2>
            <button
              onClick={onClose}
              className="relative p-2 hover:scale-110 transition-transform"
              style={{ color: '#6b7280' }}
            >
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-8 py-4">
          <div className="space-y-6">
            {/* Hand-drawn icon */}
            <div className="flex justify-center">
              <div className="relative">
                <canvas
                  ref={iconCanvasRef}
                  className="block"
                  style={{ width: '80px', height: '80px' }}
                />
              </div>
            </div>
            
            {/* Description */}
            <div className="text-center">
              <p 
                className="text-lg leading-relaxed"
                style={{ 
                  color: '#4b5563',
                  transform: 'rotate(0.5deg)',
                  textShadow: '1px 1px 0px rgba(0,0,0,0.05)'
                }}
              >
                Bạn chưa mở repository nào gần đây.<br/>
                Để xem files, bạn cần chọn một repository! ✨
              </p>
            </div>
            
            {/* Question box */}
            <div 
              className="relative p-6 mx-4"
              style={{ 
                backgroundColor: '#dbeafe',
                transform: 'rotate(-0.5deg)',
                borderRadius: '20px'
              }}
            >
              <canvas
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
                ref={(ref) => {
                  if (ref) {
                    setTimeout(() => {
                      const rc = createRoughCanvas(ref);
                      drawRoughRect(rc, 4, 4, ref.offsetWidth - 8, ref.offsetHeight - 8, {
                        stroke: '#3b82f6',
                        strokeWidth: 2,
                        roughness: 2,
                        fill: '#dbeafe',
                      });
                    }, 100);
                  }
                }}
              />
              <p 
                className="relative text-center font-bold text-lg"
                style={{ 
                  color: '#1e40af',
                  transform: 'rotate(0.3deg)',
                  textShadow: '1px 1px 0px rgba(0,0,0,0.1)'
                }}
              >
                🤔 Bạn có muốn chuyển đến trang danh sách repositories không?
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative px-8 py-6">
          <div className="flex gap-4">
            {/* Cancel Button */}
            <button
              onClick={onClose}
              className="relative flex-1 py-3 px-6 font-bold text-lg transition-transform hover:scale-105"
              style={{ color: '#374151' }}
            >
              <canvas
                ref={buttonCanvasRef1}
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              />
              <span className="relative">❌ Hủy</span>
            </button>
            
            {/* Go to Repositories Button */}
            <button
              onClick={onGoToRepositories}
              className="relative flex-1 py-3 px-6 font-bold text-lg text-white transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <canvas
                ref={buttonCanvasRef2}
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              />
              <span className="relative">🚀 Chuyển đến Repositories</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

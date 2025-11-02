import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';
import { CommonFont } from '../Font/CommonFont';
import { CommonIcon } from '../Icon/CommonIcon';

interface WindowPanelProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minimized?: boolean;
  visible?: boolean;
  position?: { x: number; y: number };
  onMinimize?: (minimized: boolean) => void;
  onClose?: () => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
  loading?: boolean;
  zIndex?: number;
  minimizedContent?: React.ReactNode; // Nội dung hiển thị khi minimize
}

export function WindowPanel({
  id,
  title,
  children,
  className = '',
  defaultWidth = 400,
  defaultHeight = 500,
  minimized: controlledMinimized,
  visible = true,
  position: controlledPosition,
  onMinimize,
  onClose,
  onPositionChange,
  loading = false,
  zIndex = 1,
  minimizedContent,
}: WindowPanelProps) {
  const [internalPosition, setInternalPosition] = useState(controlledPosition || { x: 100, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTranslation();

  const position = controlledPosition || internalPosition;
  const minimized = controlledMinimized ?? false;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (containerRef.current) {
      // Fix: Tính offset từ vị trí click đến vị trí panel (position.x/y)
      // Thay vì dùng rect.left/top (có thể bị offset do scroll)
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
      setIsDragging(true);
      e.preventDefault(); // Ngăn chặn selection text khi kéo
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && containerRef.current) {
      // Tính vị trí mới dựa trên vị trí con trỏ trừ đi offset ban đầu
      // Đảm bảo panel di chuyển chính xác theo con trỏ
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Giới hạn vị trí trong viewport (tùy chọn - có thể bỏ nếu muốn kéo ra ngoài)
      const maxX = window.innerWidth - (containerRef.current.offsetWidth || defaultWidth);
      const maxY = window.innerHeight - (containerRef.current.offsetHeight || defaultHeight);
      
      const clampedX = Math.max(0, Math.min(newX, maxX));
      const clampedY = Math.max(0, Math.min(newY, maxY));
      
      if (controlledPosition) {
        onPositionChange?.(id, clampedX, clampedY);
      } else {
        setInternalPosition({ x: clampedX, y: clampedY });
      }
      e.preventDefault();
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const drawCanvas = () => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    if (w === 0 || h === 0) return;
    canvas.width = w;
    canvas.height = h;
    const rc = createRoughCanvas(canvas);
    drawRoughRect(rc, 4, 4, w - 8, h - 8, {
      stroke: '#64748b',
      strokeWidth: 2,
      roughness: 1.5,
    });
  };

  useEffect(() => {
    drawCanvas();
    const timer = setTimeout(drawCanvas, 100);
    return () => clearTimeout(timer);
  }, [position, minimized]);

  if (!visible) return null;

  // Kích thước thực tế khi minimize
  const actualWidth = minimized ? Math.min(300, Math.floor(defaultWidth * 0.6)) : defaultWidth;
  const actualHeight = minimized ? 80 : defaultHeight; // Chiều cao cố định khi minimize

  return (
    <CommonFont
      ref={containerRef}
      className={`absolute bg-white rounded-lg shadow-lg overflow-hidden ${isDragging ? 'cursor-grabbing' : ''} ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${actualWidth}px`,
        height: `${actualHeight}px`,
        transition: isDragging ? 'none' : 'width 0.2s ease, height 0.2s ease',
        zIndex,
      }}
    >
      {/* Header - Draggable */}
      <div
        className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-100 to-slate-50 border-b border-slate-200 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <CommonIcon name="home" size={16} className="text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-800 select-none">{title}</h3>
        </div>
        <div className="flex items-center gap-1">
          {/* Minimize button */}
          {onMinimize && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMinimize(!minimized);
              }}
              className="p-1.5 hover:bg-slate-200 rounded transition-colors"
              title={minimized ? t('panel.expand') : t('panel.minimize')}
            >
              <svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {minimized ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                )}
              </svg>
            </button>
          )}
          {/* Close button */}
          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 hover:bg-red-100 rounded transition-colors"
              title={t('panel.close')}
            >
              <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {/* Content */}
      {minimized ? (
        /* Hiển thị nội dung tối giản khi minimize */
        <div className="px-4 py-2 overflow-hidden" style={{ height: 'calc(100% - 52px)' }}>
          {minimizedContent || (
            <div className="text-xs text-slate-500 truncate">
              {typeof children === 'string' ? children : t('panel.clickToExpand')}
            </div>
          )}
        </div>
      ) : (
        /* Hiển thị đầy đủ khi mở rộng */
        <div className="p-4 overflow-auto" style={{ height: 'calc(100% - 52px)' }}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            children
          )}
        </div>
      )}

      {/* Canvas for hand-drawn border */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%' }}
      />
    </CommonFont>
  );
}

export default WindowPanel;

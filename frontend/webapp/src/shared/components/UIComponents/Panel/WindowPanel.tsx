import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Minus, X } from 'lucide-react';
import CommonPanel from './CommonPanel';

interface WindowPanelProps {
  id: string;
  title?: string;
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
  footer?: React.ReactNode;
  loading?: boolean;
}

export const WindowPanel: React.FC<WindowPanelProps> = ({
  id,
  title,
  children,
  className = '',
  defaultWidth = 400,
  defaultHeight = 500,
  minimized: controlledMinimized,
  visible: controlledVisible = true,
  position: controlledPosition,
  onMinimize,
  onClose,
  onPositionChange,
  footer,
  loading = false,
}) => {
  const [internalMinimized, setInternalMinimized] = useState(false);
  const [internalPosition, setInternalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const minimized = controlledMinimized !== undefined ? controlledMinimized : internalMinimized;
  const position = controlledPosition || internalPosition;
  const visible = controlledVisible;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    
    // Calculate offset from current position (not from rect)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const newPosition = { x: newX, y: newY };
    setInternalPosition(newPosition);
    onPositionChange?.(id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleMinimize = () => {
    const newMinimized = !minimized;
    if (onMinimize) {
      onMinimize(newMinimized);
    } else {
      setInternalMinimized(newMinimized);
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  if (!visible) return null;

  // Minimize giảm 50% cả width và height
  const width = minimized ? Math.floor(defaultWidth / 2) : defaultWidth;
  const height = minimized ? Math.floor(defaultHeight / 2) : defaultHeight;

  return (
    <div
      ref={panelRef}
      className={`absolute ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${width}px`,
        height: `${height}px`,
        cursor: isDragging ? 'grabbing' : 'default',
        transition: 'width 0.2s ease, height 0.2s ease', // Smooth resize
      }}
    >
      <CommonPanel
        title={title}
        headerActions={
          <div className="flex items-center gap-1">
            {/* Drag Handle */}
            <button
              onMouseDown={handleMouseDown}
              className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
              title="Di chuyển"
              type="button"
            >
              <GripVertical className="w-4 h-4 text-gray-500" />
            </button>
            {/* Minimize */}
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-gray-100 rounded"
              title={minimized ? "Mở rộng" : "Thu nhỏ"}
              type="button"
            >
              <Minus className="w-4 h-4 text-gray-500" />
            </button>
            {/* Close */}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-red-100 rounded"
              title="Đóng"
              type="button"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        }
        footer={footer}
        loading={loading}
      >
        <div 
          className="transition-all duration-200"
          style={{ 
            height: '100%',
            overflow: 'auto'
          }}
        >
          {children}
        </div>
      </CommonPanel>
    </div>
  );
};

export default WindowPanel;

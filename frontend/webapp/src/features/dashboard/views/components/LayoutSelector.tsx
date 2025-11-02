import React, { useState } from 'react';
import { Button } from '@shared/components';
import { getAvailableLayouts, getLayoutPreference } from '@shared/lib/panelLayoutManager';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface LayoutSelectorProps {
  onLayoutChange: (layoutName: string) => void;
  onReset: () => void;
}

export function LayoutSelector({ onLayoutChange, onReset }: LayoutSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLayout = getLayoutPreference();
  const availableLayouts = getAvailableLayouts();

  return (
    <div className="flex items-center gap-2">
      {/* Layout Selector Dropdown */}
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          title="Chọn bố cục"
        >
          <CommonIcon name="grid" size={16} color="#475569" />
          <span className="text-sm font-medium text-slate-700">Bố cục</span>
          <CommonIcon name="chevron-down" size={16} color="#94a3b8" />
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-[200px]">
            {availableLayouts.map((layout) => (
              <button
                key={layout.key}
                onClick={() => {
                  onLayoutChange(layout.key);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 hover:bg-slate-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                  currentLayout === layout.key ? 'bg-blue-50 border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="font-medium text-sm text-slate-900">{layout.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{layout.description}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        title="Đặt lại bố cục về mặc định"
      >
        <CommonIcon name="rotate-cw" size={16} color="#475569" />
        <span className="text-sm font-medium text-slate-700">Đặt lại</span>
      </button>
    </div>
  );
}

export default LayoutSelector;

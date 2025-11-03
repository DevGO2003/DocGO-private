import React, { useState } from 'react';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface PanelOption {
  id: string;
  label: string;
  visible: boolean;
}

interface PanelSelectorProps {
  panels: PanelOption[];
  onToggle: (id: string) => void;
}

export const PanelSelector: React.FC<PanelSelectorProps> = ({ panels, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        Quản lý Panel
        <CommonIcon name="chevron-down" size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 rounded-lg border z-20" style={ borderColor: '#e5e7eb' } style={ backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }>
            <div className="p-2">
              {panels.map((panel) => (
                <label
                  key={panel.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={panel.visible}
                    onChange={() => onToggle(panel.id)}
                    className="w-4 h-4 rounded" style={ color: '#4f46e5' }
                  />
                  <span className="text-sm" style={ color: '#374151' }>{panel.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PanelSelector;

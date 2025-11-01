import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@shared/components';

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
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
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
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{panel.label}</span>
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

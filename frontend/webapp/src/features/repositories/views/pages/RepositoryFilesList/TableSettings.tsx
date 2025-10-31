import React from 'react';
import { Dialog } from '@shared/components';
import { Checkbox } from '@shared/components';
import { Button } from '@shared/components';

interface TableColumn {
  key: string;
  label: string;
  visible: boolean;
}

interface TableSettingsProps {
  columns: TableColumn[];
  onColumnsChange: (columns: TableColumn[]) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const TableSettings: React.FC<TableSettingsProps> = ({ columns, onColumnsChange, onClose, isOpen }) => {
  const [localColumns, setLocalColumns] = React.useState(columns);

  React.useEffect(() => {
    setLocalColumns(columns);
  }, [columns]);

  const handleToggleColumn = (key: string) => {
    setLocalColumns(prev => prev.map(col => 
      col.key === key ? { ...col, visible: !col.visible } : col
    ));
  };

  const handleSave = () => {
    onColumnsChange(localColumns);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Table Settings"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        {localColumns.map(col => (
          <div key={col.key} className="flex items-center justify-between">
            <span>{col.label}</span>
            <Checkbox 
              checked={col.visible} 
              onCheckedChange={() => handleToggleColumn(col.key)}
            />
          </div>
        ))}
      </div>
    </Dialog>
  );
};

export default TableSettings;


'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  DocumentTextIcon, 
  EyeIcon, 
  ArrowDownTrayIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import { MainLayout } from '@/components/layout';
import { HeaderPanel } from '@/components/ui';
import { documentAPI } from '@/lib/apis';
import { ApiResponse } from '@/types/api';

interface Contract {
  id: string;
  title: string;
  content: string;
  status: string;
  type: string;
  parties: string[];
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  attachments: string[];
}

interface ContractCardProps {
  contract: Contract;
  onOpenFile: (contract: Contract) => void;
  onPreview: (contract: Contract, event: React.MouseEvent) => void;
  onDownload: (contract: Contract) => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ 
  contract, 
  onOpenFile, 
  onPreview, 
  onDownload 
}) => {
  const [previewPosition, setPreviewPosition] = useState<{ x: number; y: number } | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const handlePreviewMouseEnter = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setShowPreview(true);
    onPreview(contract, event);
  };

  const handlePreviewMouseLeave = () => {
    setShowPreview(false);
    setPreviewPosition(null);
  };

  return (
    <div className="relative">
      {/* Contract Card - 60% width */}
      <div className="w-[60%] bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow duration-200">
        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
              {contract.title}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {contract.id}
            </p>
          </div>
          <div className="flex items-center">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              contract.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : contract.status === 'expired'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {contract.status}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <DocumentIcon className="w-4 h-4 mr-2" />
            <span>{contract.type}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Ngày bắt đầu:</span> {contract.startDate}
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Bên tham gia:</span> {contract.parties.join(', ')}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onOpenFile(contract)}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
          >
            <DocumentTextIcon className="w-4 h-4 mr-1" />
            Mở tệp
          </button>
          
          <button
            onMouseEnter={handlePreviewMouseEnter}
            onMouseLeave={handlePreviewMouseLeave}
            className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
          >
            <EyeIcon className="w-4 h-4 mr-1" />
            Xem thử
          </button>
          
          <button
            onClick={() => onDownload(contract)}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
            Tải về
          </button>
        </div>
      </div>

      {/* Preview Popup */}
      {showPreview && previewPosition && (
        <div
          ref={previewRef}
          className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm"
          style={{
            left: `${previewPosition.x}px`,
            top: `${previewPosition.y}px`,
            transform: 'translateX(-50%) translateY(-100%)'
          }}
        >
          <div className="text-sm">
            <div className="font-medium text-gray-900 mb-2">Xem trước</div>
            <div className="text-gray-600">
              <p><strong>Tên:</strong> {contract.title}</p>
              <p><strong>ID:</strong> {contract.id}</p>
              <p><strong>Loại:</strong> {contract.type}</p>
              <p><strong>Trạng thái:</strong> {contract.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ContractsPage() {
  const { t } = useTranslation();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getAllContracts();
      
      if (response.data && response.data.statusCode === 200 && response.data.data) {
        setContracts(response.data.data as unknown as Contract[]);
      } else {
        setError('Không thể tải danh sách hợp đồng');
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
      setError('Có lỗi xảy ra khi tải danh sách hợp đồng');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = (contract: Contract) => {
    if (contract.attachments && contract.attachments.length > 0) {
      window.open(contract.attachments[0], '_blank');
    } else {
      alert('Không có file để mở');
    }
  };

  const handlePreview = (contract: Contract, event: React.MouseEvent) => {
    // Preview logic sẽ được xử lý trong component
    console.log('Preview contract:', contract.title);
  };

  const handleDownload = async (contract: Contract) => {
    try {
      if (contract.attachments && contract.attachments.length > 0) {
        const response = await fetch(contract.attachments[0]);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${contract.title}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Không có file để tải xuống');
      }
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Có lỗi xảy ra khi tải file');
    }
  };

  if (loading) {
  return (
    <MainLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    </MainLayout>
  );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <HeaderPanel
          title={t('navigation.contracts')}
          description="Quản lý và theo dõi các hợp đồng"
        />

        {/* Contracts Grid */}
        <div className="space-y-4">
          {contracts.length === 0 ? (
            <div className="text-center py-12">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có hợp đồng nào
              </h3>
              <p className="text-gray-600">
                Bắt đầu tạo hợp đồng đầu tiên của bạn
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {contracts.map((contract) => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onOpenFile={handleOpenFile}
                  onPreview={handlePreview}
                  onDownload={handleDownload}
                />
              ))}
        </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

import React, { useState } from 'react';
import UploadSuccessNotification from './UploadSuccessNotification';
import UploadSuccessToast from './UploadSuccessToast';

const UploadSuccessDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleViewFile = () => {
    console.log('Viewing file...');
    alert('Chức năng xem tệp');
  };

  const handleDownloadFile = () => {
    console.log('Downloading file...');
    alert('Chức năng tải xuống');
  };

  const handleUploadMore = () => {
    console.log('Upload more files...');
    alert('Chức năng tải thêm');
  };

  const handleViewDetails = () => {
    console.log('Viewing details...');
    alert('Chức năng xem chi tiết');
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Demo Upload Success Notification</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Thông báo cũ:</h2>
          <p className="text-gray-600 italic">
            "Tải lên thành công. Bạn có muốn thực hiện thao tác gì thêm không?"
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Thông báo mới:</h2>
          <p className="text-gray-700">
            ✅ Tải lên thành công<br/>
            report_2025.pdf đã được lưu vào hệ thống.<br/>
            [Xem chi tiết] [Tải thêm]
          </p>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hiển thị Modal
          </button>
          
          <button
            onClick={() => setShowToast(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Hiển thị Toast
          </button>
        </div>
      </div>

      {/* Modal Notification */}
      {showModal && (
        <UploadSuccessNotification
          fileName="report_2025.pdf"
          fileSize="2.5 MB"
          fileType="pdf"
          onViewFile={handleViewFile}
          onDownloadFile={handleDownloadFile}
          onUploadMore={handleUploadMore}
          onViewDetails={handleViewDetails}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Toast Notification */}
      {showToast && (
        <UploadSuccessToast
          fileName="contract_template.docx"
          fileSize="1.2 MB"
          isVisible={showToast}
          onClose={() => setShowToast(false)}
          onViewFile={handleViewFile}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

export default UploadSuccessDemo;


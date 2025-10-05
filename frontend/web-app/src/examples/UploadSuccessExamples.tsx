import React from 'react';
import UploadSuccessManager from '../components/UploadSuccessManager';
import { useUploadSuccess } from '../hooks/useUploadSuccess';

// Example 1: Sử dụng với UploadSuccessManager (Recommended)
const ExampleWithManager: React.FC = () => {
  const handleViewFile = (fileName: string) => {
    console.log('Viewing file:', fileName);
    // Navigate to file viewer or open file
  };

  const handleDownloadFile = (fileName: string) => {
    console.log('Downloading file:', fileName);
    // Trigger download
  };

  const handleUploadMore = () => {
    console.log('Upload more files');
    // Open file picker or upload dialog
  };

  const handleViewDetails = (fileName: string) => {
    console.log('Viewing details for:', fileName);
    // Navigate to file details page
  };

  return (
    <UploadSuccessManager
      variant="toast" // hoặc "modal"
      onViewFile={handleViewFile}
      onDownloadFile={handleDownloadFile}
      onUploadMore={handleUploadMore}
      onViewDetails={handleViewDetails}
    >
      <div>
        {/* Your app content */}
        <h1>My App</h1>
        {/* UploadSuccessManager sẽ tự động hiển thị notification khi cần */}
      </div>
    </UploadSuccessManager>
  );
};

// Example 2: Sử dụng hook trực tiếp
const ExampleWithHook: React.FC = () => {
  const { showUploadSuccess } = useUploadSuccess();

  const handleFileUpload = async (file: File) => {
    try {
      // Upload file logic here
      const response = await uploadFile(file);
      
      // Show success notification
      showUploadSuccess({
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: getFileType(file.name)
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
    </div>
  );
};

// Example 3: Sử dụng component trực tiếp
const ExampleDirectUsage: React.FC = () => {
  const [showNotification, setShowNotification] = React.useState(false);

  return (
    <div>
      <button onClick={() => setShowNotification(true)}>
        Upload File
      </button>

      {showNotification && (
        <UploadSuccessNotification
          fileName="report_2025.pdf"
          fileSize="2.5 MB"
          fileType="pdf"
          onViewFile={() => console.log('View file')}
          onDownloadFile={() => console.log('Download file')}
          onUploadMore={() => console.log('Upload more')}
          onViewDetails={() => console.log('View details')}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

// Helper functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileType = (fileName: string): string => {
  return fileName.split('.').pop()?.toLowerCase() || '';
};

const uploadFile = async (file: File): Promise<any> => {
  // Mock upload function
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, fileName: file.name });
    }, 1000);
  });
};

export { ExampleWithManager, ExampleWithHook, ExampleDirectUsage };

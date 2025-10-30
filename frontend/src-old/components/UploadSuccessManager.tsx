import React from 'react';
import UploadSuccessNotification from './UploadSuccessNotification';
import UploadSuccessToast from './UploadSuccessToast';
import { useUploadSuccess } from '../hooks/useUploadSuccess';

interface UploadSuccessManagerProps {
  children: React.ReactNode;
  variant?: 'modal' | 'toast';
  onViewFile?: (fileName: string) => void;
  onDownloadFile?: (fileName: string) => void;
  onUploadMore?: () => void;
  onViewDetails?: (fileName: string) => void;
}

const UploadSuccessManager: React.FC<UploadSuccessManagerProps> = ({
  children,
  variant = 'toast',
  onViewFile,
  onDownloadFile,
  onUploadMore,
  onViewDetails
}) => {
  const { isVisible, uploadData, hideUploadSuccess } = useUploadSuccess();

  const handleViewFile = () => {
    if (uploadData?.fileName && onViewFile) {
      onViewFile(uploadData.fileName);
    }
    hideUploadSuccess();
  };

  const handleDownloadFile = () => {
    if (uploadData?.fileName && onDownloadFile) {
      onDownloadFile(uploadData.fileName);
    }
    hideUploadSuccess();
  };

  const handleViewDetails = () => {
    if (uploadData?.fileName && onViewDetails) {
      onViewDetails(uploadData.fileName);
    }
    hideUploadSuccess();
  };

  const handleUploadMore = () => {
    if (onUploadMore) {
      onUploadMore();
    }
    hideUploadSuccess();
  };

  return (
    <>
      {children}
      
      {variant === 'modal' && isVisible && uploadData && (
        <UploadSuccessNotification
          fileName={uploadData.fileName}
          fileSize={uploadData.fileSize}
          fileType={uploadData.fileType}
          onViewFile={onViewFile ? handleViewFile : undefined}
          onDownloadFile={onDownloadFile ? handleDownloadFile : undefined}
          onUploadMore={onUploadMore ? handleUploadMore : undefined}
          onViewDetails={onViewDetails ? handleViewDetails : undefined}
          onClose={hideUploadSuccess}
        />
      )}

      {variant === 'toast' && isVisible && uploadData && (
        <UploadSuccessToast
          fileName={uploadData.fileName}
          fileSize={uploadData.fileSize}
          isVisible={isVisible}
          onClose={hideUploadSuccess}
          onViewFile={onViewFile ? handleViewFile : undefined}
          onViewDetails={onViewDetails ? handleViewDetails : undefined}
        />
      )}
    </>
  );
};

export default UploadSuccessManager;


import { useState, useCallback } from 'react';

interface UploadSuccessData {
  fileName: string;
  fileSize?: string;
  fileType?: string;
}

interface UseUploadSuccessReturn {
  isVisible: boolean;
  uploadData: UploadSuccessData | null;
  showUploadSuccess: (data: UploadSuccessData) => void;
  hideUploadSuccess: () => void;
}

export const useUploadSuccess = (): UseUploadSuccessReturn => {
  const [isVisible, setIsVisible] = useState(false);
  const [uploadData, setUploadData] = useState<UploadSuccessData | null>(null);

  const showUploadSuccess = useCallback((data: UploadSuccessData) => {
    setUploadData(data);
    setIsVisible(true);
  }, []);

  const hideUploadSuccess = useCallback(() => {
    setIsVisible(false);
    setUploadData(null);
  }, []);

  return {
    isVisible,
    uploadData,
    showUploadSuccess,
    hideUploadSuccess
  };
};

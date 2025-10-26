import { useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Upload, File, AlertCircle, X, CheckCircle } from 'lucide-react';
import { Dialog, Button, Input } from '@shared/components';
import { useUploadContract } from '@features/contract';
import type { RootState } from '@store';

interface UploadContractDialogProps {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  repositoryId?: string;
  onSuccess?: () => void;
}

export const UploadContractDialog = ({
  open,
  onClose,
  organizationId,
  repositoryId,
  onSuccess,
}: UploadContractDialogProps) => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  const { mutate: uploadContract, isPending } = useUploadContract();

  const handleFileSelect = (file: File) => {
    // Validate file
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      setErrors({ file: 'File size must be less than 50MB' });
      return;
    }

    // Accept PDF, DOC, DOCX
    const acceptedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!acceptedTypes.includes(file.type)) {
      setErrors({ file: 'Only PDF and Word documents are accepted' });
      return;
    }

    setSelectedFile(file);
    setErrors({});
    
    // Auto-fill title from filename
    if (!title) {
      const fileName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      setTitle(fileName);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedFile) {
      newErrors.file = 'Please select a file';
    }

    if (!title.trim()) {
      newErrors.title = 'Contract title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (description && description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    if (!currentUser?.id) {
      setErrors({ submit: 'User not authenticated. Please login again.' });
      return;
    }

    if (!selectedFile) return;

    uploadContract(
      {
        file: selectedFile,
        title,
        description,
        organizationId,
        repositoryId,
      },
      {
        onSuccess: () => {
          console.log('✅ Contract uploaded successfully');
          handleClose();
          onSuccess?.();
        },
        onError: (error: any) => {
          console.error('❌ Failed to upload contract:', error);
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            'Failed to upload contract';
          setErrors({ submit: errorMessage });
        },
      }
    );
  };

  const handleClose = () => {
    setSelectedFile(null);
    setTitle('');
    setDescription('');
    setErrors({});
    setDragActive(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Upload Contract"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !selectedFile} animated>
            {isPending ? 'Uploading...' : 'Upload Contract'}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Icon Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Upload Contract Document</h3>
            <p className="text-sm text-gray-600">
              Upload PDF or Word documents up to 50MB
            </p>
          </div>
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : selectedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-blue-400'
          } ${errors.file ? 'border-red-300' : ''}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {!selectedFile ? (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2">
                Drag and drop your contract here, or{' '}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  browse
                </button>
              </p>
              <p className="text-sm text-gray-500">
                PDF, DOC, DOCX up to 50MB
              </p>
            </>
          ) : (
            <div className="flex items-center justify-between p-4 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
          )}
        </div>
        {errors.file && <p className="text-sm text-red-600 -mt-4">{errors.file}</p>}

        {/* Contract Title */}
        <div className="space-y-2">
          <label htmlFor="contract-title" className="block text-sm font-medium text-gray-700">
            Contract Title <span className="text-red-500">*</span>
          </label>
          <Input
            id="contract-title"
            type="text"
            placeholder="e.g., Sales Agreement 2024"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
            }}
            className={errors.title ? 'border-red-300' : ''}
            disabled={isPending}
          />
          {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="contract-desc" className="block text-sm font-medium text-gray-700">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="contract-desc"
            rows={3}
            placeholder="Brief description of the contract..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: '' }));
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={isPending}
          />
          {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
          <p className="text-xs text-gray-500">
            {description?.length || 0} / 1000 characters
          </p>
        </div>

        {/* Info Note */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> After uploading, the contract will be available for review and processing
            within the organization.
          </p>
        </div>
      </div>
    </Dialog>
  );
};

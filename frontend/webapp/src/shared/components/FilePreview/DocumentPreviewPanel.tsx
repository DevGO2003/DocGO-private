import React, { useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip, Divider } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@store/index';
import { closePreview } from '@store/slices/previewPanelSlice';
import { FilePreviewer } from './FilePreviewer';
import { downloadFile } from '@features/repositories/services/fileDetailApi';

export const DocumentPreviewPanel: React.FC = () => {
  const dispatch = useDispatch();
  const { isOpen, fileId, fileName, fileType } = useSelector(
    (state: RootState) => state.previewPanel
  );

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        dispatch(closePreview());
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, dispatch]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDownload = async () => {
    if (!fileId || !fileName) return;

    try {
      const response = await downloadFile(fileId);
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleOpenInNewTab = async () => {
    if (!fileId) return;

    try {
      const response = await downloadFile(fileId);
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Note: URL will be revoked after some time, but that's okay for viewing
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  };

  const handleBackdropClick = () => {
    dispatch(closePreview());
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <Box
        onClick={handleBackdropClick}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1300,
          animation: 'fadeIn 0.3s ease-in-out',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
        }}
      />

      {/* Side Panel */}
      <Box
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: {
            xs: '100%',
            sm: '80%',
            md: '60%',
            lg: '50%',
          },
          backgroundColor: 'white',
          zIndex: 1301,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          animation: 'slideIn 0.3s ease-in-out',
          '@keyframes slideIn': {
            from: { transform: 'translateX(100%)' },
            to: { transform: 'translateX(0)' },
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid #e0e0e0',
            backgroundColor: '#f5f5f5',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              fontSize: '16px',
              flex: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              mr: 2,
            }}
          >
            {fileName}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Tải xuống">
              <IconButton
                size="small"
                onClick={handleDownload}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Mở trong tab mới">
              <IconButton
                size="small"
                onClick={handleOpenInNewTab}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

            <Tooltip title="Đóng (ESC)">
              <IconButton
                size="small"
                onClick={() => dispatch(closePreview())}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                  },
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Content */}
        <Box
          sx={{
            flex: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {fileId && fileName && (
            <FilePreviewer
              fileId={fileId}
              fileName={fileName}
              fileType={fileType || ''}
            />
          )}
        </Box>
      </Box>
    </>
  );
};













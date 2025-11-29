import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { downloadFile } from '@features/repositories/services/fileDetailApi';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface FilePreviewerProps {
  fileId: string;
  fileName: string;
  fileType: string;
}

type FileCategory = 'pdf' | 'image' | 'docx' | 'text' | 'unknown';

const getFileCategory = (fileName: string): FileCategory => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
  if (['docx', 'doc'].includes(ext)) return 'docx';
  if (['txt', 'md', 'json', 'xml', 'csv', 'log'].includes(ext)) return 'text';
  return 'unknown';
};

export const FilePreviewer: React.FC<FilePreviewerProps> = ({ fileId, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  const category = getFileCategory(fileName);

  useEffect(() => {
    let objectUrl: string | null = null;

    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Download file as blob
        const response = await downloadFile(fileId);
        const blob = new Blob([response.data]);
        objectUrl = URL.createObjectURL(blob);

        if (category === 'pdf') {
          await renderPDF(blob);
        } else if (category === 'image') {
          setFileUrl(objectUrl);
        } else if (category === 'docx') {
          await renderDocx(blob);
        } else if (category === 'text') {
          await renderText(blob);
        } else {
          setError('Định dạng file không được hỗ trợ xem trước');
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error loading file:', err);
        setError(err.message || 'Không thể tải file');
        setLoading(false);
      }
    };

    loadFile();

    // Cleanup
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId, fileName, category]);

  const renderPDF = async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageImages: string[] = [];

      // Render first 10 pages (for performance)
      const maxPages = Math.min(pdf.numPages, 10);

      for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        pageImages.push(canvas.toDataURL());
      }

      setPdfPages(pageImages);
    } catch (err) {
      throw new Error('Không thể render PDF');
    }
  };

  const renderDocx = async (blob: Blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxHtml(result.value);
    } catch (err) {
      throw new Error('Không thể render DOCX');
    }
  };

  const renderText = async (blob: Blob) => {
    try {
      const text = await blob.text();
      setTextContent(text);
    } catch (err) {
      throw new Error('Không thể đọc file text');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          Đang tải file...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  // Render based on file category
  if (category === 'pdf' && pdfPages.length > 0) {
    return (
      <Box
        sx={{
          height: '100%',
          overflowY: 'auto',
          p: 2,
          backgroundColor: '#525659',
        }}
      >
        {pdfPages.map((pageUrl, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
              backgroundColor: 'white',
              p: 1,
              borderRadius: 1,
            }}
          >
            <img
              src={pageUrl}
              alt={`Page ${index + 1}`}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
        ))}
        {pdfPages.length >= 10 && (
          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block', mt: 2 }}>
            Chỉ hiển thị 10 trang đầu tiên
          </Typography>
        )}
      </Box>
    );
  }

  if (category === 'image' && fileUrl) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 2,
          backgroundColor: '#f5f5f5',
        }}
      >
        <img
          src={fileUrl}
          alt={fileName}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      </Box>
    );
  }

  if (category === 'docx' && docxHtml) {
    return (
      <Box
        sx={{
          height: '100%',
          overflowY: 'auto',
          p: 3,
          backgroundColor: 'white',
          '& img': {
            maxWidth: '100%',
            height: 'auto',
          },
        }}
        dangerouslySetInnerHTML={{ __html: docxHtml }}
      />
    );
  }

  if (category === 'text' && textContent) {
    return (
      <Box
        sx={{
          height: '100%',
          overflowY: 'auto',
          p: 3,
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          fontFamily: 'monospace',
          fontSize: '14px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {textContent}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info">
        Định dạng file không được hỗ trợ xem trước. Vui lòng tải xuống để xem.
      </Alert>
    </Box>
  );
};













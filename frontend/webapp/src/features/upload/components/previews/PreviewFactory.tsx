import React from 'react'
import PDFPreview from './PDFPreview'
import ImagePreview from './ImagePreview'
import DocumentPreview from './DocumentPreview'
import ExcelPreview from './ExcelPreview'
import AudioPreview from './AudioPreview'
import VideoPreview from './VideoPreview'
import HTMLPreview from './HTMLPreview'
import MarkdownPreview from './MarkdownPreview'
import DefaultPreview from './DefaultPreview'
import TextPreview from './TextPreview'
import DocxPreview from './DocxPreview'

export type PreviewType = 'pdf' | 'image' | 'document' | 'excel' | 'audio' | 'video' | 'html' | 'markdown' | 'default' | 'text' | 'docx'

/**
 * Danh sách các loại file được hỗ trợ preview:
 * 
 * 📄 **Tài liệu**:
 *   - PDF (.pdf)
 *   - Word (.docx, .doc)
 *   - Text (.txt)
 *   - Markdown (.md, .markdown)
 *   - HTML (.html, .htm)
 * 
 * 🖼️ **Hình ảnh**:
 *   - JPEG (.jpg, .jpeg)
 *   - PNG (.png)
 *   - GIF (.gif)
 *   - WebP (.webp)
 *   - SVG (.svg)
 *   - BMP (.bmp)
 *   - TIFF (.tiff, .tif)
 *   - ICO (.ico)
 * 
 * 📊 **Bảng tính**:
 *   - Excel (.xlsx, .xls)
 *   - CSV (.csv)
 * 
 * 🎵 **Audio**:
 *   - MP3 (.mp3)
 *   - WAV (.wav)
 *   - OGG (.ogg)
 *   - M4A (.m4a)
 *   - AAC (.aac)
 *   - FLAC (.flac)
 * 
 * 🎬 **Video**:
 *   - MP4 (.mp4)
 *   - WebM (.webm)
 *   - MKV (.mkv)
 *   - AVI (.avi)
 *   - MOV (.mov)
 *   - FLV (.flv)
 *   - WMV (.wmv)
 *   - 3GP (.3gp)
 */

interface PreviewFactoryProps {
  file: File
}

// Factory function to determine preview type based on file
const getPreviewType = (file: File): PreviewType => {
  const mimeType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()
  const ext = fileName.split('.').pop() || ''

  // PDF
  if (mimeType === 'application/pdf' || ext === 'pdf') {
    return 'pdf'
  }

  // Images
  if (mimeType.startsWith('image/')) {
    return 'image'
  }

  // Documents (DOCX, TXT, DOC)
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    mimeType === 'text/plain' ||
    ext === 'docx' ||
    ext === 'doc' ||
    ext === 'txt'
  ) {
    if (ext === 'docx') {
      return 'docx'
    } else if (ext === 'txt') {
      return 'text'
    } else {
      return 'document'
    }
  }

  // Excel (XLSX, XLS, CSV)
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel' ||
    mimeType === 'text/csv' ||
    ext === 'xlsx' ||
    ext === 'xls' ||
    ext === 'csv'
  ) {
    return 'excel'
  }

  // Audio
  if (mimeType.startsWith('audio/')) {
    return 'audio'
  }

  // Video
  if (mimeType.startsWith('video/')) {
    return 'video'
  }

  // HTML
  if (
    mimeType === 'text/html' ||
    ext === 'html' ||
    ext === 'htm'
  ) {
    return 'html'
  }

  // Markdown
  if (
    mimeType === 'text/markdown' ||
    mimeType === 'text/x-markdown' ||
    ext === 'md' ||
    ext === 'markdown'
  ) {
    return 'markdown'
  }

  // Default
  return 'default'
}

// Factory component
export default function PreviewFactory({ file }: PreviewFactoryProps) {
  const previewType = getPreviewType(file)

  const previewComponents: Record<PreviewType, React.ReactNode> = {
    pdf: <PDFPreview file={file} />,
    image: <ImagePreview file={file} />,
    document: <DocumentPreview file={file} />,
    excel: <ExcelPreview file={file} />,
    audio: <AudioPreview file={file} />,
    video: <VideoPreview file={file} />,
    html: <HTMLPreview file={file} />,
    markdown: <MarkdownPreview file={file} />,
    default: <DefaultPreview file={file} />,
    text: <TextPreview file={file} />,
    docx: <DocxPreview file={file} />,
  }

  return previewComponents[previewType]
}

// Export helper function for testing
export { getPreviewType }

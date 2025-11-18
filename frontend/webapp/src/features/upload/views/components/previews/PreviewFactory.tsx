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
import DocxDebugPreview from './DocxDebugPreview'

export type PreviewType = 'pdf' | 'image' | 'document' | 'excel' | 'audio' | 'video' | 'html' | 'markdown' | 'default' | 'text' | 'docx'

/**
 * Danh sách các loại file được hỗ trợ preview:
 * 
 * 📄 **Tài liệu**:
 *   - PDF (.pdf)
 *   - Word (.docx, .doc)
 *   - OpenDocument (.odt)
 *   - Rich Text (.rtf)
 *   - Text (.txt)
 *   - Markdown (.md, .markdown, .rst)
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
 *   - CSV (.csv, .tsv)
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
 * 
 * 💻 **Code & Config Files**:
 *   - JavaScript (.js, .jsx, .json, .jsonc)
 *   - TypeScript (.ts, .tsx)
 *   - Python (.py, .ipynb)
 *   - Java (.java)
 *   - C/C++ (.c, .cpp, .h)
 *   - Go (.go)
 *   - Ruby (.rb)
 *   - PHP (.php)
 *   - SQL (.sql)
 *   - Shell (.sh, .bash, .ps1, .bat, .cmd)
 *   - CSS (.css)
 *   - Vue (.vue)
 *   - GraphQL (.graphql, .gql)
 *   - Config (.xml, .yaml, .yml, .ini, .env, .log, .cfg, .conf, .toml)
 *   - Build files (.makefile, .dockerfile, .gitignore, .gitattributes)
 *   - Package files (.package.json, .composer.json, .pom.xml, .requirements.txt, .manifest.json)
 *   - Linting (.eslintrc, .prettierrc, .babelrc)
 *   - Plist (.plist)
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

  // HTML (check before text extensions)
  if (
    mimeType === 'text/html' ||
    ext === 'html' ||
    ext === 'htm'
  ) {
    return 'html'
  }

  // Markdown (check before text extensions)
  if (
    mimeType === 'text/markdown' ||
    mimeType === 'text/x-markdown' ||
    ext === 'md' ||
    ext === 'markdown'
  ) {
    return 'markdown'
  }

  // Text-based files - use TextPreview
  const textExtensions = [
    'txt', 'csv', 'tsv', 'json', 'xml', 'yaml', 'yml', 'ini', 'env', 'log', 'cfg', 'conf',
    'rst', 'js', 'ts', 'css', 'py', 'java', 'cpp', 'c', 'h', 'sql',
    'sh', 'bash', 'ps1', 'bat', 'cmd', 'jsonc', 'vue', 'jsx', 'tsx', 'go', 'rb', 'php',
    'toml', 'ipynb', 'plist', 'graphql', 'gql', 'makefile', 'dockerfile', 'gitignore',
    'gitattributes', 'eslintrc', 'prettierrc', 'babelrc', 'requirements.txt', 'manifest.json',
    'package.json', 'composer.json', 'pom.xml'
  ]

  if (textExtensions.includes(ext) || mimeType.startsWith('text/')) {
    return 'text'
  }

  // Documents (DOCX, DOC, ODT, RTF)
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.oasis.opendocument.text' ||
    mimeType === 'application/rtf' ||
    ext === 'docx' ||
    ext === 'doc' ||
    ext === 'odt' ||
    ext === 'rtf'
  ) {
    if (ext === 'docx') {
      return 'docx'
    } else {
      return 'document'
    }
  }

  // Excel (XLSX, XLS)
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    mimeType === 'application/vnd.ms-excel' ||
    ext === 'xlsx' ||
    ext === 'xls'
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

  // Default
  return 'default'
}

// Factory component
export default function PreviewFactory({ file }: PreviewFactoryProps) {
  const previewType = getPreviewType(file)

  const previewComponents: Record<PreviewType, React.ReactNode> = {
    pdf: <PDFPreview key={file.name} file={file} />,
    image: <ImagePreview key={file.name} file={file} />,
    document: <DocumentPreview key={file.name} file={file} />,
    excel: <ExcelPreview key={file.name} file={file} />,
    audio: <AudioPreview key={file.name} file={file} />,
    video: <VideoPreview key={file.name} file={file} />,
    html: <HTMLPreview key={file.name} file={file} />,
    markdown: <MarkdownPreview key={file.name} file={file} />,
    default: <DefaultPreview key={file.name} file={file} />,
    text: <TextPreview key={file.name} file={file} />,
    docx: <DocxPreview key={file.name} file={file} />,
  }

  return previewComponents[previewType]
}

// Export helper function for testing
export { getPreviewType }

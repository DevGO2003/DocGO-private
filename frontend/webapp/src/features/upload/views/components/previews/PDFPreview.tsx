import { useState, useEffect, useRef } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

// Set worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface PDFPreviewProps {
  file: File
}

export default function PDFPreview({ file }: PDFPreviewProps) {
  const [url, setUrl] = useState<string>('')
  const [containerHeight, setContainerHeight] = useState<number>(0)
  const [numPages, setNumPages] = useState<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!file) {
      // Reset when file is deselected
      setUrl('')
      setNumPages(0)
      setContainerHeight(0)
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string
      setUrl(dataUrl)
      
      // Get PDF page count
      try {
        const pdf = await pdfjsLib.getDocument(dataUrl).promise
        setNumPages(pdf.numPages)
      } catch (error) {
        console.error('Error reading PDF:', error)
      }
    }
    reader.readAsDataURL(file)
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [file])

  useEffect(() => {
    const calculateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        // Min height = container height * 3 + (pages * 400px per page)
        const pageHeight = numPages > 0 ? numPages * 800 : 0
        setContainerHeight(rect.height * 3 + pageHeight)
      }
    }

    calculateHeight()
    window.addEventListener('resize', calculateHeight)
    return () => window.removeEventListener('resize', calculateHeight)
  }, [numPages])

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6', width: '100%', height: '100%' }}>
      {url ? (
        <iframe
          src={url}
          style={{ flex: 1, border: 'none', width: '100%', minHeight: containerHeight > 0 ? containerHeight : '500px' }}
          title="PDF Preview"
        />
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: containerHeight > 0 ? containerHeight : '500px' }}>
          <div style={{ textAlign: 'center' }}>
            <svg style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải PDF...</p>
          </div>
        </div>
      )}
    </div>
  )
}

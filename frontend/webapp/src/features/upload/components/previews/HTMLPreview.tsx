import React, { useState, useEffect, useRef } from 'react'

interface HTMLPreviewProps {
  file: File
}

interface HTMLStats {
  wordCount: number
  imageCount: number
  linkCount: number
  headingCount: number
}

export default function HTMLPreview({ file }: HTMLPreviewProps) {
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [minHeight, setMinHeight] = useState(500)
  const containerRef = useRef<HTMLDivElement>(null)

  const calculateStats = (html: string): HTMLStats => {
    try {
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')
      
      const wordCount = doc.body.innerText.split(/\s+/).filter(w => w.length > 0).length
      const imageCount = doc.querySelectorAll('img').length
      const linkCount = doc.querySelectorAll('a').length
      const headingCount = doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length
      
      return { wordCount, imageCount, linkCount, headingCount }
    } catch (error) {
      console.error('Error parsing HTML:', error)
      return { wordCount: 0, imageCount: 0, linkCount: 0, headingCount: 0 }
    }
  }

  useEffect(() => {
    if (!file) {
      // Reset when file is deselected
      setHtmlContent('')
      setMinHeight(500)
      setLoading(false)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setHtmlContent(content)
      
      // Calculate min height based on content
      const stats = calculateStats(content)
      // Base 500px + (wordCount / 100) * 50px + (images * 200px) + (links * 30px)
      const calculatedHeight = 500 + (stats.wordCount / 100) * 50 + (stats.imageCount * 200) + (stats.linkCount * 30)
      setMinHeight(Math.max(calculatedHeight, 500))
      
      setLoading(false)
    }
    reader.onerror = () => {
      setHtmlContent('Không thể đọc file HTML')
      setLoading(false)
    }
    reader.readAsText(file)
  }, [file])

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', minHeight: `${minHeight}px` }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1s linear infinite', borderRadius: '50%', height: '32px', width: '32px', borderBottom: '2px solid #2563eb', marginBottom: '8px' }}></div>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Đang tải HTML...</p>
          </div>
        </div>
      ) : (
        <iframe
          srcDoc={htmlContent}
          style={{ flex: 1, border: 'none', width: '100%', minHeight: `${minHeight}px` }}
          title="HTML Preview"
          sandbox="allow-same-origin allow-scripts"
        />
      )}
    </div>
  )
}

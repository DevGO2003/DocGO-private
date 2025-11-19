import { useState, useEffect, useRef } from 'react'
import './DocxPreview.css'

// A4 page dimensions (slightly wider for better visibility)
const A4_WIDTH_CM = 23.5 // Wider than standard A4 for better readability
const A4_HEIGHT_CM = 29.7
const A4_HEIGHT_PX = 1122 // 29.7cm at 96 DPI (29.7 * 37.795 ≈ 1122)

// Global CSS for docx-preview with page styling
const docxStyle = `
.docx-content {
  font-family: 'Times New Roman', serif;
  line-height: 1.5;
  color: #000;
  max-width: 100% !important;
  overflow-wrap: break-word;
}
.docx-content p {
  margin: 12px 0;
  max-width: 100%;
}
.docx-content table {
  border-collapse: collapse;
  width: 100% !important;
  max-width: 100%;
  table-layout: fixed;
}
.docx-content td, .docx-content th {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: left;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* Page styling - A4 size pages */
.docx-wrapper > section,
.docx-wrapper section,
.docx-wrapper .docx-page {
  background: white !important;
  box-shadow: none !important;
  margin: 0 !important;
  padding: 0.5cm !important;
  width: 100% !important;
  min-height: 100% !important;
  position: relative !important;
  page-break-after: always !important;
  overflow: visible !important;
  display: block !important;
  box-sizing: border-box !important;
}

/* Ensure only one page visible at a time */
.docx-wrapper > section.hidden,
.docx-wrapper section.hidden {
  display: none !important;
}

/* Smooth page transitions */
.docx-wrapper > section,
.docx-wrapper section {
  transition: opacity 0.2s ease-in-out;
}

/* Container for pages */
.docx-wrapper {
  display: block;
  width: 23.5cm;
  height: 29.7cm;
  max-height: 29.7cm;
  overflow-y: hidden;
  overflow-x: visible;
  position: relative;
  background: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  border: 0.15cm solid #4B5563;
  box-sizing: border-box;
}

/* Force all wrapper content to fit */
.docx-wrapper > * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Scroll-based pagination container */
.docx-scroll-content {
  position: relative;
  padding: 0.5cm;
  min-height: 29.7cm;
  width: 100%;
  box-sizing: border-box;
  transform-origin: top center;
  will-change: transform;
}

/* Force docx content to fit width */
.docx-scroll-content * {
  max-width: 100%;
  box-sizing: border-box;
  word-wrap: break-word;
}

/* Page break visual markers */
.page-break-marker {
  border-top: 2px dashed #cbd5e0;
  margin: 20px 0;
}
`

interface DocxPreviewProps {
  file: File
}

export default function DocxPreview({ file }: DocxPreviewProps) {
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [renderMode, setRenderMode] = useState<'mammoth' | 'docx-preview'>(
    'mammoth'
  )
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  // Debug: Log state changes
  useEffect(() => {
    console.log('[DocxPreview] State updated - totalPages:', totalPages, 'currentPage:', currentPage)
  }, [totalPages, currentPage])

  useEffect(() => {
    // Inject CSS styles for docx-preview
    const styleElement = document.createElement('style')
    styleElement.textContent = docxStyle
    document.head.appendChild(styleElement)

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement)
      }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadDocx = async () => {
      try {
        console.log('[DocxPreview] Starting DOCX preview for:', file.name, file.type, 'Size:', file.size)
        const extension = file.name.split('.').pop()?.toLowerCase()
        
        if (extension === 'doc') {
          setErrorMessage('Định dạng .doc chưa được hỗ trợ xem trực tiếp. Vui lòng chuyển sang .docx.')
          return
        }

        // Basic file validation
        if (file.size === 0) {
          throw new Error('File is empty')
        }

        if (file.size > 50 * 1024 * 1024) { // 50MB limit
          throw new Error('File too large (>50MB)')
        }

        // Check if file looks like a DOCX (ZIP signature)
        const firstBytes = new Uint8Array(await file.slice(0, 8).arrayBuffer())
        const isZipLike = firstBytes[0] === 0x50 && firstBytes[1] === 0x4B // "PK" ZIP signature
        
        console.log('[DocxPreview] File signature check:', {
          hex: Array.from(firstBytes).map(b => b.toString(16).padStart(2, '0')).join(' '),
          ascii: Array.from(firstBytes).map(b => String.fromCharCode(b)).join(''),
          isZip: isZipLike
        })
        
        if (!isZipLike) {
          // Check if it's a different format
          const signature = Array.from(firstBytes.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('')
          let formatGuess = 'unknown'
          
          if (signature.startsWith('d0cf11e0')) {
            formatGuess = 'Old MS Office format (.doc/.xls)'
          } else if (signature.startsWith('25504446')) {
            formatGuess = 'PDF file'
          } else if (signature.startsWith('89504e47')) {
            formatGuess = 'PNG image'
          }
          
          throw new Error(`File không phải DOCX hợp lệ. Có thể là: ${formatGuess}`)
        }

        console.log('[DocxPreview] File validation passed')

        // Try docx-preview directly first (more reliable for large files)
        console.log('[DocxPreview] Trying docx-preview first...')
        setRenderMode('docx-preview')
        
        const { renderAsync } = await import('docx-preview')
        console.log('[DocxPreview] docx-preview loaded')
        
        if (!isMounted) return
        
        // Wait a bit for React to render the container
        await new Promise(resolve => setTimeout(resolve, 200))
        
        if (!containerRef.current) {
          throw new Error('Container not available')
        }
        
        const arrayBuffer = await file.arrayBuffer()
        console.log('[DocxPreview] File loaded, size:', arrayBuffer.byteLength, 'bytes')
        
        containerRef.current.innerHTML = ''
        
        await renderAsync(arrayBuffer, containerRef.current, undefined, {
          className: 'docx-content',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          useBase64URL: false,
          renderChanges: false,
          breakPages: true,
          experimental: true,
        })
        
        if (!isMounted) return
        console.log('[DocxPreview] ✅ docx-preview render successful!')
        
        // Create custom pagination after render
        setTimeout(() => {
          if (!isMounted || !containerRef.current) {
            console.warn('[DocxPreview] Component unmounted or container lost during pagination setup')
            return
          }
          
          // Find or create the rendered content wrapper
          let wrapper = containerRef.current.querySelector('.docx-wrapper') as HTMLElement
          
          if (!wrapper) {
            // docx-preview might render directly in container, wrap it
            console.log('[DocxPreview] No docx-wrapper found, creating wrapper...')
            const existingContent = containerRef.current.innerHTML
            
            wrapper = document.createElement('div')
            wrapper.className = 'docx-wrapper'
            wrapper.style.width = `${A4_WIDTH_CM}cm`
            wrapper.style.height = `${A4_HEIGHT_CM}cm`
            wrapper.style.maxHeight = `${A4_HEIGHT_CM}cm`
            wrapper.style.margin = '0 auto'
            wrapper.style.backgroundColor = 'white'
            wrapper.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
            wrapper.style.overflowY = 'hidden'
            wrapper.style.overflowX = 'visible'
            wrapper.style.position = 'relative'
            wrapper.style.border = '0.15cm solid #4B5563'
            wrapper.style.boxSizing = 'border-box'
            wrapper.innerHTML = existingContent
            
            containerRef.current.innerHTML = ''
            containerRef.current.appendChild(wrapper)
            
            console.log('[DocxPreview] Created wrapper with content')
          } else {
            // Wrapper exists, ensure it has correct styles
            wrapper.style.height = `${A4_HEIGHT_CM}cm`
            wrapper.style.maxHeight = `${A4_HEIGHT_CM}cm`
            wrapper.style.overflowY = 'hidden'
            wrapper.style.overflowX = 'visible'
            wrapper.style.border = '0.15cm solid #4B5563'
            wrapper.style.boxSizing = 'border-box'
          }
          
          // Check if already has sections/pages
          let existingSections = wrapper.querySelectorAll('section')
          console.log('[DocxPreview] Existing sections:', existingSections.length)
          
          if (existingSections.length > 1) {
            // Already has pages
            const pageCount = existingSections.length
            console.log('[DocxPreview] ✅ Using existing', pageCount, 'pages')
            
            if (isMounted) {
              setTotalPages(pageCount)
              console.log('[DocxPreview] Setting totalPages to:', pageCount)
            }
            
            existingSections.forEach((section, index) => {
              const el = section as HTMLElement
              if (index === 0) {
                el.style.display = 'block'
              } else {
                el.style.display = 'none'
              }
            })
          } else {
            // Need to create scroll-based pagination
            console.log('[DocxPreview] Creating scroll-based pagination...')
            
            // Measure content height
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = wrapper.innerHTML
            tempDiv.style.position = 'absolute'
            tempDiv.style.visibility = 'hidden'
            tempDiv.style.width = `${A4_WIDTH_CM}cm` // 23.5cm
            document.body.appendChild(tempDiv)
            
            const totalHeight = tempDiv.offsetHeight
            const numPages = Math.ceil(totalHeight / A4_HEIGHT_PX)
            
            document.body.removeChild(tempDiv)
            
            console.log('[DocxPreview] Content height:', totalHeight, 'px → Creating', numPages, 'pages')
            
            // Update total pages
            if (isMounted) {
              setTotalPages(numPages)
              console.log('[DocxPreview] Setting totalPages to:', numPages)
            }
            
            // Wrap content in a scrollable container with page markers
            const content = wrapper.innerHTML
            wrapper.innerHTML = ''
            
            const scrollContainer = document.createElement('div')
            scrollContainer.className = 'docx-scroll-content'
            scrollContainer.innerHTML = content
            scrollContainer.setAttribute('data-total-pages', String(numPages))
            
            wrapper.appendChild(scrollContainer)
            
            console.log('[DocxPreview] Scroll container created:', {
              width: scrollContainer.offsetWidth,
              height: scrollContainer.offsetHeight,
              scrollHeight: scrollContainer.scrollHeight,
              numPages: numPages,
              wrapperHeight: wrapper.offsetHeight
            })
            
            console.log('[DocxPreview] ✅ Created scroll-based pagination with', numPages, 'pages')
          }
        }, 1000)
        
        setErrorMessage(null)
        
      } catch (error) {
        console.error('[DocxPreview] docx-preview failed, trying mammoth...', error)
        
        // Fallback to mammoth for simpler files
        try {
          const mammoth = await import('mammoth')
          const arrayBuffer = await file.arrayBuffer()
          const result = await mammoth.convertToHtml({ arrayBuffer })
          
          if (!isMounted) return
          
          if (result.value && result.value.trim().length > 20) {
            console.log('[DocxPreview] ✅ Mammoth success, HTML length:', result.value.length)
            setRenderMode('mammoth')
            setHtml(result.value)
            setErrorMessage(null)
          } else {
            throw new Error('Mammoth returned empty content')
          }
        } catch (mammothError) {
          console.error('[DocxPreview] Both renderers failed, trying text extraction...', mammothError)
          
          // Last resort: try to extract any readable text from the file
          try {
            const arrayBuffer = await file.arrayBuffer()
            const uint8Array = new Uint8Array(arrayBuffer)
            
            // Check for executable/binary file signatures
            const signature = Array.from(uint8Array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('')
            if (signature.startsWith('4d5a')) { // "MZ" - DOS executable
              throw new Error('File này là executable (.exe) được đổi tên thành .docx')
            }
            
            // Look for common binary signatures that indicate this is not a text document
            const textStart = Array.from(uint8Array.slice(0, 100))
              .map(b => String.fromCharCode(b))
              .join('')
            
            if (textStart.includes('This program cannot be run in DOS mode') || 
                textStart.includes('PE\0\0') ||
                signature.startsWith('7f454c46')) { // ELF executable
              throw new Error('File này là file thực thi hoặc binary, không phải DOCX')
            }
            
            // Convert to string and look for readable text
            let text = ''
            let readableCount = 0
            const sampleSize = Math.min(uint8Array.length, 5000)
            
            for (let i = 0; i < sampleSize; i++) {
              const byte = uint8Array[i]
              // Only include printable ASCII characters and common Unicode
              if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
                text += String.fromCharCode(byte)
                if (byte >= 65 && byte <= 122) readableCount++ // Count letters
              } else if (byte === 0) {
                text += ' ' // Replace null bytes with spaces
              }
            }
            
            // Check if we have enough readable content (at least 10% should be letters)
            if (readableCount < sampleSize * 0.1) {
              throw new Error('File chứa quá nhiều binary data, không thể trích xuất text có nghĩa')
            }
            
            // Clean up the extracted text
            const cleanText = text
              .replace(/[^\w\s\.,!?;:()\-\u00C0-\u017F\u1EA0-\u1EF9]/g, ' ') // Keep Vietnamese chars
              .replace(/\s+/g, ' ') // Normalize whitespace
              .trim()
            
            if (cleanText.length > 50) {
              console.log('[DocxPreview] ✅ Text extraction successful:', cleanText.length, 'chars')
              if (!isMounted) return
              
              setRenderMode('mammoth')
              setLoading(false) // Clear loading state
              setHtml(`
                <div style="padding: 20px; border: 1px solid #f59e0b; background: #fef3c7; border-radius: 8px; margin-bottom: 16px;">
                  <h4 style="margin: 0 0 12px 0; color: #92400e;">⚠️ Preview từ text thô</h4>
                  <p style="margin: 0; font-size: 14px; color: #92400e;">
                    File DOCX bị hỏng cấu trúc, chỉ có thể hiển thị text đã trích xuất:
                  </p>
                </div>
                <div style="white-space: pre-wrap; font-family: monospace; font-size: 14px; line-height: 1.6; color: #1f2937;">
                  ${cleanText.substring(0, 2000)}${cleanText.length > 2000 ? '\n\n... (văn bản đã được cắt ngắn)' : ''}
                </div>
              `)
              setErrorMessage(null)
              return
            }
          } catch (textError) {
            console.error('[DocxPreview] Text extraction also failed:', textError)
            
            // If text extraction failed with specific error (like executable detection), use that
            if (textError instanceof Error && 
                (textError.message.includes('executable') || textError.message.includes('thực thi'))) {
              if (!isMounted) return
              setRenderMode('mammoth')
              setErrorMessage(`🚫 ${textError.message} - File này không an toàn và không thể xem!`)
              return
            }
          }
          
          if (!isMounted) return
          setRenderMode('mammoth')
          
          let errorMsg = 'Không thể hiển thị file DOCX.'
          const errorStr = mammothError instanceof Error ? mammothError.message : String(mammothError)
          
          if (errorStr.includes('executable') || errorStr.includes('thực thi')) {
            errorMsg = '🚫 File này là executable (.exe) được đổi tên thành .docx - không an toàn!'
          } else if (errorStr.includes('binary data')) {
            errorMsg += ' File chứa binary data thay vì văn bản.'
          } else if (errorStr.includes('main document part')) {
            errorMsg += ' File DOCX có vấn đề về cấu trúc hoặc bị hỏng.'
          } else if (errorStr.includes('ZIP') || errorStr.includes('không phải DOCX')) {
            errorMsg += ' File không đúng định dạng DOCX hoặc bị hỏng nghiêm trọng.'
          } else {
            errorMsg += ` File có thể bị lỗi hoặc quá lớn (${(file.size/1024/1024).toFixed(1)}MB).`
          }
          
          setErrorMessage(errorMsg)
        }
      }

      if (isMounted) {
        setLoading(false)
      }
    }

    setLoading(true)
    setHtml('')
    setErrorMessage(null)
    setCurrentPage(1) // Reset to first page
    setTotalPages(1) // Reset page count
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    loadDocx()

    return () => {
      isMounted = false
    }
  }, [file])

  // Effect to scroll to page based on currentPage
  useEffect(() => {
    console.log('[DocxPreview] Page navigation effect triggered:', { currentPage, renderMode, totalPages })
    
    if (renderMode === 'docx-preview' && containerRef.current && totalPages > 1) {
      const wrapper = containerRef.current.querySelector('.docx-wrapper')
      if (!wrapper) {
        console.error('[DocxPreview] Wrapper not found in navigation effect')
        return
      }
      
      // Check if using section-based or scroll-based pagination
      const sections = wrapper.querySelectorAll('section')
      console.log('[DocxPreview] Found', sections.length, 'sections in wrapper')
      
      if (sections.length > 1) {
        // Section-based: hide/show pages
        console.log('[DocxPreview] Using section-based navigation to page', currentPage)
        sections.forEach((page, index) => {
          const pageElement = page as HTMLElement
          const pageNum = index + 1
          if (pageNum === currentPage) {
            pageElement.style.display = 'block'
            console.log('[DocxPreview] ✅ Showing page', pageNum)
            if (containerRef.current) {
              containerRef.current.scrollTop = 0
            }
          } else {
            pageElement.style.display = 'none'
            console.log('[DocxPreview] ❌ Hiding page', pageNum)
          }
        })
      } else {
        // Scroll-based: scroll wrapper to page position
        const scrollContent = wrapper.querySelector('.docx-scroll-content') as HTMLElement
        if (scrollContent) {
          const targetScrollTop = (currentPage - 1) * A4_HEIGHT_PX
          
          console.log('[DocxPreview] Scrolling to page', currentPage, '→ targetScroll:', targetScrollTop, 'px')
          console.log('[DocxPreview] Scroll content before transform:', {
            currentTransform: scrollContent.style.transform,
            height: scrollContent.offsetHeight,
            scrollHeight: scrollContent.scrollHeight
          })
          
          // Scroll wrapper by transforming content
          scrollContent.style.transform = `translateY(-${targetScrollTop}px)`
          scrollContent.style.transition = 'transform 0.3s ease-in-out'
          
          console.log('[DocxPreview] Applied transform:', scrollContent.style.transform)
        } else {
          console.warn('[DocxPreview] Scroll content not found!')
        }
      }
    }
  }, [currentPage, renderMode, totalPages])

  const goToPage = (page: number) => {
    console.log('[DocxPreview] goToPage called:', page, 'totalPages:', totalPages)
    if (page >= 1 && page <= totalPages) {
      console.log('[DocxPreview] ✅ Changing page from', currentPage, 'to', page)
      setCurrentPage(page)
    } else {
      console.warn('[DocxPreview] ⚠️ Invalid page:', page)
    }
  }

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ backgroundColor: '#ffffff' }}
    >
      <div
        className="px-4 py-3 border-b flex items-center justify-between"
        style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}
      >
        <p className="text-xs" style={{ color: '#4b5563' }}>
          {file.name} • {(file.size / 1024).toFixed(2)} KB
        </p>
        
        {/* Pagination controls - only show for docx-preview mode with multiple pages */}
        {renderMode === 'docx-preview' && totalPages > 1 && !loading && !errorMessage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-xs rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                borderColor: '#d1d5db',
                backgroundColor: currentPage === 1 ? '#f3f4f6' : '#ffffff',
                color: '#374151',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              ← Trước
            </button>
            
            <span className="text-xs font-medium px-2" style={{ color: '#1f2937' }}>
              Trang {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-xs rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                borderColor: '#d1d5db',
                backgroundColor: currentPage === totalPages ? '#f3f4f6' : '#ffffff',
                color: '#374151',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Sau →
            </button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {/* Always render container for docx-preview, but hide when not needed */}
        <div 
          ref={containerRef} 
          className="docx-container"
          style={{ 
            display: renderMode === 'docx-preview' ? 'flex' : 'none',
            width: '100%',
            height: `${A4_HEIGHT_CM}cm`, // 29.7cm height
            maxHeight: `${A4_HEIGHT_CM}cm`,
            backgroundColor: '#f3f4f6', // Gray background like Word
            padding: '0',
            overflowY: 'hidden', // Hide vertical overflow for pagination
            overflowX: 'auto', // Allow horizontal scroll if needed
            alignItems: 'flex-start',
            justifyContent: 'center',
          }} 
        />
        
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={{ borderColor: '#2563eb' }} ></div>
              <p className="text-sm" style={{ color: '#6b7280' }} >Đang tải nội dung...</p>
            </div>
          </div>
        ) : errorMessage ? (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-4">
            <p>{errorMessage}</p>
            <div className="mt-3 space-y-2">
              <p className="text-xs text-red-500">
                Gợi ý khắc phục:
              </p>
              <ul className="text-xs text-red-600 list-disc list-inside space-y-1">
                <li>Kiểm tra file có bị hỏng không bằng cách mở trong Word/LibreOffice</li>
                <li>Thử lưu lại file ở định dạng DOCX mới từ Word</li>
                <li>Nếu file quá lớn, hãy thử nén hình ảnh trong Word trước khi upload</li>
                <li>Hoặc tải file xuống để xem trực tiếp</li>
              </ul>
              <div className="mt-3 pt-2 border-t border-red-200">
                <p className="text-xs text-gray-600">
                  <strong>File info:</strong> {file.name} • {(file.size/1024/1024).toFixed(2)}MB
                </p>
              </div>
            </div>
          </div>
        ) : renderMode === 'mammoth' && html ? (
          <div className="prose prose-sm max-w-none">
            <div
              className="docx-html"
              style={{ color: '#1f2937' }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

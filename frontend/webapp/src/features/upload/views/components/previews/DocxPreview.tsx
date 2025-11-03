import { useState, useEffect } from 'react'

interface DocxPreviewProps {
  file: File
}

export default function DocxPreview({ file }: DocxPreviewProps) {
  const [html, setHtml] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDocx = async () => {
      try {
        const extension = file.name.split('.').pop()?.toLowerCase()
        if (extension === 'doc') {
          setHtml('Định dạng .doc chưa được hỗ trợ xem trực tiếp. Vui lòng chuyển sang .docx.')
          return
        }

        const mammoth = await import('mammoth/mammoth.browser')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.convertToHtml({ arrayBuffer })
        setHtml(result.value)
      } catch (error) {
        console.error('Error loading docx:', error)
        setHtml('Không thể hiển thị file DOCX. Vui lòng thử lại hoặc kiểm tra tệp.')
      } finally {
        setLoading(false)
      }
    }

    loadDocx()
  }, [file])

  return (
    <div className="w-full h-full flex flex-col" style={ backgroundColor: '#ffffff' }>
      <div className="px-4 py-3 border-b" style={ borderColor: '#e5e7eb' } style={ backgroundColor: '#f9fafb' }>
        <p className="text-xs" style={ color: '#4b5563' }>
          {file.name} • {(file.size / 1024).toFixed(2)} KB
        </p>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 mb-2" style={ borderColor: '#2563eb' }></div>
              <p className="text-sm" style={ color: '#6b7280' }>Đang tải nội dung...</p>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <div
              className="docx-html" style={ color: '#1f2937' }
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

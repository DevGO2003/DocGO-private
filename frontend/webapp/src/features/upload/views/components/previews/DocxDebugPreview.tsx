import { useState, useEffect } from 'react'

interface DocxDebugPreviewProps {
  file: File
}

export default function DocxDebugPreview({ file }: DocxDebugPreviewProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    let isMounted = true
    setLogs([])
    setStatus('loading')

    const testDocx = async () => {
      try {
        addLog(`Starting debug for file: ${file.name} (${file.type})`)
        addLog(`File size: ${(file.size / 1024).toFixed(2)} KB`)

        // Test 1: Check if mammoth is available
        addLog('Testing mammoth import...')
        try {
          const mammothModule = await import('mammoth/mammoth.browser.js')
          addLog('✅ Mammoth import successful')
          
          const convertToHtml = (mammothModule as any).convertToHtml || (mammothModule as any).default?.convertToHtml
          if (convertToHtml) {
            addLog('✅ Mammoth convertToHtml function found')
            
            // Test mammoth conversion
            const arrayBuffer = await file.arrayBuffer()
            addLog(`✅ File read as ArrayBuffer: ${arrayBuffer.byteLength} bytes`)
            
            const result = await convertToHtml({ arrayBuffer })
            addLog(`✅ Mammoth conversion successful: ${result.value?.length || 0} chars`)
            
            if (isMounted) {
              setStatus('success')
              addLog('🎉 DOCX preview should work with Mammoth!')
            }
            return
          } else {
            addLog('❌ Mammoth convertToHtml function not found')
          }
        } catch (mammothError) {
          addLog(`❌ Mammoth failed: ${mammothError}`)
        }

        // Test 2: Check docx-preview fallback
        addLog('Testing docx-preview fallback...')
        try {
          const { renderAsync } = await import('docx-preview')
          addLog('✅ docx-preview import successful')
          
          const arrayBuffer = await file.arrayBuffer()
          addLog(`✅ File ArrayBuffer ready: ${arrayBuffer.byteLength} bytes`)
          
          // We can't actually render here without a container, but import works
          if (isMounted) {
            setStatus('success')
            addLog('🎉 DOCX preview should work with docx-preview!')
          }
        } catch (docxError) {
          addLog(`❌ docx-preview failed: ${docxError}`)
          if (isMounted) {
            setStatus('error')
            addLog('💥 Both preview methods failed!')
          }
        }

      } catch (error) {
        addLog(`💥 Fatal error: ${error}`)
        if (isMounted) {
          setStatus('error')
        }
      }
    }

    testDocx()

    return () => {
      isMounted = false
    }
  }, [file])

  return (
    <div className="p-4 bg-gray-50 border rounded">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        🔍 DOCX Preview Debug 
        {status === 'loading' && <span className="text-blue-500">Loading...</span>}
        {status === 'success' && <span className="text-green-500">Success</span>}
        {status === 'error' && <span className="text-red-500">Error</span>}
      </h3>
      
      <div className="bg-black text-green-400 p-3 rounded font-mono text-xs max-h-64 overflow-y-auto">
        {logs.length === 0 && <div>Starting tests...</div>}
        {logs.map((log, idx) => (
          <div key={idx}>{log}</div>
        ))}
      </div>
      
      <div className="mt-3 text-xs text-gray-600">
        <strong>Instructions:</strong> Open browser DevTools Console to see detailed logs from DocxPreview component.
      </div>
    </div>
  )
}

'use client'

import React, { useState, useEffect } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { PreviewProps } from '@/lib/preview/types'

// Language mapping từ file extension
const getLanguageFromFile = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase()
  
  const languageMap: Record<string, string> = {
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'js': 'javascript',
    'jsx': 'jsx',
    'ts': 'typescript',
    'tsx': 'tsx',
    'json': 'json',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'md': 'markdown',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'cs': 'csharp',
    'php': 'php',
    'rb': 'ruby',
    'go': 'go',
    'rs': 'rust',
    'sh': 'bash',
    'sql': 'sql',
    'vue': 'vue',
    'svelte': 'svelte'
  }
  
  return languageMap[extension || ''] || 'text'
}

export default function CodePreview({ file, onError }: PreviewProps) {
  const [code, setCode] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const language = getLanguageFromFile(file.name)
  
  useEffect(() => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string
        setCode(result)
        setLoading(false)
      } catch (error) {
        onError?.(error as Error)
        setLoading(false)
      }
    }
    
    reader.onerror = () => {
      onError?.(new Error(`Failed to read file: ${file.name}`))
      setLoading(false)
    }
    
    reader.readAsText(file)
  }, [file, onError])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Đang tải nội dung...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="h-full overflow-hidden">
      <div className="bg-gray-800 text-white px-4 py-2 text-sm font-mono border-b border-gray-700">
        {file.name} • {language}
      </div>
      <div className="h-full overflow-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            height: '100%',
            fontSize: '14px'
          }}
          showLineNumbers={true}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  )
}

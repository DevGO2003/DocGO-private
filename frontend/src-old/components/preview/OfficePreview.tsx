'use client'

import React, { useState, useEffect } from 'react'
import * as XLSX from 'xlsx'
import mammoth from 'mammoth'
import { PreviewProps } from '@/lib/preview/types'

interface SheetData {
  name: string
  data: any[][]
}

interface DocxContent {
  html: string
  messages: string[]
}

export default function OfficePreview({ file, onError }: PreviewProps) {
  const [sheets, setSheets] = useState<SheetData[]>([])
  const [activeSheet, setActiveSheet] = useState<string>('')
  const [docxContent, setDocxContent] = useState<DocxContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [fileType, setFileType] = useState<'excel' | 'docx' | null>(null)
  
  useEffect(() => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    if (fileExtension === 'docx' || fileExtension === 'doc') {
      // Handle DOCX files
      setFileType('docx')
      const reader = new FileReader()
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const result = await mammoth.convertToHtml({ arrayBuffer })
          
          setDocxContent({
            html: result.value,
            messages: result.messages.map((msg: any) => msg.message || msg.toString())
          })
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
      
      reader.readAsArrayBuffer(file)
    } else {
      // Handle Excel files
      setFileType('excel')
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          
          const sheetNames = workbook.SheetNames
          const sheetData: SheetData[] = sheetNames.map(name => {
            const worksheet = workbook.Sheets[name]
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
            return {
              name,
              data: jsonData as any[][]
            }
          })
          
          setSheets(sheetData)
          setActiveSheet(sheetNames[0] || '')
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
      
      reader.readAsBinaryString(file)
    }
  }, [file, onError])
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">
            {fileType === 'docx' ? 'Đang tải file Word...' : 'Đang tải file Excel...'}
          </p>
        </div>
      </div>
    )
  }
  
  const currentSheet = sheets.find(sheet => sheet.name === activeSheet)
  
  // Render DOCX content
  if (fileType === 'docx' && docxContent) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-gray-800 text-white px-4 py-2 text-sm border-b border-gray-700">
          <div className="flex items-center justify-between">
            <span className="font-mono">{file.name}</span>
            <span className="text-gray-300">Word Document</span>
          </div>
        </div>
        
        {/* DOCX Content */}
        <div className="flex-1 overflow-auto bg-white p-6">
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: docxContent.html }}
          />
        </div>
        
        {/* Footer Info */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
          <span>Word Document Preview</span>
          {docxContent.messages.length > 0 && (
            <span className="ml-2 text-yellow-600">
              • {docxContent.messages.length} cảnh báo
            </span>
          )}
        </div>
      </div>
    )
  }
  
  // Render Excel content
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-4 py-2 text-sm border-b border-gray-700">
        <div className="flex items-center justify-between">
          <span className="font-mono">{file.name}</span>
          <span className="text-gray-300">
            {sheets.length} sheet{sheets.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Sheet Tabs */}
      {sheets.length > 1 && (
        <div className="bg-gray-100 border-b border-gray-200 flex overflow-x-auto">
          {sheets.map(sheet => (
            <button
              key={sheet.name}
              onClick={() => setActiveSheet(sheet.name)}
              className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeSheet === sheet.name
                  ? 'border-blue-500 text-blue-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {sheet.name}
            </button>
          ))}
        </div>
      )}
      
      {/* Table Content */}
      <div className="flex-1 overflow-auto bg-white">
        {currentSheet && currentSheet.data.length > 0 ? (
          <div className="min-w-full">
            <table className="min-w-full border-collapse">
              <tbody>
                {currentSheet.data.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex === 0 ? 'bg-gray-50' : ''}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`border border-gray-200 px-3 py-2 text-sm ${
                          rowIndex === 0 ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {cell !== null && cell !== undefined ? String(cell) : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">Không có dữ liệu trong sheet này</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Info */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2 text-xs text-gray-500">
        {currentSheet && (
          <span>
            {currentSheet.data.length} hàng • {currentSheet.data[0]?.length || 0} cột
          </span>
        )}
      </div>
    </div>
  )
}

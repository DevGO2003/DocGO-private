'use client'

import React from 'react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'

interface GlobalDragOverlayProps {
  globalDragActive: boolean
}

export default function GlobalDragOverlay({ globalDragActive }: GlobalDragOverlayProps) {
  if (!globalDragActive) return null

  return (
    <div className="fixed inset-0 bg-blue-500 bg-opacity-20 border-4 border-dashed border-blue-500 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-2xl border-4 border-blue-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DocumentTextIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Thả file vào đây để upload</h3>
          <p className="text-sm text-gray-600">PDF, DOCX, TXT, Images • Tối đa 50MB</p>
        </div>
      </div>
    </div>
  )
}

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { DocumentTextIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import type { Document } from '../_types'
import { translateContractStatus, translateContractType, translateContractTag } from '@/utils/tagTranslations'
import ContractCard from './ContractCard'
import GeneralFileCard from './GeneralFileCard'

type Props = {
  items: Document[]
  selectedItems: string[]
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  viewMode: 'grid' | 'list'
  badgeClass: (status: string) => string
  t: (key: string, vars?: Record<string, any>) => string
}

export default function DocumentsTable({ items, selectedItems, onToggleSelect, onSelectAll, onClearSelection, viewMode, badgeClass, t }: Props) {

  if (viewMode === 'grid') {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedItems.length === items.length && items.length > 0}
              onChange={selectedItems.length === items.length ? onClearSelection : onSelectAll}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span className="text-sm text-gray-600">
              {selectedItems.length === items.length && items.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </span>
          </div>
        </div>

        <div className="grid gap-4" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'}}>
          {items.map(doc => {
            const isSelected = selectedItems.includes(doc.id)
            
            if (doc.documentType === 'GENERAL_FILE') {
              return (
                <GeneralFileCard
                  key={doc.id}
                  document={doc}
                  isSelected={isSelected}
                  onToggleSelect={onToggleSelect}
                  badgeClass={badgeClass}
                  t={t}
                />
              )
            } else {
            return (
                <ContractCard
                  key={doc.id}
                  document={doc}
                  isSelected={isSelected}
                  onToggleSelect={onToggleSelect}
                  badgeClass={badgeClass}
                  t={t}
                />
              )
            }
          })}
        </div>

      </div>
    )
  }

  // list mode delegates to existing CustomTable via parent for now
  return null
}


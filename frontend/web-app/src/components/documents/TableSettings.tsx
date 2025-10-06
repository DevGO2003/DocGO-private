''use client''

import React from 'react'

export type TableColumn = {
 key: string
 header: string
 width?: string
 visible?: boolean
}

type TableSettingsProps = {
 columns: TableColumn[]
 onChange: (cols: TableColumn[]) => void
}

export default function TableSettings({ columns, onChange }: TableSettingsProps) {
 const toggle = (key: string) => {
 const next = columns.map((c) => (c.key === key ? { ...c, visible: c.visible !== false ? false : true } : c))
 onChange(next)
 }

 return (
 <div className=\flex flex-wrap gap-2\> 
 {columns.map((c) => (
 <label key={c.key} className=\inline-flex items-center gap-2 text-sm bg-gray-50 border border-gray-200 px-2 py-1 rounded-md\> 
 <input type=\checkbox\ checked={c.visible !== false} onChange={() => toggle(c.key)} />
 <span>{c.header}</span>
 </label>
 ))}
 </div>
 )
}

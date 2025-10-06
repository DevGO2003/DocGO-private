''use client''

import React from 'react'

export type TableColumn = {
 key: string
 header: string
 width?: string
}

type CustomTableProps = {
 columns: TableColumn[]
 rows: Record<string, React.ReactNode>[]
}

export default function CustomTable({ columns, rows }: CustomTableProps) {
 return (
 <div className=\overflow-x-auto bg-white rounded-xl border border-gray-200\> 
 <table className=\min-w-full divide-y divide-gray-200\> 
 <thead className=\bg-gray-50\> 
 <tr>
 {columns.map((col) => (
 <th key={col.key} className=\px-4 py-2 text-left text-xs font-semibold text-gray-600\ style={{ width: col.width }}>
 {col.header}
 </th>
 ))}
 </tr>
 </thead>
 <tbody className=\divide-y divide-gray-100\> 
 {rows.map((row, idx) => (
 <tr key={idx} className=\hover:bg-gray-50\> 
 {columns.map((col) => (
 <td key={col.key} className=\px-4 py-2 text-sm text-gray-800\> 
 {row[col.key] ?? ''}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )
}

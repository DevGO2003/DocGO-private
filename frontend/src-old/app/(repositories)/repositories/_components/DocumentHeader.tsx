import React from 'react'

type Props = {
  title: string
  subtitle?: string
  statusBadge: React.ReactNode
  typeBadge?: React.ReactNode
}

export default function DocumentHeader({ title, subtitle, statusBadge, typeBadge }: Props) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{title}</h1>
          {subtitle && <p className="text-gray-600">{subtitle}</p>}
        </div>
        <div className="flex gap-2">
          {statusBadge}
          {typeBadge}
        </div>
      </div>
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />
    </div>
  )
}



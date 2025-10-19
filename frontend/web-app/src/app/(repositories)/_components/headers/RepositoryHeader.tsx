import React from 'react'

interface Action {
  label: string
  onClick: () => void
}

interface RepositoryHeaderProps {
  title: string
  description: string
  badge: string
  badgeColor: 'green' | 'gray' | 'blue'
  actions?: Action[]
}

export function RepositoryHeader({
  title,
  description,
  badge,
  badgeColor,
  actions = []
}: RepositoryHeaderProps) {
  const badgeClasses = {
    green: 'bg-green-100 text-green-800',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-800'
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-600 mt-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeClasses[badgeColor]}`}>
            {badge}
          </span>
          <span className="ml-2">{description}</span>
        </p>
      </div>
      {actions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

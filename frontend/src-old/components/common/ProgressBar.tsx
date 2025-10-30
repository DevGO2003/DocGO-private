import React from 'react'

interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'emerald'
  size?: 'sm' | 'md' | 'lg'
}

export default function ProgressBar({ 
  progress, 
  className = '', 
  showPercentage = true,
  color = 'blue',
  size = 'md'
}: ProgressBarProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    emerald: 'bg-emerald-500'
  }

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  }

  const percentageClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} h-full transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showPercentage && (
        <div className={`mt-1 text-center text-gray-600 ${percentageClasses[size]}`}>
          {Math.round(progress)}%
        </div>
      )}
    </div>
  )
}

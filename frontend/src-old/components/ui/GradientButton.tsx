import React from 'react'
import Link from 'next/link'

interface GradientButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function GradientButton({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button'
}: GradientButtonProps) {
  const baseClasses = 'font-semibold rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2'
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-2xl',
    secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600 hover:text-blue-600',
    outline: 'bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600'
  }
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  )
}

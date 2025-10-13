import React from 'react'

export interface PreviewConfig {
  type: string | RegExp
  component: React.ComponentType<PreviewProps>
  priority: number
  canHandle: (file: File) => boolean
}

export interface PreviewProps {
  file: File
  onError?: (error: Error) => void
}

export interface PreviewError {
  message: string
  type: 'parse' | 'load' | 'render'
  file?: File
}

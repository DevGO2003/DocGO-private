import { PreviewConfig, PreviewProps } from './types'

class PreviewRegistry {
  private previews: PreviewConfig[] = []
  
  register(config: PreviewConfig): void {
    this.previews.push(config)
    this.previews.sort((a, b) => b.priority - a.priority)
  }
  
  getPreview(file: File): React.ComponentType<PreviewProps> | null {
    const preview = this.previews.find(p => p.canHandle(file))
    return preview?.component || null
  }
  
  getAllPreviews(): PreviewConfig[] {
    return [...this.previews]
  }
  
  clear(): void {
    this.previews = []
  }
}

export const registry = new PreviewRegistry()

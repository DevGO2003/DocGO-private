import dynamic from 'next/dynamic'
import { registry } from './PreviewRegistry'

// Dynamic import preview components with SSR disabled to avoid server-side DOM/worker issues
const CodePreview = dynamic(() => import('@/components/preview/CodePreview'), { ssr: false })
const OfficePreview = dynamic(() => import('@/components/preview/OfficePreview'), { ssr: false })
const ArchivePreview = dynamic(() => import('@/components/preview/ArchivePreview'), { ssr: false })
const PdfPreview = dynamic(() => import('@/components/preview/PdfPreview'), { ssr: false })
const ImagePreview = dynamic(() => import('@/components/preview/ImagePreview'), { ssr: false })
const VideoPreview = dynamic(() => import('@/components/preview/VideoPreview'), { ssr: false })
const AudioPreview = dynamic(() => import('@/components/preview/AudioPreview'), { ssr: false })
const TextPreview = dynamic(() => import('@/components/preview/TextPreview'), { ssr: false })
const GenericPreview = dynamic(() => import('@/components/preview/GenericPreview'), { ssr: false })

export function registerAllPreviews(): void {
  // Clear existing registrations
  registry.clear()
  
  // 1. Code files - highest priority (100)
  registry.register({
    type: /text\/(html|css|javascript|xml)/,
    component: CodePreview,
    priority: 100,
    canHandle: (file) => /\.(html|htm|css|js|jsx|ts|tsx|json|xml|yaml|yml|md|py|java|cpp|c|cs|php|rb|go|rs|sh|sql|vue|svelte)$/i.test(file.name)
  })
  
  // 2. PDF files - high priority (95)
  registry.register({
    type: 'application/pdf',
    component: PdfPreview,
    priority: 95,
    canHandle: (file) => file.type === 'application/pdf' || /\.pdf$/i.test(file.name)
  })
  
  // 3. Office files - high priority (90)
  registry.register({
    type: /application\/vnd\..*\.(spreadsheet|presentation|wordprocessingml)/,
    component: OfficePreview,
    priority: 90,
    canHandle: (file) => /\.(xlsx|xls|pptx|ppt|docx|doc)$/i.test(file.name)
  })
  
  // 4. Archive files - medium-high priority (85)
  registry.register({
    type: /application\/(zip|x-rar|x-7z)/,
    component: ArchivePreview,
    priority: 85,
    canHandle: (file) => /\.(zip|rar|7z)$/i.test(file.name)
  })
  
  // 5. Image files - medium priority (80)
  registry.register({
    type: /image\//,
    component: ImagePreview,
    priority: 80,
    canHandle: (file) => file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico)$/i.test(file.name)
  })
  
  // 6. Video files - medium priority (75)
  registry.register({
    type: /video\//,
    component: VideoPreview,
    priority: 75,
    canHandle: (file) => file.type.startsWith('video/') || /\.(mp4|avi|mov|wmv|flv|webm|mkv)$/i.test(file.name)
  })
  
  // 7. Audio files - medium priority (70)
  registry.register({
    type: /audio\//,
    component: AudioPreview,
    priority: 70,
    canHandle: (file) => file.type.startsWith('audio/') || /\.(mp3|wav|ogg|aac|flac|m4a)$/i.test(file.name)
  })
  
  // 8. Text files - low-medium priority (65)
  registry.register({
    type: 'text/plain',
    component: TextPreview,
    priority: 65,
    canHandle: (file) => file.type === 'text/plain' || /\.(txt|log|csv)$/i.test(file.name)
  })
  
  // 9. Generic fallback - lowest priority (1)
  registry.register({
    type: /.*/,
    component: GenericPreview,
    priority: 1,
    canHandle: () => true // Always match as fallback
  })
}

// Helper function to get preview info without registering
export function getPreviewInfo(file: File): { component: string; priority: number; type: string } | null {
  const tempRegistry = {
    previews: [] as Array<{
      type: string | RegExp
      component: any
      priority: number
      canHandle: (file: File) => boolean
    }>,
    register(config: any) {
      this.previews.push(config)
      this.previews.sort((a, b) => b.priority - a.priority)
    }
  }
  
  // Register all previews temporarily
  const originalRegister = registry.register
  registry.register = tempRegistry.register.bind(tempRegistry)
  registerAllPreviews()
  registry.register = originalRegister
  
  // Find matching preview
  const preview = tempRegistry.previews.find(p => p.canHandle(file))
  
  if (preview) {
    return {
      component: preview.component.name || 'Unknown',
      priority: preview.priority,
      type: typeof preview.type === 'string' ? preview.type : preview.type.toString()
    }
  }
  
  return null
}

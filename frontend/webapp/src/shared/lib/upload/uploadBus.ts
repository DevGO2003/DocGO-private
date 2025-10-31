// Simple singleton bus to pass dropped files between routes
let pendingFiles: File[] | null = null

export const uploadBus = {
  setPendingFiles(files: File[]) {
    pendingFiles = files
  },
  consumePendingFiles(): File[] | null {
    const files = pendingFiles
    pendingFiles = null
    return files
  }
}

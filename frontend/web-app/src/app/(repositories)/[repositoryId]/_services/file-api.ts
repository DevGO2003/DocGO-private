export async function fetchFileById(fileId: string) {
  try {
    // Mock API call - replace with real API
    console.log('Fetching file detail with ID:', fileId)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock data
    return {
      data: {
        id: fileId,
        overview: {
          title: `Tài liệu ${fileId}`,
          status: 'ACTIVE',
          contractType: 'Hợp đồng',
          tags: ['Mock', 'Test']
        },
        content: {
          plaintext: 'Nội dung tài liệu mock...'
        }
      }
    }
  } catch (error) {
    console.error('Error fetching file detail:', error)
    throw error
  }
}

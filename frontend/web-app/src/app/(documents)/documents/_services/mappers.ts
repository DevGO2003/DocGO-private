import type { Document, Paginated } from '../_types'

export function mapApiDocumentToUi(doc: any): Document {
  // Complex logic for computing expiry date based on effective date and term
  const computeExpiryDate = (effectiveDate: string, term: string | undefined): string => {
    if (!effectiveDate || !term) return ''
    
    // Support multiple term formats: "12 months", "6m", "1 year", etc.
    const match = String(term).match(/(\d{1,3})\s*(m|mo|mon|month|months|y|yr|year|years)?/i)
    if (match) {
      const value = parseInt(match[1], 10)
      const unit = (match[2] || 'month').toLowerCase()
      
      if (!isNaN(value)) {
        const d = new Date(effectiveDate)
        if (!isNaN(d.getTime())) {
          // Convert to months for consistent calculation
          const months = unit.startsWith('y') ? value * 12 : value
          d.setMonth(d.getMonth() + months)
          return d.toISOString().slice(0, 10)
        }
      }
    }
    return ''
  }

  // Complex parties parsing with multiple fallback strategies
  let parties = []
  
  // Strategy 1: Parse from partiesJson string
  if (doc.partiesJson) {
    try {
      const parsedParties = JSON.parse(doc.partiesJson)
      parties = Array.isArray(parsedParties) ? parsedParties : []
    } catch (e) {
      console.warn('Failed to parse partiesJson:', e)
    }
  }
  
  // Strategy 2: Use direct parties array if available
  if (!parties.length && doc.parties) {
    parties = Array.isArray(doc.parties) ? doc.parties : []
  }
  
  // Strategy 3: Extract from nested payment details if available
  if (!parties.length && doc.paymentDetails?.parties) {
    parties = Array.isArray(doc.paymentDetails.parties) ? doc.paymentDetails.parties : []
  }

  // Complex description mapping with multiple fallbacks
  const getDescription = () => {
    // Priority order: contractObject > summary > description > object > ''
    return doc.contractObject || 
           doc.summary || 
           doc.description || 
           doc.object || 
           ''
  }

  // Complex title mapping with smart fallbacks
  const getTitle = () => {
    if (doc.title) return doc.title
    if (doc.contractNumber) return `Contract ${doc.contractNumber}`
    if (doc.documentType === 'CONTRACT') return `Contract ${doc.id}`
    return `Document ${doc.id}`
  }

  // Complex document type detection with smart logic
  const getDocumentType = () => {
    // Check multiple fields to determine if it's a contract
    if (doc.documentType) return doc.documentType
    if (doc.document_type) return doc.document_type
    
    // Smart detection based on content and category
    if (doc.category && ['Financial Report', 'User Guide', 'Business Plan', 'Project Report', 'Training Material', 'HR Document', 'Presentation', 'Meeting Minutes', 'Documentation'].includes(doc.category)) {
      return 'GENERAL_FILE'
    }
    
    // Smart detection based on content
    if (doc.contractType || doc.totalValue || doc.effectiveDate) {
      return 'CONTRACT'
    }
    
    return 'GENERAL_FILE' // Safer fallback
  }

  // Complex value calculation with multiple sources
  const getTotalValue = () => {
    // Try multiple sources for total value
    const value = doc.totalValue || 
                 doc.paymentDetails?.totalValue || 
                 doc.contractValue || 
                 doc.value || 
                 0
    return Number(value)
  }

  // Complex currency detection
  const getCurrency = () => {
    return doc.currency || 
           doc.paymentDetails?.currency || 
           doc.paymentCurrency || 
           'VND'
  }

  return {
    id: String(doc.id),
    title: getTitle(),
    description: getDescription(),
    status: doc.status || 'DRAFT',
    contractType: doc.contractType || doc.category || 'Other',
    tags: doc.tags || [],
    contractNumber: doc.contractNumber || doc.id,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
    parties: parties.map((p: any) => ({ 
      name: p.name || p.title || '', 
      role: p.role || p.type || p.position || '' 
    })),
    totalValue: getTotalValue(),
    currency: getCurrency(),
    effectiveDate: doc.effectiveDate || '',
    expiryDate: doc.expiryDate || 
               doc.endDate || 
               computeExpiryDate(doc.effectiveDate, doc.term) ||
               computeExpiryDate(doc.effectiveDate, doc.contractTerm) ||
               '',
    riskLevel: doc.riskLevel || doc.riskAssessment?.riskLevel,
    attachments: [],
    documentType: getDocumentType(),
    fileType: doc.fileType || doc.file_type,
    fileSize: doc.fileSize || doc.file_size,
    category: doc.category,
  }
}

export function mapPaginated<T>(payload: any, mapItem: (x: any) => T): Paginated<T> {
  // Xử lý cả 2 format: RestResponse và Page
  const data = payload?.data ?? payload
  
  // Format 1: RestResponse with nested structure (contracts)
  if (data?.content && data?.result) {
    return {
      content: data.content.map(mapItem),
      totalElements: Number(data.result.totalElements ?? 0),
      totalPages: Number(data.result.totalPages ?? 1),
    }
  }
  
  // Format 2: Direct Page response (documents)
  if (Array.isArray(data?.content)) {
    return {
      content: data.content.map(mapItem),
      totalElements: Number(data.totalElements ?? 0),
      totalPages: Number(data.totalPages ?? 1),
    }
  }
  
  // Fallback
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
  }
}



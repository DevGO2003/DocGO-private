// Navigation translations
export const navigationTranslations = {
  // Category titles
  'category.opened': 'Đang mở',
  'category.documents': 'Tài liệu',
  'category.management': 'Quản lý',
  'category.administration': 'Quản trị',

  // Items (short labels)
  'navigation.dashboard': 'Trang chủ',
  'navigation.createDocument': 'Tạo mới',
  'navigation.uploadDocument': 'Upload',
  'navigation.analytics': 'Phân tích',
  'navigation.documents': 'Tài liệu',
  'navigation.contracts': 'Hợp đồng',
  'navigation.importDocument': 'Import',
  'navigation.eSignature': 'Ký số',
  'navigation.collaboration': 'Cộng tác',
  'navigation.versions': 'Phiên bản',
  'navigation.approval': 'Phê duyệt',
  'navigation.permissions': 'Quyền',
  'navigation.approved': 'Đã duyệt',
  'navigation.reports': 'Báo cáo',
  'navigation.users': 'Người dùng',
  'navigation.organization': 'Tổ chức',
  'navigation.accountApproval': 'Duyệt TK',
  'navigation.notifications': 'Thông báo',
  'navigation.calendar': 'Lịch',
  'navigation.activity': 'Nhật ký',
  'navigation.backup': 'Sao lưu',
  'navigation.integrations': 'Tích hợp',
  'navigation.help': 'Trợ giúp',
  'navigation.settings': 'Cài đặt',
  'navigation.aiProcessing': 'AI',
} as const

export const getNavigationTranslation = (key: string): string => {
  return navigationTranslations[key as keyof typeof navigationTranslations] || key
}



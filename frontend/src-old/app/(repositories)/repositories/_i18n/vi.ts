export const vi = {
  // Common
  common: {
    noData: 'Không có thông tin',
    loading: 'Đang tải...',
    error: 'Có lỗi xảy ra',
    save: 'Lưu',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Chỉnh sửa',
    view: 'Xem',
    download: 'Tải xuống',
    upload: 'Tải lên',
    search: 'Tìm kiếm',
  },

  // Contract fields
  contract: {
    notContract: 'Đây không phải là file hợp đồng',
    effectiveDate: 'Ngày hiệu lực',
    expiryDate: 'Ngày hết hạn',
    totalValue: 'Tổng giá trị',
    currency: 'Đơn vị tiền tệ',
    project: 'Dự án',
    department: 'Bộ phận quản lý',
    priority: 'Mức độ ưu tiên',
    confidentiality: 'Mức bảo mật',
    summary: 'Tóm tắt hợp đồng',
  },

  // Overview fields
  overview: {
    title: 'Tiêu đề',
    status: 'Trạng thái',
    documentType: 'Loại tài liệu',
    contractType: 'Loại hợp đồng',
    category: 'Danh mục',
    tags: 'Tags',
    owner: 'Chủ sở hữu',
    language: 'Ngôn ngữ',
    region: 'Khu vực',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',
  },

  // Parties
  parties: {
    title: 'Các bên tham gia',
    name: 'Tên',
    type: 'Loại',
    role: 'Vai trò',
    email: 'Email',
    phone: 'Điện thoại',
    address: 'Địa chỉ',
    representative: 'Đại diện',
    position: 'Chức vụ',
    taxCode: 'Mã số thuế',
  },

  // Payment
  payment: {
    title: 'Lịch thanh toán',
    milestone: 'Mốc',
    percentage: 'Phần trăm',
    amount: 'Số tiền',
    dueDate: 'Hạn chót',
    status: 'Trạng thái',
    method: 'Phương thức',
  },

  // Status values
  status: {
    ACTIVE: 'Đang hoạt động',
    DRAFT: 'Bản nháp',
    DELETED: 'Đã xóa',
    ARCHIVED: 'Đã lưu trữ',
    INACTIVE: 'Không hoạt động',
    PENDING: 'Chờ xử lý',
    COMPLETED: 'Hoàn thành',
    IN_PROGRESS: 'Đang thực hiện',
    FAILED: 'Thất bại',
  },

  // Priority
  priority: {
    HIGH: 'Cao',
    MEDIUM: 'Trung bình',
    LOW: 'Thấp',
  },

  // Confidentiality
  confidentiality: {
    CONFIDENTIAL: 'Mật',
    INTERNAL: 'Nội bộ',
    PUBLIC: 'Công khai',
    RESTRICTED: 'Hạn chế',
  },
}

export type Translations = typeof vi

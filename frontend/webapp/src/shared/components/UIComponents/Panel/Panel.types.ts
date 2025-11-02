export interface HeaderPanelProps {
  title: string; // ✅ REQUIRED - Tiêu đề chính
  subtitle?: string; // Phụ đề (ví dụ: "Mã: ABC123")
  description: string; // ✅ REQUIRED - Mô tả nội dung trang
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    current?: boolean;
  }>;
  children?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
  maxHeightDesktop?: number;
  maxHeightTablet?: number;
  maxHeightMobile?: number;
}

export interface CommonPanelProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export interface WindowPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

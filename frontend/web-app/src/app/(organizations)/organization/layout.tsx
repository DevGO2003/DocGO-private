import { DashboardLayout } from '@/components/layout'

export const metadata = {
  title: 'DocGO - Organization Management',
  description: 'Quản lý tổ chức và thành viên',
}

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout>
      {children}
    </DashboardLayout>
  )
}

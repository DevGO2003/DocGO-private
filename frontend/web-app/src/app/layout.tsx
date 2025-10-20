import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DocGO - Quản lý tài liệu và hợp đồng thông minh',
  description: 'Nền tảng quản lý tài liệu và hợp đồng thông minh, giúp doanh nghiệp tối ưu hóa quy trình làm việc và tăng hiệu quả kinh doanh.',
  authors: [{ name: 'DevGO2003' }],
  keywords: 'quản lý tài liệu, hợp đồng, AI, tự động hóa, doanh nghiệp',
  creator: 'DevGO2003',
  publisher: 'DevGO2003',
  robots: 'index, follow',
  openGraph: {
    title: 'DocGO - Quản lý tài liệu và hợp đồng thông minh',
    description: 'Nền tảng quản lý tài liệu và hợp đồng thông minh, giúp doanh nghiệp tối ưu hóa quy trình làm việc.',
    siteName: 'DocGO',
    locale: 'vi_VN',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DocGO - Quản lý tài liệu và hợp đồng thông minh',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DocGO - Quản lý tài liệu và hợp đồng thông minh',
    description: 'Nền tảng quản lý tài liệu và hợp đồng thông minh, giúp doanh nghiệp tối ưu hóa quy trình làm việc.',
    images: ['/og-image.png'],
  },
  icons: {
    shortcut: '/favicon.ico',
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('unhandledrejection', function(event) {
                console.error('Unhandled promise rejection:', event.reason);
                // Có thể thêm logic xử lý lỗi tại đây
              });
              
              window.addEventListener('error', function(event) {
                console.error('Global error:', event.error);
                // Có thể thêm logic xử lý lỗi tại đây
              });
            `,
          }}
        />
        {children}
      </body>
    </html>
  )
}
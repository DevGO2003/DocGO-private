'use client'

export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="p-6 text-red-600">{error?.message || 'Đã có lỗi xảy ra.'}</div>
  )
}



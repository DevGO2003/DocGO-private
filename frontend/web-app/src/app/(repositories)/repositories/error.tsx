export default function Error({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="p-6 text-red-600">
      <h2>Đã xảy ra lỗi</h2>
      <p>{error.message}</p>
    </div>
  )
}












































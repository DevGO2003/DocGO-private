'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout'

export default function TaoNhanhPage() {
  const [file, setFile] = useState<File | null>(null)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleUpload = async () => {
    setLoading(true)
    try {
      let res
      if (file) {
        const form = new FormData()
        form.append('file', file)
        res = await fetch('/api/mock/ocr', { method: 'POST', body: form })
      } else {
        res = await fetch('/api/mock/ocr', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) })
      }
      const json = await res.json()
      setResult(json?.data)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!result) return
    const res = await fetch('/api/mock/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: result.title,
        contractType: result.contractType,
        tags: result.tags,
        object: result.object,
        effectiveDate: result.effectiveDate,
        term: result.term,
        terminationConditions: result.terminationConditions,
        content: result.content,
        paymentDetails: result.paymentDetails,
        parties: result.parties,
        keyClauses: result.keyClauses,
        favorableClauses: result.favorableClauses,
        unfavorableClauses: result.unfavorableClauses,
        reminders: result.reminders,
        riskAssessment: result.riskAssessment,
        complianceStatus: result.complianceStatus,
        status: 'DRAFT',
      })
    })
    const json = await res.json()
    alert(`Tạo hợp đồng mock thành công: ${json?.data?.title}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo nhanh (mock OCR)</h1>
          <p className="text-gray-600">Upload file hoặc nhập văn bản để trích xuất demo và tạo hợp đồng nháp.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nhập liệu */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Chọn file</label>
                <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hoặc nhập văn bản</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  placeholder="Dán nội dung hợp đồng ở đây..."
                  className="mt-1 w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Đang trích xuất...' : 'Trích xuất mock'}
                </button>
              </div>
            </div>
          </div>

          {/* Kết quả */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-3">Kết quả trích xuất</h3>
            {!result ? (
              <p className="text-gray-600">Chưa có dữ liệu. Hãy trích xuất trước.</p>
            ) : (
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">Tiêu đề:</span> {result.title}</div>
                <div><span className="font-medium">Loại:</span> {result.contractType}</div>
                <div><span className="font-medium">Tags:</span> {(result.tags||[]).join(', ')}</div>
                <div><span className="font-medium">Đối tượng:</span> {result.object}</div>
                <div><span className="font-medium">Hiệu lực:</span> {result.effectiveDate}</div>
                <div><span className="font-medium">Thời hạn:</span> {result.term}</div>
                <div><span className="font-medium">Thanh toán:</span> {result.paymentDetails?.totalValue?.toLocaleString('vi-VN')} {result.paymentDetails?.currency}</div>
                <div className="mt-3"><span className="font-medium">Nội dung:</span>
                  <pre className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg border text-gray-700">{result.content}</pre>
                </div>
                <div className="pt-3">
                  <button onClick={handleCreate} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">Tạo hợp đồng nháp</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}



'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { useParams } from 'next/navigation'
import { contractAPI } from '@/lib/api'
import { useTranslation } from '@/hooks/useTranslation'
import { translateContractType, translateContractStatus, translateContractTag } from '@/utils/tagTranslations'
import { DocumentDetailTabs } from '@/components/DocumentDetail/DocumentDetailTabs'

export default function DocumentDetailPage() {
  const params = useParams() as { id: string }
  const { t } = useTranslation()
  const [data, setData] = useState<any>(null)
  const [contractSummary, setContractSummary] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true)
      try {
        setError('')
        // Mock data for id=1 with diverse and rich content
        if (params.id === '1') {
          const mockData = {
            id: '1',
            title: 'Hợp đồng cung cấp dịch vụ IT - Công ty ABC',
            description: 'Hợp đồng cung cấp dịch vụ IT bao gồm phát triển phần mềm, bảo trì hệ thống và hỗ trợ kỹ thuật 24/7',
            status: 'PENDING_REVIEW',
            contractType: 'SERVICE_AGREEMENT',
            tags: ['IT', 'Dịch vụ', 'Phần mềm', 'Bảo trì', 'Cloud', 'Security', 'AI', 'Digital Transformation'],
            parties: [
              { 
                name: 'Công ty TNHH Công nghệ ABC', 
                role: 'Khách hàng', 
                representative: 'Nguyễn Văn Anh', 
                taxCode: '0123456789', 
                contact: '0901234567', 
                address: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
                businessLicense: 'BL-2024-001'
              },
              { 
                name: 'Công ty TNHH DocGO Solutions', 
                role: 'Nhà cung cấp', 
                representative: 'Trần Thị Bình', 
                taxCode: '9876543210', 
                contact: '0987654321', 
                address: '456 Đường Nguyễn Huệ, Quận 3, TP. Hồ Chí Minh',
                businessLicense: 'BL-2024-002'
              },
            ],
            effectiveDate: '2024-02-01',
            expiryDate: '2025-01-31',
            paymentDetails: {
              totalValue: 2500000000,
              currency: 'VND',
              schedule: 'Thanh toán 30% khi ký hợp đồng, 40% khi hoàn thành 50% tiến độ, 20% khi nghiệm thu, 10% sau bảo hành 3 tháng',
              paymentMethod: 'Chuyển khoản ngân hàng'
            },
            keyClauses: [
              { name: 'Phạm vi công việc', description: 'Phát triển hệ thống quản lý tài liệu số với AI và machine learning', importance: 'High', risk: 'LOW' },
              { name: 'Thời gian thực hiện', description: '8 tháng kể từ ngày ký hợp đồng', importance: 'High', risk: 'MEDIUM' },
              { name: 'Bảo hành', description: '18 tháng bảo hành toàn diện và hỗ trợ kỹ thuật 24/7', importance: 'High', risk: 'LOW' },
              { name: 'Bảo mật dữ liệu', description: 'Tuân thủ ISO 27001 và GDPR trong xử lý dữ liệu', importance: 'High', risk: 'LOW' },
              { name: 'Quyền sở hữu trí tuệ', description: 'Khách hàng sở hữu source code và bản quyền phần mềm', importance: 'Medium', risk: 'LOW' },
            ],
            favorableClauses: [
              { clauseName: 'Bảo hành mở rộng', description: 'Bảo hành 18 tháng thay vì 12 tháng thông thường', benefitTo: 'Khách hàng' },
              { clauseName: 'Hỗ trợ 24/7', description: 'Hỗ trợ kỹ thuật 24/7 trong suốt thời gian bảo hành', benefitTo: 'Khách hàng' },
              { clauseName: 'Training miễn phí', description: 'Đào tạo sử dụng hệ thống cho 10 nhân viên', benefitTo: 'Khách hàng' },
            ],
            unfavorableClauses: [
              { clauseName: 'Phạt chậm tiến độ', description: 'Phạt 0.5% giá trị hợp đồng mỗi tuần chậm tiến độ', riskTo: 'Nhà cung cấp' },
              { clauseName: 'Thay đổi yêu cầu', description: 'Phí 10% cho mỗi thay đổi yêu cầu lớn', riskTo: 'Khách hàng' },
            ],
            reminders: [
              { type: 'Phê duyệt pháp lý', date: '2024-01-25', content: 'Cần phê duyệt từ phòng pháp lý và tuân thủ quy định về bảo mật' },
              { type: 'Ký số điện tử', date: '2024-01-30', content: 'Hoàn tất ký số điện tử từ tất cả các bên tham gia' },
              { type: 'Khởi động dự án', date: '2024-02-05', content: 'Meeting kick-off và bàn giao tài liệu kỹ thuật' },
              { type: 'Báo cáo tiến độ', date: '2024-03-01', content: 'Báo cáo tiến độ tháng đầu tiên' },
              { type: 'Nghiệm thu giai đoạn 1', date: '2024-06-01', content: 'Nghiệm thu và thanh toán 40% giá trị hợp đồng' },
            ],
            riskAssessment: {
              riskLevel: 'MEDIUM',
              riskFactors: [
                'Phụ thuộc vào bên thứ ba cho infrastructure',
                'Thay đổi yêu cầu trong quá trình phát triển',
                'Rủi ro bảo mật dữ liệu khách hàng',
                'Thiếu nhân lực có kinh nghiệm AI/ML'
              ],
              mitigationMeasures: [
                'Hợp đồng rõ ràng về SLA và penalties',
                'Giao tiếp thường xuyên và báo cáo định kỳ',
                'Implement security framework ISO 27001',
                'Đào tạo và tuyển dụng thêm chuyên gia AI'
              ]
            },
            complianceStatus: {
              status: 'REVIEW_REQUIRED',
              issues: [
                'Chưa có chữ ký số từ tất cả các bên',
                'Cần bổ sung điều khoản GDPR compliance',
                'Thiếu thông tin về disaster recovery plan'
              ],
              recommendations: [
                'Hoàn tất ký số điện tử trước ngày 30/01',
                'Thêm điều khoản xử lý dữ liệu cá nhân theo GDPR',
                'Bổ sung kế hoạch backup và disaster recovery'
              ]
            },
            content: `
              ĐIỀU 1: ĐỐI TƯỢNG HỢP ĐỒNG
              Bên A đồng ý thuê và Bên B đồng ý cung cấp dịch vụ phát triển hệ thống quản lý tài liệu theo các yêu cầu kỹ thuật đã được thống nhất trong Phụ lục A.

              ĐIỀU 2: THỜI GIAN THỰC HIỆN
              Thời gian thực hiện hợp đồng là 06 (sáu) tháng kể từ ngày hợp đồng có hiệu lực.

              ĐIỀU 3: GIÁ TRỊ HỢP ĐỒNG VÀ PHƯƠNG THỨC THANH TOÁN
              Tổng giá trị hợp đồng là 500.000.000 VNĐ (Năm trăm triệu đồng Việt Nam).
              Thanh toán được thực hiện theo 3 đợt:
              - Đợt 1: 30% sau khi ký hợp đồng.
              - Đợt 2: 40% sau khi hoàn thành 50% công việc.
              - Đợt 3: 30% sau khi nghiệm thu toàn bộ hệ thống.

              ĐIỀU 4: QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
              Bên A có quyền kiểm tra, giám sát tiến độ và chất lượng dịch vụ. Bên B có nghĩa vụ cung cấp dịch vụ đúng tiến độ, đảm bảo chất lượng và bảo mật thông tin.

              ĐIỀU 5: BẢO HÀNH VÀ BẢO TRÌ
              Bên B cam kết bảo hành hệ thống trong 12 tháng sau khi nghiệm thu.

              ĐIỀU 6: CHẤM DỨT HỢP ĐỒNG
              Hợp đồng có thể chấm dứt trước thời hạn nếu một trong hai bên vi phạm nghiêm trọng các điều khoản hoặc theo thỏa thuận của hai bên.

              ĐIỀU 7: GIẢI QUYẾT TRANH CHẤP
              Mọi tranh chấp phát sinh từ hoặc liên quan đến hợp đồng sẽ được giải quyết thông qua thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được đưa ra Tòa án có thẩm quyền giải quyết.
            `,
            authorNotes: [
              { user: 'Admin', time: '2024-07-20 10:00', content: 'Cần theo dõi chặt chẽ tiến độ của Bên B.' },
              { user: 'Admin', time: '2024-07-21 14:30', content: 'Đã gửi yêu cầu chỉnh sửa điều khoản bảo hành.' }
            ],
            fileSystemMetadata: {
              dateModified: '2024-07-22T10:00:00Z',
              dateAdded: '2024-07-19T08:30:00Z',
              mediaFilename: 'hop_dong_it_abc.pdf',
              originalFilename: 'hop_dong_it_abc_v1.docx',
              originalMD5: 'abcdef1234567890',
              originalFileSize: 1024000,
              originalMimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              archiveMD5: 'fedcba0987654321',
              archiveFileSize: 512000
            },
            originalDocumentMetadata: {
              dcFormat: 'application/pdf',
              dcTitle: 'Hợp đồng cung cấp dịch vụ IT',
              dcCreator: 'Nguyễn Văn A',
              dcDescription: 'Hợp đồng dịch vụ phát triển phần mềm',
              dcSubject: 'IT, Phần mềm, Dịch vụ',
              xmpCreateDate: '2024-01-10T09:00:00Z',
              xmpCreatorTool: 'Microsoft Word',
              xmpModifyDate: '2024-01-15T10:30:00Z',
              xmpMetadataDate: '2024-01-15T10:30:00Z',
              pdfKeywords: 'hợp đồng, IT, dịch vụ',
              pdfProducer: 'Microsoft Print to PDF',
              xmpDocumentID: 'uuid:1234-5678-90ab-cdef',
              xmpInstanceID: 'uuid:fedc-ba98-7654-3210',
              pdfaExtensionSchemas: ['PDF/A-1b']
            },
            archivedDocumentMetadata: {
              archivedPdfProducer: 'Paperless-ngx Archiver',
              archivedMetadataDate: '2024-07-22T11:00:00Z',
              archivedModifyDate: '2024-07-22T11:00:00Z',
              archivedCreateDate: '2024-07-22T11:00:00Z',
              archivedCreatorTool: 'Paperless-ngx',
              archivedDocumentID: 'uuid:archived-1234-5678',
              archivedDcFormat: 'application/pdf',
              archivedDcTitle: 'Hợp đồng cung cấp dịch vụ IT (Archived)',
              archivedDcCreator: 'DocGO System'
            }
          }
          setData(mockData)
        } else {
          const res = await contractAPI.getContract(String(params.id))
          const c: any = res.data?.data
          const mapped = {
            id: c.id,
            title: c.title || c.contractNumber || `Contract ${c.id}`,
            description: c.object || c.description || '',
            status: c.status || 'DRAFT',
            contractType: c.contractType || 'Other',
            tags: c.tags || [],
            parties: (c.parties || []).map((p: any) => ({
              name: p.name || '',
              role: p.role || '',
              representative: p.representative,
              taxCode: p.taxCode,
              contact: p.contact,
              address: p.address,
            })),
            effectiveDate: c.effectiveDate || '',
            expiryDate: c.expiryDate || '',
            paymentDetails: {
              totalValue: Number(c.paymentDetails?.totalValue || 0),
              currency: c.paymentDetails?.currency || 'VND',
              schedule: c.paymentDetails?.schedule || '',
              paymentMethod: c.paymentDetails?.paymentMethod || '',
            },
            keyClauses: c.keyClauses || [],
            unfavorableClauses: c.unfavorableClauses || [],
            reminders: c.reminders || [],
            riskAssessment: c.riskAssessment || { riskLevel: 'LOW', riskFactors: [], mitigationMeasures: [] },
            complianceStatus: c.complianceStatus || { status: 'COMPLIANT', issues: [], recommendations: [] },
            content: c.content || c.object || '',
          }
          setData(mapped)
        }

        // Fetch contract summary mock data
        const summaryRes = await fetch('/mock/contract-summary.json')
        const summaryData = await summaryRes.json()
        setContractSummary(summaryData.contract_summary)

      } catch (e: any) {
        console.error('Error fetching contract detail:', e)
        setError(`Lỗi kết nối máy chủ: ${e.message || 'Unknown error'}`)
        setData(null)
        setContractSummary(null)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [params.id])

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[40vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 text-red-600">{error}</div>
      </DashboardLayout>
    )
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-6">Không tìm thấy tài liệu.</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Fancy Header */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">{data.title}</h1>
              <p className="text-gray-600">Mã: HD-{data.id} · Loại: {translateContractType(data.contractType, t)}</p>
            </div>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm rounded-full border ${badgeClass(data.status)}`}>{translateContractStatus(data.status, t)}</span>
              <span className="px-3 py-1 text-sm rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">{translateContractType(data.contractType, t)}</span>
            </div>
          </div>
          <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl" />
        </div>

        {/* Action Bar */}
        <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Hành động:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium shadow-sm">
                📝 Chỉnh sửa
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium shadow-sm">
                📤 Gửi duyệt
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium shadow-sm">
                📋 Tạo phiên bản
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium shadow-sm">
                ✍️ Gửi ký
              </button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium shadow-sm">
                📄 Tải PDF
              </button>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium shadow-sm">
                💬 Bình luận
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium shadow-sm">
                🗑️ Xóa
              </button>
            </div>
          </div>
        </div>

        {/* Document Detail Tabs */}
        <DocumentDetailTabs documentData={data} contractSummary={contractSummary} />
      </div>
    </DashboardLayout>
  )
}

function badgeClass(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-50 text-gray-700 border-gray-200'
    case 'PENDING_REVIEW':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'APPROVED':
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'ACTIVE':
      return 'bg-green-50 text-green-700 border-green-200'
    case 'EXPIRED':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    case 'TERMINATED':
      return 'bg-red-50 text-red-700 border-red-200'
    case 'ARCHIVED':
      return 'bg-slate-50 text-slate-700 border-slate-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}
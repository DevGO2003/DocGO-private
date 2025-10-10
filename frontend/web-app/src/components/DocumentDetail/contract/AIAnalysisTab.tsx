'use client'

import React from 'react'
import { AIAnalysisCard } from '../AIAnalysisCard'

interface Recommendation {
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  description: string
  action?: string
}

interface AIAnalysisTabProps {
  documentData: any
}

export function AIAnalysisTab({ documentData }: AIAnalysisTabProps) {
  // Mock AI analysis data with more diverse recommendations
  const aiAnalysisData = {
    riskLevel: documentData?.riskAssessment?.riskLevel || 'MEDIUM',
    confidence: 87,
    warnings: 3,
    recommendations: [
      {
        type: 'warning' as const,
        title: 'Điều khoản thanh toán cần xem xét',
        description: 'Điều khoản thanh toán có thể gây rủi ro cho doanh nghiệp do tỷ lệ thanh toán trước quá cao',
        action: 'Xem xét lại điều khoản thanh toán với pháp lý'
      },
      {
        type: 'error' as const,
        title: 'Thiếu điều khoản bảo mật thông tin',
        description: 'Hợp đồng chưa có điều khoản rõ ràng về bảo mật và bảo vệ dữ liệu khách hàng',
        action: 'Bổ sung điều khoản bảo mật thông tin chi tiết'
      },
      {
        type: 'success' as const,
        title: 'Điều khoản bảo hiểm đầy đủ',
        description: 'Các điều khoản bảo hiểm và bảo hành đã được thiết lập đầy đủ và rõ ràng',
        action: 'Tiếp tục duy trì'
      },
      {
        type: 'info' as const,
        title: 'Thời gian thực hiện hợp lý',
        description: 'Thời gian 6 tháng cho dự án phát triển phần mềm là phù hợp với phạm vi công việc',
        action: 'Theo dõi tiến độ định kỳ'
      }
    ] as Recommendation[],
    keyClauses: documentData?.keyClauses || [
      { name: 'Phạm vi công việc', description: 'Phát triển hệ thống quản lý tài liệu', importance: 'High', risk: 'LOW' },
      { name: 'Thời gian thực hiện', description: '6 tháng kể từ ngày ký', importance: 'High', risk: 'MEDIUM' },
      { name: 'Bảo hành', description: '12 tháng sau nghiệm thu', importance: 'Medium', risk: 'LOW' }
    ]
  }

  return (
    <div className="space-y-6">
      {/* AI Analysis Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">🤖 Phân tích AI</h3>
          <span className="text-sm text-gray-500">Độ tin cậy: {aiAnalysisData.confidence}%</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${
                aiAnalysisData.riskLevel === 'LOW' ? 'bg-green-500' :
                aiAnalysisData.riskLevel === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium text-gray-900">Mức độ rủi ro</span>
            </div>
            <p className="text-lg font-bold text-gray-900 capitalize">{aiAnalysisData.riskLevel.toLowerCase()}</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Độ tin cậy</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{aiAnalysisData.confidence}%</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-gray-900">Cảnh báo</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{aiAnalysisData.warnings}</p>
          </div>
        </div>
      </div>

      {/* Main AI Analysis Card */}
      <AIAnalysisCard {...aiAnalysisData} />

      {/* Additional AI Insights */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">💡 Gợi ý thêm từ AI</h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              ✓
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-900">Điểm mạnh của hợp đồng</h5>
              <p className="text-sm text-gray-600 mt-1">
                Hợp đồng có cấu trúc rõ ràng, điều khoản thanh toán minh bạch và thời gian thực hiện hợp lý.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              ⚠
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-900">Cần cải thiện</h5>
              <p className="text-sm text-gray-600 mt-1">
                Nên bổ sung điều khoản về xử lý sự cố và hỗ trợ kỹ thuật 24/7 trong thời gian bảo hành.
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
              💡
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-900">Đề xuất tối ưu</h5>
              <p className="text-sm text-gray-600 mt-1">
                Cân nhắc thêm điều khoản về quyền sở hữu trí tuệ và bảo vệ tài sản dữ liệu của khách hàng.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Factors Analysis */}
      {documentData?.riskAssessment && (
        <div className="bg-white border rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">📊 Phân tích yếu tố rủi ro</h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Các yếu tố rủi ro:</h5>
              <div className="flex flex-wrap gap-2">
                {documentData.riskAssessment.riskFactors?.map((factor: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 text-red-800">
                    {factor}
                  </span>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Biện pháp giảm thiểu:</h5>
              <div className="flex flex-wrap gap-2">
                {documentData.riskAssessment.mitigationMeasures?.map((measure: string, index: number) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    {measure}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

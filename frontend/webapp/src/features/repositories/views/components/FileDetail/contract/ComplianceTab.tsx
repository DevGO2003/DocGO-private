import { ShieldCheck, AlertCircle, Lightbulb } from 'lucide-react';
import { Card, CardContent } from '@shared/components';

interface ComplianceTabProps {
  data: any;
}

export function ComplianceTab({ data }: ComplianceTabProps) {
  const compliance = data?.complianceStatus || data?.compliance;

  if (!compliance) {
    return (
      <div className="text-center text-gray-500 py-8">Không có dữ liệu tuân thủ</div>
    );
  }

  const statusColors: Record<string, string> = {
    COMPLIANT: 'bg-green-100 text-green-800 border-green-300',
    PARTIAL_COMPLIANT: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    NON_COMPLIANT: 'bg-red-100 text-red-800 border-red-300',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const statusLabels: Record<string, string> = {
    COMPLIANT: 'Tuân thủ',
    PARTIAL_COMPLIANT: 'Tuân thủ một phần',
    NON_COMPLIANT: 'Không tuân thủ',
    UNDER_REVIEW: 'Đang xem xét',
  };

  return (
    <div className="space-y-6">
      {/* Compliance Status */}
      {compliance.status && (
        <Card
          className={`border-2 ${
            statusColors[compliance.status] || 'bg-gray-100 text-gray-800 border-gray-300'
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Trạng thái tuân thủ</h3>
                <p className="text-2xl font-bold mt-1">
                  {statusLabels[compliance.status] || compliance.status}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Compliance Issues */}
      {compliance.issues && compliance.issues.length > 0 && (
        <Card className="border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-red-900">
                Vấn đề tuân thủ ({compliance.issues.length})
              </h3>
            </div>

            <div className="space-y-3">
              {compliance.issues.map((issue: any, idx: number) => (
                <div key={idx} className="border-l-4 border-red-400 pl-4 py-3 bg-red-50">
                  <p className="font-medium text-red-900 mb-1">
                    {typeof issue === 'string' ? `Vấn đề ${idx + 1}` : issue.title || `Vấn đề ${idx + 1}`}
                  </p>
                  <p className="text-sm text-gray-700">
                    {typeof issue === 'string' ? issue : issue.description || issue}
                  </p>
                  {typeof issue === 'object' && issue.severity && (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-200 text-red-800 rounded text-xs font-medium">
                      Mức độ: {issue.severity}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {compliance.recommendations && compliance.recommendations.length > 0 && (
        <Card className="border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">
                Khuyến nghị ({compliance.recommendations.length})
              </h3>
            </div>

            <div className="space-y-3">
              {compliance.recommendations.map((recommendation: any, idx: number) => (
                <div key={idx} className="border-l-4 border-blue-400 pl-4 py-3 bg-blue-50">
                  <p className="font-medium text-blue-900 mb-1">
                    {typeof recommendation === 'string'
                      ? `Khuyến nghị ${idx + 1}`
                      : recommendation.title || `Khuyến nghị ${idx + 1}`}
                  </p>
                  <p className="text-sm text-gray-700">
                    {typeof recommendation === 'string'
                      ? recommendation
                      : recommendation.description || recommendation}
                  </p>
                  {typeof recommendation === 'object' && recommendation.priority && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                      Ưu tiên: {recommendation.priority}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Info */}
      {compliance.notes && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-3">Ghi chú bổ sung</h3>
            <p className="text-gray-700 leading-relaxed">{compliance.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

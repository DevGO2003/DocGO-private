import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Card, CardContent } from '@shared/components';

interface ComplianceTabProps {
  data: any;
}

export function ComplianceTab({ data }: ComplianceTabProps) {
  const compliance = data?.complianceStatus || data?.compliance;

  if (!compliance) {
    return (
      <div className="py-8" style={ color: '#6b7280' }>Không có dữ liệu tuân thủ</div>
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
              <CommonIcon name="shield" className="w-8 h-8" />
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
        <Card style={ borderColor: '#fecaca' }>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CommonIcon name="alert-circle" style={ color: '#dc2626' } />
              <h3 className="text-lg font-semibold" style={ color: '#7f1d1d' }>
                Vấn đề tuân thủ ({compliance.issues.length})
              </h3>
            </div>

            <div className="space-y-3">
              {compliance.issues.map((issue: any, idx: number) => (
                <div key={idx} className="border-l-4 pl-4 py-3" style={ borderColor: '#f87171' } style={ backgroundColor: '#fef2f2' }>
                  <p className="font-medium mb-1" style={ color: '#7f1d1d' }>
                    {typeof issue === 'string' ? `Vấn đề ${idx + 1}` : issue.title || `Vấn đề ${idx + 1}`}
                  </p>
                  <p className="text-sm" style={ color: '#374151' }>
                    {typeof issue === 'string' ? issue : issue.description || issue}
                  </p>
                  {typeof issue === 'object' && issue.severity && (
                    <span className="inline-block mt-2 px-2 py-1 bg-red-200 rounded text-xs font-medium" style={ color: '#991b1b' }>
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
        <Card style={ borderColor: '#bfdbfe' }>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CommonIcon name="alert-circle" style={ color: '#2563eb' } />
              <h3 className="text-lg font-semibold" style={ color: '#1e3a8a' }>
                Khuyến nghị ({compliance.recommendations.length})
              </h3>
            </div>

            <div className="space-y-3">
              {compliance.recommendations.map((recommendation: any, idx: number) => (
                <div key={idx} className="border-l-4 pl-4 py-3" style={ borderColor: '#60a5fa' } style={ backgroundColor: '#eff6ff' }>
                  <p className="font-medium mb-1" style={ color: '#1e3a8a' }>
                    {typeof recommendation === 'string'
                      ? `Khuyến nghị ${idx + 1}`
                      : recommendation.title || `Khuyến nghị ${idx + 1}`}
                  </p>
                  <p className="text-sm" style={ color: '#374151' }>
                    {typeof recommendation === 'string'
                      ? recommendation
                      : recommendation.description || recommendation}
                  </p>
                  {typeof recommendation === 'object' && recommendation.priority && (
                    <span className="inline-block mt-2 px-2 py-1 rounded text-xs font-medium" style={ backgroundColor: '#bfdbfe' }>
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
            <p style={ color: '#374151' }>{compliance.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Card, CardContent } from '@shared/components';

interface ClausesTabProps {
  data: any;
}

export function ClausesTab({ data }: ClausesTabProps) {
  const clauses = data?.keyClauses || data?.clauses;
  const unfavorable = data?.unfavorableClauses;

  if (!clauses && !unfavorable) {
    return (
      <div className="text-center text-gray-500 py-8">Không có dữ liệu điều khoản</div>
    );
  }

  const riskColors: Record<string, string> = {
    low: 'bg-green-100 text-green-800',
    LOW: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
    HIGH: 'bg-red-100 text-red-800',
  };

  const importanceColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    LOW: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    high: 'bg-purple-100 text-purple-800',
    HIGH: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className="space-y-3">
      {/* Key Clauses */}
      {clauses && clauses.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CommonIcon name="check" className="w-4 h-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                Điều khoản chính ({clauses.length})
              </h3>
            </div>

            <div className="space-y-2">
              {clauses.map((clause: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-gradient-to-r from-green-50 to-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-gray-900">{clause.name}</h4>
                    <div className="flex gap-1">
                      {clause.importance && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            importanceColors[clause.importance] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {clause.importance}
                        </span>
                      )}
                      {clause.risk && (
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            riskColors[clause.risk] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {clause.risk}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 mb-2">{clause.description}</p>

                  {clause.content && (
                    <div className="bg-white p-2 rounded text-xs italic text-gray-600 mb-2 border border-gray-200">
                      {clause.content}
                    </div>
                  )}

                  {clause.advice && (
                    <div className="bg-blue-50 p-2 rounded text-xs border border-blue-200">
                      <span className="font-medium text-blue-900">💡 </span>
                      <span className="text-blue-800">{clause.advice}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unfavorable Clauses */}
      {unfavorable && unfavorable.length > 0 && (
        <Card className="border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CommonIcon name="alert-circle" className="w-4 h-4 text-red-600" />
              <h3 className="text-sm font-semibold text-red-900">
                Điều khoản bất lợi ({unfavorable.length})
              </h3>
            </div>

            <div className="space-y-2">
              {unfavorable.map((clause: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-red-200 rounded-lg p-3 bg-gradient-to-r from-red-50 to-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-red-900">{clause.name}</h4>
                    {clause.risk && (
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          riskColors[clause.risk] || 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        Risk: {clause.risk}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-2">{clause.description}</p>

                  {clause.content && (
                    <div className="bg-white p-3 rounded text-sm italic text-gray-600 mb-2 border border-red-100">
                      {clause.content}
                    </div>
                  )}

                  {clause.advice && (
                    <div className="bg-yellow-50 p-3 rounded text-sm border border-yellow-200">
                      <span className="font-medium text-yellow-900">⚠️ Khuyến nghị: </span>
                      <span className="text-yellow-800">{clause.advice}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

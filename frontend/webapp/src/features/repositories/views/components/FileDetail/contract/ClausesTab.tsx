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
      <div className="py-8" style={{ color: '#6b7280' }} >Không có dữ liệu điều khoản</div>
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
              <CommonIcon name="check" style={{ color: '#16a34a' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#111827' }} >
                Điều khoản chính ({clauses.length})
              </h3>
            </div>

            <div className="space-y-2">
              {clauses.map((clause: any, idx: number) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-gradient-to-r from-green-50 to-white" style={{ borderColor: '#e5e7eb' }} >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm" style={{ color: '#111827' }} >{clause.name}</h4>
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

                  <p className="text-xs mb-2" style={{ color: '#374151' }} >{clause.description}</p>

                  {clause.content && (
                    <div className="p-2 rounded text-xs mb-2 border" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', color: '#4b5563' }} >
                      {clause.content}
                    </div>
                  )}

                  {clause.advice && (
                    <div className="p-2 rounded text-xs border" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} >
                      <span className="font-medium" style={{ color: '#1e3a8a' }} >💡 </span>
                      <span style={{ color: '#1e40af' }} >{clause.advice}</span>
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
        <Card style={{ borderColor: '#fecaca' }} >
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <CommonIcon name="alert-circle" style={{ color: '#dc2626' }} />
              <h3 className="text-sm font-semibold" style={{ color: '#7f1d1d' }} >
                Điều khoản bất lợi ({unfavorable.length})
              </h3>
            </div>

            <div className="space-y-2">
              {unfavorable.map((clause: any, idx: number) => (
                <div
                  key={idx}
                  className="border rounded-lg p-3 bg-gradient-to-r from-red-50 to-white" style={{ borderColor: '#fecaca' }} >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm" style={{ color: '#7f1d1d' }} >{clause.name}</h4>
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

                  <p className="text-sm mb-2" style={{ color: '#374151' }} >{clause.description}</p>

                  {clause.content && (
                    <div className="p-3 rounded text-sm mb-2 border" style={{ borderColor: '#fee2e2', backgroundColor: '#ffffff', color: '#4b5563' }} >
                      {clause.content}
                    </div>
                  )}

                  {clause.advice && (
                    <div className="p-3 rounded text-sm border" style={{ borderColor: '#fef08a', backgroundColor: '#fefce8' }} >
                      <span className="font-medium" style={{ color: '#713f12' }} >⚠️ Khuyến nghị: </span>
                      <span style={{ color: '#854d0e' }} >{clause.advice}</span>
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

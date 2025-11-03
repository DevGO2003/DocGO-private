import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface RiskTabProps {
  data: any;
}

export function RiskTab({ data }: RiskTabProps) {
  const risk = data?.riskAssessment || data?.risk;

  if (!risk) {
    return (
      <div className="py-8" style={{ color: '#6b7280' }} >Không có dữ liệu phân tích rủi ro</div>
    );
  }

  const riskLevelColors: Record<string, string> = {
    LOW: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    HIGH: 'bg-red-100 text-red-800 border-red-300',
  };

  const probabilityColors: Record<string, string> = {
    LOW: 'text-green-700',
    MEDIUM: 'text-yellow-700',
    HIGH: 'text-red-700',
  };

  const impactColors: Record<string, string> = {
    LOW: 'text-green-700',
    MEDIUM: 'text-yellow-700',
    HIGH: 'text-red-700',
  };

  const typeColors: Record<string, string> = {
    TECHNICAL: 'bg-blue-100 text-blue-800',
    SCHEDULE: 'bg-purple-100 text-purple-800',
    FINANCIAL: 'bg-green-100 text-green-800',
    LEGAL: 'bg-red-100 text-red-800',
    OPERATIONAL: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Level */}
      {risk.riskLevel && (
        <Card
          className={`border-2 ${
            riskLevelColors[risk.riskLevel] || 'bg-gray-100 text-gray-800 border-gray-300'
          }`}
        >
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CommonIcon name="alert-circle" className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold">Mức rủi ro tổng thể</h3>
                <p className="text-2xl font-bold mt-1">{risk.riskLevel}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Factors */}
      {risk.riskFactors && risk.riskFactors.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Các yếu tố rủi ro ({risk.riskFactors.length})
            </h3>

            <div className="space-y-4">
              {risk.riskFactors.map((factor: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4" style={{ borderColor: '#e5e7eb' }} >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {factor.type && (
                        <span
                          className={`inline-block px-2 py-1 rounded text-xs font-medium mb-2 ${
                            typeColors[factor.type] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {factor.type}
                        </span>
                      )}
                      <h4 className="font-semibold text-base">{factor.description}</h4>
                    </div>
                  </div>

                  {factor.content && (
                    <div className="p-3 rounded text-sm mb-3" style={{ backgroundColor: '#f9fafb', color: '#4b5563' }} >
                      {factor.content}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {factor.probability && (
                      <div>
                        <span className="text-xs" style={{ color: '#4b5563' }} >Xác suất:</span>
                        <p
                          className={`font-semibold ${
                            probabilityColors[factor.probability] || 'text-gray-700'
                          }`}
                        >
                          {factor.probability}
                        </p>
                      </div>
                    )}
                    {factor.impact && (
                      <div>
                        <span className="text-xs" style={{ color: '#4b5563' }} >Tác động:</span>
                        <p
                          className={`font-semibold ${
                            impactColors[factor.impact] || 'text-gray-700'
                          }`}
                        >
                          {factor.impact}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mitigation Measures */}
      {risk.mitigationMeasures && risk.mitigationMeasures.length > 0 && (
        <Card style={{ borderColor: '#bbf7d0' }} >
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CommonIcon name="shield" style={{ color: '#16a34a' }} />
              <h3 className="text-lg font-semibold">
                Biện pháp giảm thiểu rủi ro ({risk.mitigationMeasures.length})
              </h3>
            </div>

            <div className="space-y-3">
              {risk.mitigationMeasures.map((measure: any, idx: number) => (
                <div key={idx} className="border-l-4 pl-4 py-2" style={{ borderColor: '#4ade80', backgroundColor: '#f0fdf4' }} >
                  <p className="text-sm" style={{ color: '#374151' }} >
                    {typeof measure === 'string' ? measure : measure.description || measure}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

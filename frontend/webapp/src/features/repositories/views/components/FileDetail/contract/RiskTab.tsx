import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface RiskTabProps {
  data: any;
}

export function RiskTab({ data }: RiskTabProps) {
  const risk = data?.riskAssessment || data?.risk;

  if (!risk) {
    return (
      <div className="text-center text-gray-500 py-8">Không có dữ liệu phân tích rủi ro</div>
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
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
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
                    <div className="bg-gray-50 p-3 rounded text-sm italic text-gray-600 mb-3">
                      {factor.content}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {factor.probability && (
                      <div>
                        <span className="text-xs text-gray-600">Xác suất:</span>
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
                        <span className="text-xs text-gray-600">Tác động:</span>
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
        <Card className="border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CommonIcon name="shield" className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">
                Biện pháp giảm thiểu rủi ro ({risk.mitigationMeasures.length})
              </h3>
            </div>

            <div className="space-y-3">
              {risk.mitigationMeasures.map((measure: any, idx: number) => (
                <div key={idx} className="border-l-4 border-green-400 pl-4 py-2 bg-green-50">
                  <p className="text-sm text-gray-700">
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

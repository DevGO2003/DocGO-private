import React from 'react'

interface Party {
  id: string
  name: string
  type: string
  role: string
  contact?: {
    email?: string
    phone?: string
    address?: string
  }
  representative?: {
    name?: string
    position?: string
    email?: string
  }
  taxCode?: string
}

interface PartiesSectionProps {
  parties: Party[]
}

export function PartiesSection({ parties }: PartiesSectionProps) {
  if (!parties || parties.length === 0) return null

  const typeColors: Record<string, string> = {
    CLIENT: 'bg-blue-50 text-blue-700 border-blue-200',
    VENDOR: 'bg-green-50 text-green-700 border-green-200',
    PARTNER: 'bg-purple-50 text-purple-700 border-purple-200',
    GUARANTOR: 'bg-orange-50 text-orange-700 border-orange-200',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3 text-gray-900">Các bên tham gia ({parties.length})</h3>
      
      <div className="space-y-3">
        {parties.map((party, idx) => (
          <div key={party.id || idx} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-gray-900">{party.name}</h4>
                <p className="text-xs text-gray-600">{party.role}</p>
              </div>
              <span className={`px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ml-2 ${typeColors[party.type] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                {party.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {party.contact && (
                <>
                  {party.contact.email && (
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium text-gray-900">{party.contact.email}</p>
                    </div>
                  )}
                  {party.contact.phone && (
                    <div>
                      <span className="text-gray-500">Điện thoại:</span>
                      <p className="font-medium text-gray-900">{party.contact.phone}</p>
                    </div>
                  )}
                  {party.contact.address && (
                    <div className="col-span-2">
                      <span className="text-gray-500">Địa chỉ:</span>
                      <p className="font-medium text-gray-900">{party.contact.address}</p>
                    </div>
                  )}
                </>
              )}

              {party.representative && (
                <>
                  <div>
                    <span className="text-gray-500">Đại diện:</span>
                    <p className="font-medium text-gray-900">{party.representative.name}</p>
                  </div>
                  {party.representative.position && (
                    <div>
                      <span className="text-gray-500">Chức vụ:</span>
                      <p className="font-medium text-gray-900">{party.representative.position}</p>
                    </div>
                  )}
                </>
              )}

              {party.taxCode && (
                <div>
                  <span className="text-gray-500">Mã số thuế:</span>
                  <p className="font-medium text-gray-900">{party.taxCode}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

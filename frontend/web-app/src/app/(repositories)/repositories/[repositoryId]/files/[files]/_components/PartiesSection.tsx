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
    CLIENT: 'bg-blue-100 text-blue-800',
    VENDOR: 'bg-green-100 text-green-800',
    PARTNER: 'bg-purple-100 text-purple-800',
    GUARANTOR: 'bg-orange-100 text-orange-800',
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Các bên tham gia ({parties.length})</h3>
      
      <div className="space-y-4">
        {parties.map((party, idx) => (
          <div key={party.id || idx} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-base">{party.name}</h4>
                <p className="text-sm text-gray-600">{party.role}</p>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[party.type] || 'bg-gray-100 text-gray-800'}`}>
                {party.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              {party.contact && (
                <>
                  {party.contact.email && (
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <p className="font-medium">{party.contact.email}</p>
                    </div>
                  )}
                  {party.contact.phone && (
                    <div>
                      <span className="text-gray-600">Điện thoại:</span>
                      <p className="font-medium">{party.contact.phone}</p>
                    </div>
                  )}
                  {party.contact.address && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Địa chỉ:</span>
                      <p className="font-medium">{party.contact.address}</p>
                    </div>
                  )}
                </>
              )}

              {party.representative && (
                <>
                  <div>
                    <span className="text-gray-600">Đại diện:</span>
                    <p className="font-medium">{party.representative.name}</p>
                  </div>
                  {party.representative.position && (
                    <div>
                      <span className="text-gray-600">Chức vụ:</span>
                      <p className="font-medium">{party.representative.position}</p>
                    </div>
                  )}
                </>
              )}

              {party.taxCode && (
                <div>
                  <span className="text-gray-600">Mã số thuế:</span>
                  <p className="font-medium">{party.taxCode}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

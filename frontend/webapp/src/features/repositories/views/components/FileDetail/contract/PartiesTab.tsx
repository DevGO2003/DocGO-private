import React from 'react';
import { Card, CardContent } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface Party {
  id: string;
  name: string;
  type: string;
  role: string;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  representative?: {
    name?: string;
    position?: string;
    email?: string;
  };
  taxCode?: string;
}

interface PartiesTabProps {
  data: any;
}

export function PartiesTab({ data }: PartiesTabProps) {
  const parties: Party[] = data?.parties || [];

  if (parties.length === 0) {
    return (
      <div className="py-8" style={ color: '#6b7280' }>
        <CommonIcon name="user" />
        Không có thông tin các bên tham gia
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    CLIENT: 'bg-blue-50 text-blue-700 border-blue-200',
    VENDOR: 'bg-green-50 text-green-700 border-green-200',
    PARTNER: 'bg-purple-50 text-purple-700 border-purple-200',
    GUARANTOR: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3" style={ color: '#111827' }>
          <CommonIcon name="users" /> Các bên tham gia ({parties.length})
        </h3>
        
        <div className="space-y-3">
          {parties.map((party, idx) => (
            <div
              key={party.id || idx}
              className="border rounded-lg p-3 hover:shadow-sm transition-shadow bg-gradient-to-r from-gray-50 to-white" style={ borderColor: '#e5e7eb' }
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-sm" style={ color: '#111827' }>{party.name}</h4>
                  <p className="text-xs" style={ color: '#4b5563' }>{party.role}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded border text-xs font-medium whitespace-nowrap ml-2 ${
                    typeColors[party.type] || 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {party.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {party.contact && (
                  <>
                    {party.contact.email && (
                      <div>
                        <span style={ color: '#6b7280' }>Email:</span>
                        <p className="font-medium" style={ color: '#111827' }>{party.contact.email}</p>
                        <CommonIcon name="mail" />
                      </div>
                    )}
                    {party.contact.phone && (
                      <div>
                        <span style={ color: '#6b7280' }>Điện thoại:</span>
                        <p className="font-medium" style={ color: '#111827' }>{party.contact.phone}</p>
                        <CommonIcon name="phone" />
                      </div>
                    )}
                    {party.contact.address && (
                      <div className="col-span-2">
                        <span style={ color: '#6b7280' }>Địa chỉ:</span>
                        <p className="font-medium" style={ color: '#111827' }>{party.contact.address}</p>
                      </div>
                    )}
                  </>
                )}

                {party.representative && (
                  <>
                    <div>
                      <span style={ color: '#6b7280' }>Đại diện:</span>
                      <p className="font-medium" style={ color: '#111827' }>{party.representative.name}</p>
                    </div>
                    {party.representative.position && (
                      <div>
                        <span style={ color: '#6b7280' }>Chức vụ:</span>
                        <p className="font-medium" style={ color: '#111827' }>{party.representative.position}</p>
                      </div>
                    )}
                  </>
                )}

                {party.taxCode && (
                  <div>
                    <span style={ color: '#6b7280' }>Mã số thuế:</span>
                    <p className="font-medium" style={ color: '#111827' }>{party.taxCode}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

import React, { useMemo, useState } from 'react'
import { useMyRepositories } from '@features/repositories/models/api/repositoryApi'
import { useMyOrganizations } from '@features/organizations'
import { useOrganizationRepositories } from '@features/repositories/models/api/repositoryApi'
import { Flex, Stack, Button, Text } from '@shared/components'

interface RepositoryPickerProps {
  value?: string
  onChange: (id: string, name: string) => void
  className?: string
}

const RepositoryPicker: React.FC<RepositoryPickerProps> = ({ value, onChange, className }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'orgs'>('personal')
  const [search, setSearch] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')

  const { data: myRepos } = useMyRepositories({ page: 0, size: 50 })
  const { data: orgs } = useMyOrganizations({ page: 0, size: 50 })
  const { data: orgRepos } = useOrganizationRepositories(
    selectedOrgId ? { page: 0, size: 50, organizationId: selectedOrgId } : { page: 0, size: 50 }
  )

  const list = useMemo(() => {
    const items = activeTab === 'personal' ? (myRepos?.content || []) : (orgRepos?.content || [])
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter((r: any) => r.name?.toLowerCase().includes(q))
  }, [activeTab, myRepos, orgRepos, search])

  return (
    <div className={className || ''}>
      <Stack gap={12}>
        <Flex align="center" justify="between">
          <div>
            <Button variant={activeTab === 'personal' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('personal')}>Cá nhân</Button>
            <Button variant={activeTab === 'orgs' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('orgs')} style={{ marginLeft: 8 }}>Tổ chức</Button>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm repository..."
            style={{ padding: '8px 12px', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, width: 192 }}
          />
        </Flex>

        {activeTab === 'orgs' && (
          <Flex align="center" gap={8}>
            <Text className="text-sm text-gray-600">Tổ chức:</Text>
            <select
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
              style={{ padding: '8px 12px', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8 }}
            >
              <option value="">Chưa chọn</option>
              {(orgs?.content || []).map((o: any) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </Flex>
        )}

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 12, maxHeight: 240, overflow: 'auto' }}>
          {list.length === 0 && (
            <div style={{ padding: 12 }}><Text className="text-sm text-gray-500">Không có repository phù hợp</Text></div>
          )}
          {list.map((repo: any) => (
            <button
              type="button"
              key={repo.id}
              onClick={() => onChange(repo.id, repo.name)}
              style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: value === repo.id ? '#eff6ff' : '#fff' }}
            >
              <Flex align="center" justify="between">
                <span className="text-sm font-medium text-gray-900">{repo.name}</span>
                {value === repo.id && (
                  <span className="text-xs text-blue-600">Đã chọn</span>
                )}
              </Flex>
              {repo.description && (
                <p className="text-xs text-gray-500" style={{ marginTop: 2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{repo.description}</p>
              )}
            </button>
          ))}
        </div>
      </Stack>
    </div>
  )
}

export default RepositoryPicker

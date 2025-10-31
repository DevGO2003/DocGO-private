import React, { useMemo, useState } from 'react'
import { useMyRepositories, useCreateRepository } from '@features/repositories/models/api/repositoryApi'
import { useMyOrganizations } from '@features/organizations'
import { useOrganizationRepositories } from '@features/repositories/models/api/repositoryApi'
import { Flex, Stack, Button, Text } from '@shared/components'
import { Tabs, TabList, CommonTab } from '@shared/components/UIComponents/Tabs/CommonTabs'

interface RepositoryPickerProps {
  value?: string
  onChange: (id: string, name: string) => void
  className?: string
}

const RepositoryPicker: React.FC<RepositoryPickerProps> = ({ value, onChange, className }) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'orgs'>('personal')
  const [search, setSearch] = useState('')
  const [selectedOrgId, setSelectedOrgId] = useState<string>('')
  const [showCreate, setShowCreate] = useState(false)
  const [newRepoName, setNewRepoName] = useState('')
  const [newRepoDesc, setNewRepoDesc] = useState('')
  const [newRepoPublic, setNewRepoPublic] = useState(false)
  const [justCreatedRepo, setJustCreatedRepo] = useState<any | null>(null)

  const { data: myRepos } = useMyRepositories({ page: 0, size: 50 })
  const { data: orgs } = useMyOrganizations({ page: 0, size: 50 })
  const { data: orgRepos } = useOrganizationRepositories(
    selectedOrgId ? { page: 0, size: 50, organizationId: selectedOrgId } : { page: 0, size: 50 }
  )
  const createRepo = useCreateRepository()

  const list = useMemo(() => {
    const items = activeTab === 'personal' ? (myRepos?.content || []) : (orgRepos?.content || [])
    let enriched = items
    if (justCreatedRepo && activeTab === 'personal') {
      const exists = items?.some((r: any) => r.id === justCreatedRepo.id)
      if (!exists) {
        enriched = [justCreatedRepo, ...items]
      }
    }
    const q = search.trim().toLowerCase()
    if (!q) return enriched
    return enriched.filter((r: any) => r.name?.toLowerCase().includes(q))
  }, [activeTab, myRepos, orgRepos, search, justCreatedRepo])

  return (
    <div className={className || ''}>
      <Stack gap="10px">
        <Flex align="center" gap="8px" style={{ flexWrap: 'nowrap' }}>
          <Tabs>
            <TabList>
              <CommonTab value="personal" activeValue={activeTab} onSelect={(v: string) => setActiveTab(v as 'personal' | 'orgs')}>Cá nhân</CommonTab>
              <CommonTab value="orgs" activeValue={activeTab} onSelect={(v: string) => setActiveTab(v as 'personal' | 'orgs')}>Tổ chức</CommonTab>
            </TabList>
          </Tabs>
          <div style={{ flex: 1, minWidth: 0 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm repository..."
              style={{ padding: '8px 12px', fontSize: 14, border: '1px solid #e5e7eb', borderRadius: 8, width: '100%' }}
            />
          </div>
          <div className="flex-shrink-0">
            {activeTab === 'personal' && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowCreate((v) => !v)}
                className="min-w-[140px]"
              >
                Tạo repository
              </Button>
            )}
          </div>
        </Flex>

        {activeTab === 'personal' && showCreate && (
          <form
            className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 border border-gray-200 rounded-lg bg-white"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!newRepoName.trim()) return
              const payload: any = {
                name: newRepoName.trim(),
                description: newRepoDesc || undefined,
                isPublic: newRepoPublic,
              }
              try {
                const resp = await createRepo.mutateAsync(payload)
                const created: any = resp
                const newId = created?.id
                const newName = created?.name
                if (newId) {
                  onChange(newId, newName || '')
                  setJustCreatedRepo({ id: newId, name: newName || '', description: created?.description })
                  setSearch('')
                }
                setNewRepoName('')
                setNewRepoDesc('')
                setNewRepoPublic(false)
                setShowCreate(false)
              } catch { }
            }}
          >
            <input
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              placeholder="Tên repository"
              value={newRepoName}
              onChange={(e) => setNewRepoName(e.target.value)}
              required
            />
            <input
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              placeholder="Mô tả (tuỳ chọn)"
              value={newRepoDesc}
              onChange={(e) => setNewRepoDesc(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={newRepoPublic} onChange={(e) => setNewRepoPublic(e.target.checked)} />
                Công khai
              </label>
              <button
                type="submit"
                className="ml-auto px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                disabled={createRepo.isPending || !newRepoName.trim()}
              >
                {createRepo.isPending ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'orgs' && (
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Tổ chức:</label>
            <select
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            >
              <option value="">Chưa chọn</option>
              {(orgs?.content || []).map((o: any) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </div>
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

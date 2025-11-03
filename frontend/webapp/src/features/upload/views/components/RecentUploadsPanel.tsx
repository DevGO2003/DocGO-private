import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { automationFileApi, AutomationRecentItem } from '../../models/api/automationFileApi'
import { Text, Button, Card, CardContent } from '@shared/components'
import { Flex, Stack } from '@shared/components'
import { REPOSITORY_DETAIL_PATH, REPOSITORY_FILE_DETAIL_PATH } from '@constants'

interface RecentUploadsPanelProps {
  limit?: number
  className?: string
}

const RecentUploadsPanel: React.FC<RecentUploadsPanelProps> = ({ limit = 5, className }) => {
  const nav = useNavigate()
  const { t } = useTranslation()
  const [items, setItems] = useState<AutomationRecentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    automationFileApi
      .getRecent(limit)
      .then((res) => {
        if (!mounted) return
        setItems(res.data || [])
      })
      .catch((e) => {
        if (!mounted) return
        setError(e?.message || t('uploads.recent.error.loadRecent'))
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [limit])

  const openDetail = (repoId?: string | null, fileId?: string) => {
    if (!repoId || !fileId) return
    nav(REPOSITORY_FILE_DETAIL_PATH.replace(':id', repoId).replace(':fileId', fileId))
  }
  const openRepo = (repoId?: string | null) => {
    if (!repoId) return
    nav(REPOSITORY_DETAIL_PATH.replace(':id', repoId))
  }
  const openPreview = (repoId?: string | null, fileId?: string) => {
    // Tạm thời dùng trang chi tiết
    openDetail(repoId, fileId)
  }

  return (
    <Card className={className}>
      <CardContent style={{ paddingTop: 24 }}>
        <Stack gap="10px">
          <Flex align="center" justify="between">
            <Text as="h3" className="text-base font-semibold" style={{ color: '#111827' }} >{t('uploads.recent.title')}</Text>
            {loading && <Text as="span" className="text-xs" style={{ color: '#6b7280' }} >{t('uploads.recent.loading')}</Text>}
          </Flex>

          {error && (
            <Text as="p" className="text-xs" style={{ color: '#dc2626' }} >{error}</Text>
          )}

          {(!items || items.length === 0) ? (
            <Text as="p" className="text-sm" style={{ color: '#4b5563' }} >{t('uploads.recent.empty')}</Text>
          ) : (
            <Stack gap={0}>
              {items.map((it) => (
                <Flex key={it.fileId} align="center" justify="between" style={{ padding: '12px', background: '#fff', borderBottom: '1px solid #eee' }}>
                  <div style={{ minWidth: 0, flex: 1, marginRight: 12 }}>
                    <p className="text-sm font-medium truncate" style={{ color: '#111827' } title={it.fileName}>{it.fileName}</p>
                    <p className="text-xs" style={{ color: '#6b7280', marginTop: 2 }}>
                      {(it.fileSize / 1024).toFixed(2)} KB • {it.contentType} • {new Date(it.uploadedAt).toLocaleString()}
                    </p>
                  </div>
                  <Flex align="center" gap={8}>
                    <Button variant="outline" size="sm" onClick={() => openDetail(it.repositoryId, it.fileId)}>{t('uploads.recent.actions.detail')}</Button>
                    <Button variant="outline" size="sm" onClick={() => openRepo(it.repositoryId)}>{t('uploads.recent.actions.repository')}</Button>
                    <Button variant="default" size="sm" onClick={() => openPreview(it.repositoryId, it.fileId)}>{t('uploads.recent.actions.preview')}</Button>
                  </Flex>
                </Flex>
              ))}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default RecentUploadsPanel

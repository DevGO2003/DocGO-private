import React from 'react'
import { useTranslation } from 'react-i18next'
import { Input, Card, CardContent, Text, Switch } from '@shared/components'

interface VersioningPanelProps {
  createFromOldVersion: boolean
  setCreateFromOldVersion: (value: boolean) => void
  baseContractId: string
  setBaseContractId: (value: string) => void
  newVersionName: string
  setNewVersionName: (value: string) => void
}

export default function VersioningPanel({
  createFromOldVersion,
  setCreateFromOldVersion,
  baseContractId,
  setBaseContractId,
  newVersionName,
  setNewVersionName
}: VersioningPanelProps) {
  const { t } = useTranslation()
  return (
    <Card>
      <CardContent className="pt-4">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <Text as="h4" className="text-base font-semibold" style={ color: '#111827' }>
              {t('upload.versioningPanel.title')} <span className="font-normal" style={ color: '#6b7280' }>{t('upload.versioningPanel.subtitle')}</span>
            </Text>
            <Text as="p" className="text-xs text-amber-600" style={{ marginTop: 4 }}>{t('upload.versioningPanel.disabledNote')}</Text>
          </div>
          <div>
            <Switch checked={false} disabled onChange={() => {}} aria-label={`${t('upload.versioningPanel.title')} (${t('upload.versioningPanel.disabled')})`} />
            <Text as="span" className="text-sm" style={ color: '#374151' } style={{ marginLeft: 8 }}>{t('upload.versioningPanel.disabled')}</Text>
          </div>
        </div>

        {false && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Input
                label={t('upload.versioningPanel.baseId')}
                type="text"
                value={baseContractId}
                onChange={(e) => setBaseContractId((e.target as any).value)}
                placeholder="VD: 1024"
                helperText={t('upload.versioningPanel.baseIdHelper')}
                disabled
              />
            </div>
            <div>
              <Input
                label={t('upload.versioningPanel.newVersionName')}
                type="text"
                value={newVersionName}
                onChange={(e) => setNewVersionName((e.target as any).value)}
                placeholder="VD: v2 hoặc 2.0"
                helperText={t('upload.versioningPanel.newVersionNameHelper')}
                disabled
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

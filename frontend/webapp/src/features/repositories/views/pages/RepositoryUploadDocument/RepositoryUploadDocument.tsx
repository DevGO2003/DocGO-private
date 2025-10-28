import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@shared/components'
import { ControlMainLayout } from '@shared/layouts'
import RepositoryLayout from '../../../layouts/RepositoryLayout'
import { UploadPanel } from '../../components/UploadPanel'
import { VersioningPanel } from '../../components/VersioningPanel'
import { SystemInfoPanel } from '../../components/SystemInfoPanel'
import { FilePreview } from '../../components/FilePreview'
import repositoryApi from '../../../models/api/repositoryApi'

export const RepositoryUploadDocument = () => {
  const { id } = useParams<{ id: string }>()
  const [fileInfo, setFileInfo] = useState<any>(null)
  const repoId = id || ''

  const handleUpload = async (file: File) => {
    const uploaded = await repositoryApi.uploadFile({ file, repositoryId: repoId })
    setFileInfo(uploaded)
  }

  return (
    <ControlMainLayout
      title="Upload Document"
      breadcrumbs={[{ label: 'Repositories', href: '/repositories' }, { label: 'Upload', current: true }]}
    >
      <RepositoryLayout>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload</CardTitle>
              </CardHeader>
              <CardContent>
                <UploadPanel onUpload={handleUpload} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <FilePreview fileInfo={fileInfo} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Versioning</CardTitle>
              </CardHeader>
              <CardContent>
                <VersioningPanel fileInfo={fileInfo} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Info</CardTitle>
              </CardHeader>
              <CardContent>
                <SystemInfoPanel fileInfo={fileInfo} />
              </CardContent>
            </Card>

            <Button disabled={!fileInfo}>Submit</Button>
          </div>
        </div>
      </RepositoryLayout>
    </ControlMainLayout>
  )
}

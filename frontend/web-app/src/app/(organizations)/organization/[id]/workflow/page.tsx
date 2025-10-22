'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Settings, Play, CheckCircle2, XCircle, Clock, AlertCircle } from '@/lib/icons'

interface WorkflowStep {
  order: number
  name: string
  description: string
  enabled_condition: {
    type: string
    field?: string
    operator?: string
    value?: any
  }
  type: string
  approvers: {
    roles: string[]
    specific_users?: string[]
    min_approvals: number
  }
  timeout_hours: number
  actions: string[]
}

interface Workflow {
  id: string
  name: string
  description: string
  organization_id: string
  steps: WorkflowStep[]
  is_default: boolean
  is_active: boolean
}

export default function WorkflowPage() {
  const params = useParams()
  const organizationId = params.id as string
  
  const [workflow, setWorkflow] = useState<Workflow | null>(null)
  const [loading, setLoading] = useState(true)
  const [testValue, setTestValue] = useState('')
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    loadWorkflow()
  }, [organizationId])

  const loadWorkflow = async () => {
    try {
      setLoading(true)
      
      // Try real API first, fallback to mock
      try {
        const response = await fetch(`http://localhost:8081/api/organizations/${organizationId}/workflow`)
        if (!response.ok) throw new Error('API failed')
        const data = await response.json()
        setWorkflow(data)
      } catch (apiError) {
        console.log('Using mock workflow data')
        const { mockOrganizationAPI } = await import('@/lib/mock/organization-mock')
        const data = await mockOrganizationAPI.getWorkflow(organizationId)
        setWorkflow(data as any)
      }
    } catch (error) {
      console.error('Error loading workflow:', error)
      toast.error('Không thể tải workflow')
    } finally {
      setLoading(false)
    }
  }

  const testWorkflow = async () => {
    if (!testValue) {
      toast.error('Vui lòng nhập giá trị hợp đồng')
      return
    }

    try {
      // Try real API first, fallback to mock
      try {
        const response = await fetch(
          `http://localhost:8081/api/organizations/${organizationId}/workflow/test`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              totalValue: parseFloat(testValue),
              contractType: 'standard'
            })
          }
        )
        if (!response.ok) throw new Error('API failed')
        const result = await response.json()
        setTestResult(result)
      } catch (apiError) {
        console.log('Using mock test workflow')
        const { mockOrganizationAPI } = await import('@/lib/mock/organization-mock')
        const result = await mockOrganizationAPI.testWorkflow(organizationId, {
          totalValue: parseFloat(testValue),
          contractType: 'standard'
        })
        setTestResult(result)
      }
      toast.success('Test workflow thành công!')
    } catch (error) {
      console.error('Error testing workflow:', error)
      toast.error('Không thể test workflow')
    }
  }

  const getStepTypeColor = (type: string) => {
    switch (type) {
      case 'parallel': return 'bg-blue-100 text-blue-800'
      case 'sequential': return 'bg-green-100 text-green-800'
      case 'any': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCondition = (condition: any) => {
    if (condition.type === 'always') return 'Luôn chạy'
    if (condition.type === 'value_threshold') {
      return `Giá trị ${condition.operator} ${(condition.value / 1000000).toFixed(0)}M VNĐ`
    }
    return condition.type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-500">Không tìm thấy workflow</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{workflow.name}</h1>
            <p className="text-gray-600 mt-1">{workflow.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {workflow.is_default && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Mặc định
              </Badge>
            )}
            {workflow.is_active && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                Đang hoạt động
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Test Workflow */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Test Workflow
          </CardTitle>
          <CardDescription>
            Nhập giá trị hợp đồng để xem workflow sẽ chạy như thế nào
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Giá trị hợp đồng (VNĐ)</Label>
              <Input
                type="number"
                placeholder="Ví dụ: 150000000"
                value={testValue}
                onChange={(e) => setTestValue(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={testWorkflow}>
                <Play className="w-4 h-4 mr-2" />
                Test
              </Button>
            </div>
          </div>

          {testResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Kết quả:</h4>
              <div className="space-y-2">
                <p><strong>Số bước sẽ chạy:</strong> {testResult.enabledSteps?.length} / {testResult.totalSteps}</p>
                <p><strong>Thời gian ước tính:</strong> {testResult.estimatedDays} ngày</p>
                <div>
                  <strong>Các bước:</strong>
                  <ul className="list-disc list-inside mt-1">
                    {testResult.enabledSteps?.map((step: string, index: number) => (
                      <li key={index} className="text-sm">{step}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="space-y-4">
        <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Các bước trong workflow
          </h2>
        </div>

        {workflow.steps.map((step, index) => (
          <Card key={index} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 text-sm font-bold">
                      {step.order}
                    </span>
                    {step.name}
                  </CardTitle>
                  <CardDescription className="mt-2">{step.description}</CardDescription>
                </div>
                <Badge className={getStepTypeColor(step.type)}>
                  {step.type === 'parallel' && 'Song song'}
                  {step.type === 'sequential' && 'Tuần tự'}
                  {step.type === 'any' && 'Bất kỳ'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Condition */}
              <div className="flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Điều kiện:</span>
                <span className="text-gray-600">{formatCondition(step.enabled_condition)}</span>
              </div>

              {/* Approvers */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  Người phê duyệt
                </div>
                <div className="flex flex-wrap gap-2">
                  {step.approvers.roles.map((role, idx) => (
                    <Badge key={idx} variant="outline">
                      {role}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Cần tối thiểu {step.approvers.min_approvals} phê duyệt
                </p>
              </div>

              {/* Timeout */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="font-medium">Thời hạn:</span>
                <span className="text-gray-600">{step.timeout_hours} giờ</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">Hành động:</span>
                <div className="flex gap-2">
                  {step.actions.map((action, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {action === 'approve' && 'Phê duyệt'}
                      {action === 'reject' && 'Từ chối'}
                      {action === 'request_changes' && 'Yêu cầu sửa'}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

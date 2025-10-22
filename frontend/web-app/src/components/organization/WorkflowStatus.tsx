'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, XCircle, Clock, AlertCircle, MessageSquare } from '@/lib/icons'

interface WorkflowStatusProps {
  contractId: string
  onApprove?: () => void
  onReject?: () => void
  onRequestChanges?: () => void
}

interface StepInstance {
  order: number
  name: string
  status: string
  approvals: Array<{
    userId: string
    action: string
    comment: string
    timestamp: string
  }>
  started_at?: string
  completed_at?: string
  timeout_at?: string
}

interface WorkflowInstance {
  id: string
  contract_id: string
  current_step: number
  steps: StepInstance[]
  status: string
  created_at: string
}

export function WorkflowStatus({ contractId, onApprove, onReject, onRequestChanges }: WorkflowStatusProps) {
  const [workflow, setWorkflow] = useState<WorkflowInstance | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCommentDialog, setShowCommentDialog] = useState(false)
  const [comment, setComment] = useState('')
  const [action, setAction] = useState<'approve' | 'reject' | 'request_changes'>('approve')

  useEffect(() => {
    loadWorkflowStatus()
  }, [contractId])

  const loadWorkflowStatus = async () => {
    try {
      setLoading(true)
      
      // Try real API first, fallback to mock
      try {
        const response = await fetch(
          `http://localhost:8082/api/contracts/${contractId}/workflow/status`
        )
        if (!response.ok) throw new Error('API failed')
        const data = await response.json()
        setWorkflow(data)
      } catch (apiError) {
        console.log('Using mock workflow status')
        const { mockOrganizationAPI } = await import('@/lib/mock/organization-mock')
        const data = await mockOrganizationAPI.getWorkflowStatus(contractId)
        setWorkflow(data as any)
      }
    } catch (error) {
      console.error('Error loading workflow status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (actionType: 'approve' | 'reject' | 'request_changes') => {
    if (!workflow) return

    try {
      const response = await fetch(
        `http://localhost:8081/api/workflow-instances/${workflow.id}/${actionType}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'current-user-id', // TODO: Get from auth
            comment: comment,
            ...(actionType === 'request_changes' && {
              requiredChanges: ['Update contract terms']
            })
          })
        }
      )

      if (response.ok) {
        loadWorkflowStatus()
        setShowCommentDialog(false)
        setComment('')
        
        if (actionType === 'approve' && onApprove) onApprove()
        if (actionType === 'reject' && onReject) onReject()
        if (actionType === 'request_changes' && onRequestChanges) onRequestChanges()
      }
    } catch (error) {
      console.error('Error performing action:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-gray-400" />
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      case 'changes_requested':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!workflow) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">Chưa có workflow</p>
        </CardContent>
      </Card>
    )
  }

  const currentStep = workflow.steps[workflow.current_step]
  const canApprove = currentStep?.status === 'in_progress'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Trạng thái phê duyệt</span>
          <Badge className={getStatusColor(workflow.status)}>
            {workflow.status === 'in_progress' && 'Đang xử lý'}
            {workflow.status === 'completed' && 'Hoàn thành'}
            {workflow.status === 'rejected' && 'Từ chối'}
            {workflow.status === 'changes_requested' && 'Yêu cầu sửa'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Tiến độ</span>
            <span className="font-medium">
              {workflow.current_step + 1} / {workflow.steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{
                width: `${((workflow.current_step + 1) / workflow.steps.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Steps - Sequential Flow */}
        <div className="space-y-3">
          {workflow.steps.map((step: any, index: number) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < workflow.steps.length - 1 && (
                <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-gray-300 -mb-3" />
              )}
              
              <div
                className={`relative p-4 rounded-lg border ${
                  index === workflow.current_step
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : step.status === 'completed'
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3">
                    <div className="relative z-10 bg-white rounded-full p-1">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{step.name}</p>
                      {step.assigned_role && (
                        <p className="text-sm text-gray-600 mt-1">
                          👤 Người phụ trách: <span className="font-medium">{step.assigned_role}</span>
                        </p>
                      )}
                      {step.assigned_users && step.assigned_users.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {step.assigned_users.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(step.status)}>
                    {step.status === 'completed' && '✓ Hoàn thành'}
                    {step.status === 'in_progress' && '⏳ Đang xử lý'}
                    {step.status === 'pending' && '⏸ Chờ xử lý'}
                    {step.status === 'rejected' && '✗ Từ chối'}
                  </Badge>
                </div>

                {/* Approvals */}
                {step.approvals && step.approvals.length > 0 && (
                  <div className="mt-3 pl-8 space-y-2 border-l-2 border-green-300">
                    {step.approvals.map((approval: any, idx: number) => (
                      <div key={idx} className="pl-3 py-2 bg-white rounded-lg border border-gray-200">
                        <div className="flex items-start gap-2 text-sm">
                          {approval.action === 'approve' && (
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          )}
                          {approval.action === 'reject' && (
                            <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          )}
                          {approval.action === 'request_changes' && (
                            <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {approval.userName || approval.userId}
                              {approval.userRole && (
                                <span className="ml-2 text-xs text-gray-500">({approval.userRole})</span>
                              )}
                            </p>
                            {approval.comment && (
                              <p className="text-gray-700 mt-1 italic">"{approval.comment}"</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">
                              🕐 {new Date(approval.timestamp).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Current Step Indicator */}
                {index === workflow.current_step && step.status === 'in_progress' && (
                  <div className="mt-3 p-2 bg-blue-100 border border-blue-300 rounded text-sm text-blue-800">
                    ⚡ Đang chờ phê duyệt từ <strong>{step.assigned_role}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {canApprove && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => handleAction('approve')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Phê duyệt
            </Button>
            <Button
              onClick={() => handleAction('request_changes')}
              variant="outline"
              className="flex-1"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Yêu cầu sửa
            </Button>
            <Button
              onClick={() => handleAction('reject')}
              variant="outline"
              className="flex-1 text-red-600 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Từ chối
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

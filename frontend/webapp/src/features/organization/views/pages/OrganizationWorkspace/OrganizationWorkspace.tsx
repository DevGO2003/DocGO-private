import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Settings,
  BarChart3,
  AlertCircle,
  TrendingUp,
  Search,
  File as FileIcon,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  LoadingSpinner,
} from '@shared/components';
import { useOrganization } from '@features/organization';
import { useOrganizationContracts } from '@features/contract';
// import { UploadContractDialog } from '@features/contract'; // Temporarily disabled
import { ORGANIZATIONS_PATH } from '@constants';

type WorkspaceTab = 'contracts' | 'pending-approvals' | 'reports' | 'members' | 'settings';

export const OrganizationWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('contracts');
  const [searchTerm, setSearchTerm] = useState('');
  // const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false); // Temporarily disabled

  const { data: organization, isLoading } = useOrganization(id!);
  const { 
    data: contractsData, 
    isLoading: contractsLoading, 
    isFetching: contractsFetching,
    // refetch: refetchContracts  // Temporarily disabled
  } = useOrganizationContracts(id!, {
    page: 0,
    size: 20,
  });

  // Calculate stats from real data
  const contracts = contractsData?.content || [];
  const stats = {
    totalContracts: contracts.length,
    pendingApprovals: contracts.filter(c => c.status === 'PENDING_APPROVAL').length,
    approved: contracts.filter(c => c.status === 'APPROVED').length,
    rejected: contracts.filter(c => c.status === 'REJECTED').length,
  };

  const tabs = [
    { id: 'contracts' as WorkspaceTab, label: 'Contracts', icon: FileText },
    { id: 'pending-approvals' as WorkspaceTab, label: 'Pending Approvals', icon: Clock },
    { id: 'reports' as WorkspaceTab, label: 'Reports', icon: BarChart3 },
    { id: 'members' as WorkspaceTab, label: 'Members', icon: Users },
    { id: 'settings' as WorkspaceTab, label: 'Settings', icon: Settings },
  ];

  if (isLoading) {
    return <LoadingSpinner text="Loading workspace..." fullScreen />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">Organization not found</p>
            <Button
              variant="outline"
              onClick={() => navigate(ORGANIZATIONS_PATH)}
              animated
            >
              Back to Organizations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Temporarily disabled - Upload Contract Dialog */}
      {/* <UploadContractDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        organizationId={id!}
        onSuccess={() => {
          console.log('✅ [Workspace] Contract uploaded successfully!');
          console.log('🔄 [Workspace] Manually triggering refetch...');
          
          // Force refetch contracts
          refetchContracts().then(() => {
            console.log('✅ [Workspace] Refetch completed!');
          });
          
          // Switch to contracts tab if not already there
          setActiveTab('contracts');
        }}
      /> */}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => navigate(ORGANIZATIONS_PATH)}
              className="flex items-center gap-2"
              animated
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            {/* Temporarily disabled - Upload Contract feature */}
            {/* <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsUploadDialogOpen(true)}
              animated
            >
              <Upload className="w-4 h-4" />
              Upload Contract
            </Button> */}
          </div>

          {/* Organization Info */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-3xl text-white font-bold">
                {organization.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
              <p className="text-gray-600">{organization.description || 'No description'}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">Total Contracts</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalContracts}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">Pending</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingApprovals}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">Approved</p>
                  <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">Rejected</p>
                  <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-gray-200 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Search contracts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline" animated>
                      Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contracts List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>All Contracts</CardTitle>
                    {contractsFetching && !contractsLoading && (
                      <span className="text-sm text-blue-600 flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                        Updating...
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {contractsLoading ? (
                    <div className="text-center py-12">
                      <LoadingSpinner text="Loading contracts..." />
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No contracts yet</p>
                      <p className="text-sm text-gray-500">Contracts will appear here when they are available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contracts.map((contract) => (
                        <div
                          key={contract.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <FileIcon className="w-5 h-5 text-blue-600 mt-1" />
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{contract.title}</h4>
                                {contract.description && (
                                  <p className="text-sm text-gray-600 mt-1">{contract.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span>{contract.fileName}</span>
                                  <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                contract.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-700'
                                  : contract.status === 'PENDING_APPROVAL'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : contract.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {contract.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Pending Approvals Tab */}
          {activeTab === 'pending-approvals' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No contracts pending approval</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analytics & Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No data available for reports</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/organizations/${id}/members`)}
                    animated
                  >
                    <Users className="w-4 h-4" />
                    Manage Members
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    View and manage your team members
                  </p>
                  <Button 
                    variant="outline" 
                    className="inline-flex items-center gap-2"
                    onClick={() => navigate(`/organizations/${id}/members`)}
                    animated
                  >
                    <Users className="w-4 h-4" />
                    Go to Members Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Organization Name</p>
                          <p className="text-sm text-gray-600">{organization.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Description</p>
                          <p className="text-sm text-gray-600">
                            {organization.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
      </div>
    </>
  );
};

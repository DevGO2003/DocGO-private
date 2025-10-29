import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Settings,
  FolderOpen,
  Shield,
  Crown,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  LoadingSpinner,
} from '@shared/components';
import {
  useOrganization,
  useOrganizationMembers,
  useRemoveMember,
} from '@/features/organizations';
import { ORGANIZATIONS_PATH } from '@constants';

type TabType = 'overview' | 'members' | 'repositories' | 'settings';

export const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const { t } = useTranslation();

  const { data: organization, isLoading: orgLoading } = useOrganization(id!);
  const { data: members, isLoading: membersLoading } = useOrganizationMembers(id!);
  const removeMemberMutation = useRemoveMember();

  const tabs: { id: TabType; label: string; icon: any }[] = [
    { id: 'overview', label: t('organizations.detail.tabs.overview'), icon: FolderOpen },
    { id: 'members', label: t('organizations.detail.tabs.members'), icon: Users },
    { id: 'repositories', label: t('organizations.detail.tabs.repositories'), icon: FolderOpen },
    { id: 'settings', label: t('organizations.detail.tabs.settings'), icon: Settings },
  ];

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm('Remove this member from the organization?')) return;
    
    try {
      await removeMemberMutation.mutateAsync({
        orgId: id!,
        memberId,
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'MEMBER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (orgLoading) {
    return <LoadingSpinner text={t('organizations.detail.loading')} fullScreen />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-700">{t('organizations.detail.notFound')}</p>
            <Button
              variant="outline"
              onClick={() => navigate(ORGANIZATIONS_PATH)}
              className="mt-4"
            >
              {t('organizations.detail.backToList')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate(ORGANIZATIONS_PATH)}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('organizations.detail.backToList')}
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-2xl text-white font-bold">
                    {organization.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                {organization.name}
              </h1>
              <p className="text-gray-600">
                {organization.description || 'No description'}
              </p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
            >
              <MoreVertical className="w-4 h-4" />
              {t('organizations.detail.actions')}
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('organizations.detail.stats.members')}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {organization.memberCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('organizations.detail.stats.repositories')}</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('organizations.detail.stats.status')}</p>
                  <p className="text-lg font-semibold text-gray-900">{t('organizations.detail.stats.active')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{t('organizations.detail.stats.created')}</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date(organization.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 border-b border-gray-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('organizations.detail.overview.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('organizations.detail.overview.name')}</label>
                    <p className="text-gray-900 mt-1">{organization.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('organizations.detail.overview.description')}</label>
                    <p className="text-gray-900 mt-1">
                      {organization.description || t('organizations.detail.overview.noDescription')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('organizations.detail.overview.owner')}</label>
                    <p className="text-gray-900 mt-1 flex items-center gap-2">
                      <Crown className="w-4 h-4 text-yellow-500" />
                      {organization.ownerName || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">{t('organizations.detail.overview.settings')}</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {organization.settings?.isPublic && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                          {t('organizations.detail.overview.flags.public')}
                        </span>
                      )}
                      {organization.settings?.allowInvitations && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                          {t('organizations.detail.overview.flags.openInvitations')}
                        </span>
                      )}
                      {organization.settings?.requireApproval && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-sm font-medium">
                          {t('organizations.detail.overview.flags.requiresApproval')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('organizations.detail.members.title')}</CardTitle>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {t('organizations.detail.members.invite')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="py-8">
                    <LoadingSpinner text={t('organizations.detail.members.loading')} />
                  </div>
                ) : members && (members as any).content && (members as any).content.length > 0 ? (
                  <div className="space-y-3">
                    {(members as any).content.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {member.userName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {member.userName || 'Unknown User'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                                  member.role
                                )}`}
                              >
                                {member.role}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(
                                  member.status
                                )}`}
                              >
                                {member.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-500">
                            {t('organizations.detail.members.joined', { date: new Date(member.joinedAt).toLocaleDateString() })}
                          </p>
                          {member.role !== 'OWNER' && (
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-600 hover:text-red-700 text-sm"
                            >
                              {t('organizations.detail.members.remove')}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">{t('organizations.detail.members.none')}</p>
                    <Button variant="outline" className="inline-flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {t('organizations.detail.members.invite')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Repositories Tab */}
          {activeTab === 'repositories' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('organizations.detail.repositories.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('organizations.detail.repositories.empty')}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('organizations.detail.settings.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('organizations.detail.settings.general')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{t('organizations.detail.settings.public.label')}</p>
                          <p className="text-sm text-gray-600">{t('organizations.detail.settings.public.desc')}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={organization.settings?.isPublic}
                          className="w-5 h-5"
                          readOnly
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{t('organizations.detail.settings.allowInvitations.label')}</p>
                          <p className="text-sm text-gray-600">{t('organizations.detail.settings.allowInvitations.desc')}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={organization.settings?.allowInvitations}
                          className="w-5 h-5"
                          readOnly
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{t('organizations.detail.settings.requireApproval.label')}</p>
                          <p className="text-sm text-gray-600">{t('organizations.detail.settings.requireApproval.desc')}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={organization.settings?.requireApproval}
                          className="w-5 h-5"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-red-600 mb-4">{t('organizations.detail.settings.danger.title')}</h3>
                    <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                      <p className="font-medium text-red-900 mb-2">{t('organizations.detail.settings.danger.delete')}</p>
                      <p className="text-sm text-red-700 mb-4">{t('organizations.detail.settings.danger.desc')}</p>
                      <Button variant="outline" className="text-red-600 hover:text-red-700">
                        {t('organizations.detail.settings.danger.cta')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

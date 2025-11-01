import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@store/hooks';
import {
  useMyRepositories,
  useFiles
} from '@features/repositories';
import { useMyOrganizations } from '@features/organizations';
import { REPOSITORIES_PATH, ORGANIZATIONS_PATH, PROFILE_PATH } from '@constants';
// removed unused type imports
import { Card, CardContent, CardHeader, CardTitle, Button, Text, LoadingSpinner, RefreshButton } from '@shared/components';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PanelSelector from '../../../components/PanelSelector';

export const Dashboard = () => {
  console.log('[Dashboard] Rendering...');

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const [page] = useState(0);
  const [size] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Panel management state
  const [panels, setPanels] = useState([
    { id: 'stats', label: 'Thống kê', visible: true },
    { id: 'repositories', label: 'Repositories gần đây', visible: true },
    { id: 'files', label: 'Files gần đây', visible: true },
    { id: 'organizations', label: 'Tổ chức', visible: true },
    { id: 'quickActions', label: 'Hành động nhanh', visible: true },
  ]);
  
  const togglePanel = (id: string) => {
    setPanels(prev => prev.map(p => 
      p.id === id ? { ...p, visible: !p.visible } : p
    ));
  };

  // Get current user ID for filtering
  const userId = user?.id;

  // Fetch data - these hooks already filter by current user (useMyRepositories, useMyOrganizations)
  const { data: repositories, isLoading: reposLoading } = useMyRepositories({ page, size });
  // Filter files by userId using API parameter
  const { data: files, isLoading: filesLoading } = useFiles({ page, size, userId });
  const { data: organizations, isLoading: orgsLoading } = useMyOrganizations({ page, size });

  console.log('[Dashboard] User:', user);
  console.log('[Dashboard] User ID:', userId);

  // Handle refresh - invalidate and refetch all dashboard queries
  const handleRefresh = async () => {
    console.log('[Dashboard] Refreshing data...');
    setIsRefreshing(true);
    try {
      // Invalidate all dashboard-related queries
      await queryClient.invalidateQueries({ queryKey: ['my-repositories'] });
      await queryClient.invalidateQueries({ queryKey: ['files'] });
      await queryClient.invalidateQueries({ queryKey: ['my-organizations'] });

      // Refetch all queries
      await queryClient.refetchQueries({ queryKey: ['my-repositories'] });
      await queryClient.refetchQueries({ queryKey: ['files'] });
      await queryClient.refetchQueries({ queryKey: ['my-organizations'] });

      console.log('[Dashboard] Refresh completed');
    } catch (error) {
      console.error('[Dashboard] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const stats = [
    {
      title: t('dashboard.stats.repositories'),
      value: repositories?.totalElements || 0,
      change: '+12%',
      color: 'from-blue-500 to-purple-500',
      icon: '📁',
    },
    {
      title: t('dashboard.stats.files'),
      value: files?.totalElements || 0,
      change: '+8%',
      color: 'from-green-500 to-teal-500',
      icon: '🗂️',
    },
    {
      title: t('dashboard.stats.organizations'),
      value: organizations?.totalElements || 0,
      change: '+5%',
      color: 'from-orange-500 to-red-500',
      icon: '🏢',
    },
    {
      title: t('dashboard.stats.storageUsed'),
      value: '2.4 GB',
      change: '+15%',
      color: 'from-pink-500 to-rose-500',
      icon: '💾',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const NumberCounter = ({ value }: { value: number }) => {
    const [display, setDisplay] = useState(0);
    const target = typeof value === 'number' ? value : 0;
    React.useEffect(() => {
      let start = 0;
      const duration = 600;
      const startTime = performance.now();
      let raf = 0;
      const tick = (t: number) => {
        const p = Math.min(1, (t - startTime) / duration);
        setDisplay(Math.round(start + (target - start) * p));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }, [target]);
    return <>{display}</>;
  };

  return (
    <DashboardLayout
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
      breadcrumbs={[{ label: t('nav.dashboard'), current: true }]}
      onRefresh={handleRefresh}
      headerRight={
        <div className="flex items-center gap-2">
          <PanelSelector
            panels={panels.map(p => ({ id: p.id, label: p.label, visible: p.visible }))}
            onToggle={togglePanel}
          />
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
        </div>
      }
    >
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Text as="h1" className="text-4xl font-bold text-gray-900 mb-2">
            {t('dashboard.welcome', { name: user?.firstName || user?.username || '' })}
          </Text>
          <Text as="p" className="text-gray-600">
            {t('dashboard.whatsHappening')}
          </Text>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={itemVariants} whileHover={{ scale: 1.02, rotate: 0.2 }}>
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} mb-4 flex items-center justify-center shadow-sm`}>
                    <span className="text-2xl">
                      {stat.icon}
                    </span>
                  </div>
                  <Text as="h3" className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </Text>
                  <div className="flex items-baseline justify-between">
                    <Text as="p" className="text-2xl font-bold text-gray-900">
                      {typeof stat.value === 'number' ? <NumberCounter value={stat.value as number} /> : stat.value}
                    </Text>
                    <Text as="span" className="text-sm text-green-600 font-medium">
                      {stat.change}
                    </Text>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Repositories */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.recentRepositories')}</CardTitle>
              </CardHeader>
              <CardContent>
                {reposLoading ? (
                  <div className="py-6"><LoadingSpinner /></div>
                ) : repositories && repositories.content.length > 0 ? (
                  <div className="space-y-3">
                    {repositories.content.slice(0, 5).map((repo) => (
                      <motion.div
                        key={repo.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() => navigate(`${REPOSITORIES_PATH}/${repo.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <Text as="h4" className="font-semibold text-gray-900">{repo.name}</Text>
                            <Text as="p" className="text-sm text-gray-600">{t('dashboard.filesCount', { count: repo.fileCount })}</Text>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(repo.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Text as="p" className="text-gray-500 mb-4">{t('dashboard.noRepositories')}</Text>
                    <Button
                      variant="default"
                      onClick={() => navigate(REPOSITORIES_PATH)}
                    >
                      {t('dashboard.createRepository')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Files */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{t('dashboard.recentFiles')}</CardTitle>
              </CardHeader>
              <CardContent>
                {filesLoading ? (
                  <div className="py-6"><LoadingSpinner /></div>
                ) : files && files.content.length > 0 ? (
                  <div className="space-y-3">
                    {files.content.slice(0, 5).map((file) => (
                      <motion.div
                        key={file.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <Text as="h4" className="font-semibold text-gray-900 truncate">
                              {file.originalName || file.name}
                            </Text>
                            <Text as="p" className="text-sm text-gray-600">
                              {(file.fileSize / 1024).toFixed(2)} KB
                            </Text>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Text as="p" className="text-gray-500">{t('dashboard.noFiles')}</Text>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Organizations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Organizations</CardTitle>
                <Button
                  variant="outline"
                  onClick={() => navigate(ORGANIZATIONS_PATH)}
                >
                  {t('dashboard.viewAll')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {orgsLoading ? (
                <div className="py-6"><LoadingSpinner /></div>
              ) : organizations && organizations.content.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {organizations.content.map((org) => (
                    <motion.div
                      key={org.id}
                      whileHover={{ scale: 1.05 }}
                      className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg cursor-pointer border-2 border-blue-200"
                      onClick={() => navigate(`${ORGANIZATIONS_PATH}/${org.id}`)}
                    >
                      <Text as="h4" className="font-bold text-gray-900 mb-1">{org.name}</Text>
                      <Text as="p" className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {org.description || t('dashboard.noDescription')}
                      </Text>
                      <div className="flex items-center text-xs text-gray-500">
                        <Text as="span" className="text-gray-500">{t('dashboard.members', { count: org.memberCount })}</Text>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Text as="p" className="text-gray-500 mb-4">{t('dashboard.notInOrganization')}</Text>
                  <Button
                    variant="default"
                    onClick={() => navigate(ORGANIZATIONS_PATH)}
                  >
                    {t('dashboard.joinOrganization')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.quickActions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate(REPOSITORIES_PATH)}
                  className="h-24"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">📁</div>
                    <Text as="span" className="text-sm">{t('dashboard.btn.repositories')}</Text>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(ORGANIZATIONS_PATH)}
                  className="h-24"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">🏢</div>
                    <Text as="span" className="text-sm">{t('dashboard.btn.organizations')}</Text>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(PROFILE_PATH)}
                  className="h-24"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">👤</div>
                    <Text as="span" className="text-sm">{t('dashboard.btn.profile')}</Text>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="h-24"
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">⚙️</div>
                    <Text as="span" className="text-sm">{t('dashboard.btn.settings')}</Text>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
    </DashboardLayout>
  );
};

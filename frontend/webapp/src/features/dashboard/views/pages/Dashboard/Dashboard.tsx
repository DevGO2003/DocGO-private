import React, { useState, useEffect, useRef } from 'react';
import anime from 'animejs';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@store/hooks';
import {
  useMyRepositories,
  useFiles
} from '@features/repositories';
import { useMyOrganizations } from '@features/organizations';
import { REPOSITORIES_PATH, ORGANIZATIONS_PATH, PROFILE_PATH } from '@constants';
// removed unused type imports
import { Card, CardContent, Button, Text, RefreshButton, WindowPanel } from '@shared/components';
import DashboardLayout from '../../../layouts/DashboardLayout';
import PanelSelector from '../../../components/PanelSelector';
import {
  getLayoutPreference,
  getSavedLayout,
} from '@shared/lib/panelLayoutManager';

// Panel state type
interface PanelState {
  id: string;
  label: string;
  visible: boolean;
  minimized: boolean;
  position: { x: number; y: number };
}

export const Dashboard = () => {
  console.log('[Dashboard] Rendering...');

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const [page] = useState(0);
  const [size] = useState(5);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Load panel state from localStorage or use defaults from layout manager
  const loadPanelState = (): PanelState[] => {
    const saved = localStorage.getItem('dashboard-panels');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved panel state:', e);
      }
    }
    
    // Load from layout preference
    const layoutName = getLayoutPreference();
    const layout = getSavedLayout(layoutName);
    
    // Convert layout config to panel state + add stats panel
    const defaultPanels = layout.panels.map((panel) => ({
      id: panel.id,
      label: panel.label,
      visible: true,
      minimized: false,
      position: panel.position,
    }));
    
    // Add stats panel at the beginning
    return [
      { id: 'stats', label: 'Thống kê', visible: true, minimized: false, position: { x: 0, y: 0 } },
      ...defaultPanels,
    ];
  };
  
  // Panel management state
  const [panels, setPanels] = useState<PanelState[]>(loadPanelState);

  // Save to localStorage whenever panels change
  useEffect(() => {
    localStorage.setItem('dashboard-panels', JSON.stringify(panels));
  }, [panels]);
  
  const togglePanel = (id: string) => {
    setPanels((prev: PanelState[]) => prev.map((p: PanelState) => 
      p.id === id ? { ...p, visible: !p.visible } : p
    ));
  };

  const minimizePanel = (id: string, minimized: boolean) => {
    setPanels((prev: PanelState[]) => prev.map((p: PanelState) => 
      p.id === id ? { ...p, minimized } : p
    ));
  };

  const closePanel = (id: string) => {
    setPanels((prev: PanelState[]) => prev.map((p: PanelState) => 
      p.id === id ? { ...p, visible: false } : p
    ));
  };

  const updatePanelPosition = (id: string, x: number, y: number) => {
    setPanels((prev: PanelState[]) => prev.map((p: PanelState) => 
      p.id === id ? { ...p, position: { x, y } } : p
    ));
  };

  // Layout functions removed - no longer needed

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

  const statsGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (statsGridRef.current) {
      anime({
        targets: statsGridRef.current.children,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        delay: anime.stagger(100),
        easing: 'easeOutQuad',
      });
    }
  }, []);

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
      title: t('dashboard.stats.storageUploadUsed'),
      value: '2.4 GB',
      change: '+15%',
      color: 'from-pink-500 to-rose-500',
      icon: '💾',
    },
  ];

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
      description="Tổng quan hoạt động và thống kê hệ thống của bạn"
      breadcrumbs={[{ label: t('nav.dashboard'), current: true }]}
      onRefresh={handleRefresh}
      headerRight={
        <div className="flex items-center gap-2">
          <PanelSelector
            panels={panels.map((p: PanelState) => ({ id: p.id, label: p.label, visible: p.visible }))}
            onToggle={togglePanel}
          />
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
        </div>
      }
    >
        {/* Welcome Header */}
        <div className="mb-8 animate-fade-in">
          <Text as="h1" className="font-bold mb-2" style={{ color: '#111827' }} >
            {t('dashboard.welcome', { name: user?.firstName || user?.username || '' })}
          </Text>
          <Text as="p" style={{ color: '#4b5563' }} >
            {t('dashboard.whatsHappening')}
          </Text>
        </div>

        {/* Stats WindowPanel */}
        {panels.find(p => p.id === 'stats')?.visible && (
          <WindowPanel
            id="stats"
            title={t('dashboard.stats.title') || 'Thống kê'}
            defaultWidth={1040}
            defaultHeight={300}
            minimized={panels.find(p => p.id === 'stats')?.minimized}
            visible={panels.find(p => p.id === 'stats')?.visible}
            position={panels.find(p => p.id === 'stats')?.position || { x: 0, y: 0 }}
            onMinimize={(min) => minimizePanel('stats', min)}
            onClose={() => closePanel('stats')}
            onPositionChange={updatePanelPosition}
          >
            <div ref={statsGridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="transition-transform hover:scale-[1.02]">
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} mb-4 flex items-center justify-center shadow-sm`}>
                        <span className="text-2xl">
                          {stat.icon}
                        </span>
                      </div>
                      <Text as="h3" className="text-sm font-medium mb-1" style={{ color: '#4b5563' }} >
                        {stat.title}
                      </Text>
                      <div className="flex items-baseline justify-between">
                        <Text as="p" className="text-2xl font-bold" style={{ color: '#111827' }} >
                          {typeof stat.value === 'number' ? <NumberCounter value={stat.value as number} /> : stat.value}
                        </Text>
                        <Text as="span" className="text-sm font-medium" style={{ color: '#16a34a' }} >
                          {stat.change}
                        </Text>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </WindowPanel>
        )}

        {/* WindowPanels Container */}
        <div className="relative" style={{ minHeight: '1200px' }}>
          {/* Recent Repositories Panel */}
          {panels.find(p => p.id === 'repositories')?.visible && (
            <WindowPanel
              id="repositories"
              title={t('dashboard.recentRepositories')}
              defaultWidth={500}
              defaultHeight={400}
              minimized={panels.find(p => p.id === 'repositories')?.minimized}
              visible={panels.find(p => p.id === 'repositories')?.visible}
              position={panels.find(p => p.id === 'repositories')?.position || { x: 0, y: 0 }}
              onMinimize={(min) => minimizePanel('repositories', min)}
              onClose={() => closePanel('repositories')}
              onPositionChange={updatePanelPosition}
              loading={reposLoading}
            >
              {!reposLoading && repositories && repositories.content.length > 0 ? (
                <div className="space-y-3">
                    {repositories.content.slice(0, 5).map((repo) => (
                      <div
                        key={repo.id}
                        className="p-3 rounded-lg hover:bg-gray-100 transition-all hover:scale-[1.02] cursor-pointer" style={{ backgroundColor: '#f9fafb' }}
                        onClick={() => navigate(`${REPOSITORIES_PATH}/${repo.id}`)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <Text as="h4" className="font-semibold" style={{ color: '#111827' }} >{repo.name}</Text>
                            <Text as="p" className="text-sm" style={{ color: '#4b5563' }} >{t('dashboard.filesCount', { count: repo.fileCount })}</Text>
                          </div>
                          <span className="text-xs" style={{ color: '#6b7280' }} >
                            {new Date(repo.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : !reposLoading ? (
                <div className="text-center py-8">
                  <Text as="p" className="mb-4" style={{ color: '#6b7280' }} >{t('dashboard.noRepositories')}</Text>
                  <Button
                    variant="default"
                    onClick={() => navigate(REPOSITORIES_PATH)}
                  >
                    {t('dashboard.createRepository')}
                  </Button>
                </div>
              ) : null}
            </WindowPanel>
          )}

          {/* Recent Files Panel */}
          {panels.find(p => p.id === 'files')?.visible && (
            <WindowPanel
              id="files"
              title={t('dashboard.recentFiles')}
              defaultWidth={500}
              defaultHeight={400}
              minimized={panels.find(p => p.id === 'files')?.minimized}
              visible={panels.find(p => p.id === 'files')?.visible}
              position={panels.find(p => p.id === 'files')?.position || { x: 520, y: 0 }}
              onMinimize={(min) => minimizePanel('files', min)}
              onClose={() => closePanel('files')}
              onPositionChange={updatePanelPosition}
              loading={filesLoading}
            >
              {!filesLoading && files && files.content.length > 0 ? (
                <div className="space-y-3">
                    {files.content.slice(0, 5).map((file) => (
                      <div
                        key={file.id}
                        className="p-3 rounded-lg hover:bg-gray-100 transition-all hover:scale-[1.02] cursor-pointer" style={{ backgroundColor: '#f9fafb' }} >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <Text as="h4" className="font-semibold truncate" style={{ color: '#111827' }} >
                              {file.originalName || file.name}
                            </Text>
                            <Text as="p" className="text-sm" style={{ color: '#4b5563' }} >
                              {(file.fileSize / 1024).toFixed(2)} KB
                            </Text>
                          </div>
                          <span className="text-xs" style={{ color: '#6b7280' }} >
                            {new Date(file.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              ) : !filesLoading ? (
                <div className="py-8" style={{ color: '#6b7280' }} >
                  <Text as="p" style={{ color: '#6b7280' }} >{t('dashboard.noFiles')}</Text>
                </div>
              ) : null}
            </WindowPanel>
          )}

          {/* Organizations Panel */}
          {panels.find(p => p.id === 'organizations')?.visible && (
            <WindowPanel
              id="organizations"
              title="My Organizations"
              defaultWidth={1040}
              defaultHeight={450}
              minimized={panels.find(p => p.id === 'organizations')?.minimized}
              visible={panels.find(p => p.id === 'organizations')?.visible}
              position={panels.find(p => p.id === 'organizations')?.position || { x: 0, y: 420 }}
              onMinimize={(min) => minimizePanel('organizations', min)}
              onClose={() => closePanel('organizations')}
              onPositionChange={updatePanelPosition}
              loading={orgsLoading}
            >
              {!orgsLoading && organizations && organizations.content.length > 0 ? (
                <>
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="outline"
                      onClick={() => navigate(ORGANIZATIONS_PATH)}
                    >
                      {t('dashboard.viewAll')}
                    </Button>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {organizations.content.map((org) => (
                    <div
                      key={org.id}
                      className="p-4 rounded-lg cursor-pointer border-2 transition-transform hover:scale-105" style={{ borderColor: '#bfdbfe', backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)' }}
                      onClick={() => navigate(`${ORGANIZATIONS_PATH}/${org.id}`)}
                    >
                      <Text as="h4" className="font-bold mb-1" style={{ color: '#111827' }} >{org.name}</Text>
                      <Text as="p" className="text-sm mb-2 line-clamp-2" style={{ color: '#4b5563' }} >
                        {org.description || t('dashboard.noDescription')}
                      </Text>
                      <div className="flex items-center text-xs" style={{ color: '#6b7280' }} >
                        <Text as="span" style={{ color: '#6b7280' }} >{t('dashboard.members', { count: org.memberCount })}</Text>
                      </div>
                    </div>
                  ))}
                </div>
                </>
              ) : !orgsLoading ? (
                <div className="text-center py-8">
                  <Text as="p" className="mb-4" style={{ color: '#6b7280' }} >{t('dashboard.notInOrganization')}</Text>
                  <Button
                    variant="default"
                    onClick={() => navigate(ORGANIZATIONS_PATH)}
                  >
                    {t('dashboard.joinOrganization')}
                  </Button>
                </div>
              ) : null}
            </WindowPanel>
          )}

          {/* Quick Actions Panel */}
          {panels.find(p => p.id === 'quickActions')?.visible && (
            <WindowPanel
              id="quickActions"
              title={t('dashboard.quickActions')}
              defaultWidth={1040}
              defaultHeight={300}
              minimized={panels.find(p => p.id === 'quickActions')?.minimized}
              visible={panels.find(p => p.id === 'quickActions')?.visible}
              position={panels.find(p => p.id === 'quickActions')?.position || { x: 0, y: 890 }}
              onMinimize={(min) => minimizePanel('quickActions', min)}
              onClose={() => closePanel('quickActions')}
              onPositionChange={updatePanelPosition}
            >
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
            </WindowPanel>
          )}
        </div>
    </DashboardLayout>
  );
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  User,
  Lock,
  Bell,
  Globe,
  Shield,
  Eye,
  EyeOff,
  Save,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  RefreshButton,
  Tabs,
  TabList,
  CommonTab,
  Checkbox,
  Select,
} from '@shared/components';
import SettingsLayout from '../../layouts/SettingsLayout';
import { useAppSelector } from '@store/hooks';
import { useUpdateProfile, useChangePassword } from '@features/auth';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'preferences';

export const Settings = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    documentUpdates: true,
    organizationInvites: true,
    weeklyDigest: false,
  });

  const [preferenceSettings, setPreferenceSettings] = useState({
    language: 'en',
    timezone: 'UTC+7',
    theme: 'light',
    dateFormat: 'DD/MM/YYYY',
  });

  const tabs = [
    { id: 'profile' as SettingsTab, label: t('settings.tabs.profile'), icon: User },
    { id: 'security' as SettingsTab, label: t('settings.tabs.security'), icon: Lock },
    { id: 'notifications' as SettingsTab, label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'preferences' as SettingsTab, label: t('settings.tabs.preferences'), icon: Globe },
  ];

  const handleProfileUpdate = async () => {
    try {
      await updateProfileMutation.mutateAsync(profileData);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }

    if (!user?.id) {
      alert('Không tìm thấy thông tin người dùng!');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        userId: user.id,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      alert('Đổi mật khẩu thành công!');
    } catch (error) {
      console.error('Failed to change password:', error);
      alert('Đổi mật khẩu thất bại! Vui lòng thử lại.');
    }
  };

  const handleRefresh = async () => {
    console.log('[Settings] Refreshing data...');
    setIsRefreshing(true);
    try {
      // Invalidate user-related queries
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Reset form data to current user state
      setProfileData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
      });

      console.log('[Settings] Refresh completed');
    } catch (error) {
      console.error('[Settings] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <SettingsLayout
      title={t('settings.title')}
      breadcrumbs={[{ label: t('nav.settings'), current: true }]}
      loading={!user}
      loadingText={t('app.loading')}
      onRefresh={handleRefresh}
      headerRight={
        <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
      }
    >
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('settings.title')}</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card>
              <CardContent className="p-4">
                <Tabs>
                  <TabList className="space-y-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <CommonTab
                          key={tab.id}
                          value={tab.id}
                          activeValue={activeTab}
                          onSelect={() => setActiveTab(tab.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
                        >
                          <Icon className="w-5 h-5" />
                          {tab.label}
                        </CommonTab>
                      );
                    })}
                  </TabList>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-3"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <Input
                          value={profileData.firstName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, firstName: e.target.value })
                          }
                          placeholder="First name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <Input
                          value={profileData.lastName}
                          onChange={(e) =>
                            setProfileData({ ...profileData, lastName: e.target.value })
                          }
                          placeholder="Last name"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({ ...profileData, email: e.target.value })
                        }
                        placeholder="email@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({ ...profileData, phone: e.target.value })
                        }
                        placeholder="+84 xxx xxx xxx"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        onClick={handleProfileUpdate}
                        isLoading={updateProfileMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Đổi mật khẩu
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới
                          </label>
                          <div className="relative">
                            <Input
                              type={showNewPassword ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              placeholder="Nhập mật khẩu mới"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-1"
                            >
                              {showNewPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu mới
                          </label>
                          <Input
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={(e) =>
                              setPasswordData({
                                ...passwordData,
                                confirmPassword: e.target.value,
                              })
                            }
                            placeholder="Xác nhận mật khẩu mới"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={handlePasswordChange}
                        isLoading={changePasswordMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        Update Password
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(notificationSettings).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {key
                              .replace(/([A-Z])/g, ' $1')
                              .replace(/^./, (str) => str.toUpperCase())}
                          </p>
                          <p className="text-sm text-gray-600">
                            Receive notifications for this category
                          </p>
                        </div>
                        <Checkbox
                          checked={value}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              [key]: checked,
                            })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.tabs.preferences')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('settings.preferences.language')}
                      </label>
                      <Select
                        value={preferenceSettings.language}
                        onChange={(e) => {
                          const lang = e.target.value;
                          setPreferenceSettings({
                            ...preferenceSettings,
                            language: lang,
                          });
                          void i18n.changeLanguage(lang);
                        }}
                        options={[
                          { value: 'en', label: t('settings.preferences.english') },
                          { value: 'vi', label: t('settings.preferences.vietnamese') },
                        ]}
                      />
                    </div>

                    <div
                      className="relative"
                      title={t('settings.comingSoon')}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 opacity-60">
                        {t('settings.preferences.timezone')}
                      </label>
                      <Select
                        value={preferenceSettings.timezone}
                        onChange={(e) =>
                          setPreferenceSettings({
                            ...preferenceSettings,
                            timezone: e.target.value,
                          })
                        }
                        disabled
                        options={[
                          { value: 'UTC+7', label: 'UTC+7 (Bangkok, Hanoi)' },
                          { value: 'UTC', label: 'UTC (London)' },
                          { value: 'UTC-5', label: 'UTC-5 (New York)' },
                        ]}
                        className="cursor-not-allowed opacity-60"
                      />
                    </div>

                    <div
                      className="relative"
                      title={t('settings.comingSoon')}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 opacity-60">
                        {t('settings.preferences.theme')}
                      </label>
                      <Select
                        value={preferenceSettings.theme}
                        onChange={(e) =>
                          setPreferenceSettings({
                            ...preferenceSettings,
                            theme: e.target.value,
                          })
                        }
                        disabled
                        options={[
                          { value: 'light', label: 'Light' },
                          { value: 'dark', label: 'Dark' },
                          { value: 'auto', label: 'Auto' },
                        ]}
                        className="cursor-not-allowed opacity-60"
                      />
                    </div>

                    <div
                      className="relative"
                      title={t('settings.comingSoon')}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2 opacity-60">
                        {t('settings.preferences.dateFormat')}
                      </label>
                      <Select
                        value={preferenceSettings.dateFormat}
                        onChange={(e) =>
                          setPreferenceSettings({
                            ...preferenceSettings,
                            dateFormat: e.target.value,
                          })
                        }
                        disabled
                        options={[
                          { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                        ]}
                        className="cursor-not-allowed opacity-60"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default Settings;

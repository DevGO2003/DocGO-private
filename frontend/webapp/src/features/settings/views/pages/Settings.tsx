import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  RefreshButton,
  Select,
} from '@shared/components';
import SettingsLayout from '../../layouts/SettingsLayout';
import { useAppSelector } from '@store/hooks';
import { useUpdateProfile, useChangePassword } from '@features/auth';

type SettingsTab = 'profile' | 'security' | 'preferences';

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

  const [preferenceSettings, setPreferenceSettings] = useState({
    language: 'en',
    timezone: 'UTC+7',
    theme: 'light',
    dateFormat: 'DD/MM/YYYY',
  });

  const tabs = [
    { id: 'profile' as SettingsTab, label: t('settings.tabs.profile'), icon: 'user' },
    { id: 'security' as SettingsTab, label: t('settings.tabs.security'), icon: 'lock' },
    { id: 'preferences' as SettingsTab, label: t('settings.tabs.preferences'), icon: 'globe' },
  ];

  const handleProfileUpdate = async () => {
    if (!user?.id) {
      console.error('User ID not found');
      return;
    }
    
    try {
      await updateProfileMutation.mutateAsync({
        ...profileData,
        userId: user.id,
      });
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      console.error(t('settings.security.passwordMismatch'));
      return;
    }

    if (!user?.id) {
      console.error(t('settings.security.userNotFound'));
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        userId: user.id,
        newPassword: passwordData.newPassword,
      });
      setPasswordData({ newPassword: '', confirmPassword: '' });
      console.log(t('settings.security.passwordChangeSuccess'));
    } catch (error) {
      console.error('Failed to change password:', error);
      console.error(t('settings.security.passwordChangeFailed'));
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
      tabsConfig={{
        mainTabs: tabs,
        activeMainTab: activeTab,
        onMainTabChange: setActiveTab,
        loading: !user,
      }}
    >
      <div className="max-w-6xl mx-auto p-6">

        {/* Content */}
        <div key={activeTab} className="w-full">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>{t('settings.profile.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
                          {t('settings.profile.firstName')}
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
                        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
                          {t('settings.profile.lastName')}
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
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
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
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
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
                        <CommonIcon name="save" size={16} />
                        {t('settings.profile.save')}
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
                  <CardTitle>{t('settings.security.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }} >
                        {t('settings.security.changePassword')}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
                            {t('settings.security.newPassword')}
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
                              placeholder={t('settings.security.newPassword')}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 h-auto p-1"
                            >
                              <CommonIcon name={showNewPassword ? "eye-off" : "eye-open"} size={20} />
                            </Button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
                            {t('settings.security.confirmPassword')}
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
                            placeholder={t('settings.security.confirmPassword')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t" style={{ borderColor: '#e5e7eb' }} >
                      <Button
                        variant="outline"
                        onClick={handlePasswordChange}
                        isLoading={changePasswordMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <CommonIcon name="shield" size={16} />
                        {t('settings.security.updatePassword')}
                      </Button>
                    </div>
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
                      <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }} >
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
                      <label className="block text-sm font-medium mb-2 opacity-60" style={{ color: '#374151' }} >
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
                      <label className="block text-sm font-medium mb-2 opacity-60" style={{ color: '#374151' }} >
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
                      <label className="block text-sm font-medium mb-2 opacity-60" style={{ color: '#374151' }} >
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
        </div>
      </div>
    </SettingsLayout>
  );
};

export default Settings;

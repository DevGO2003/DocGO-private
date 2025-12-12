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
} from '@shared/components';
import SettingsLayout from '../../layouts/SettingsLayout';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { useUpdateProfile, useChangePassword } from '@features/auth';
import { setUser } from '@features/auth/models/state/authSlice';

type SettingsTab = 'profile' | 'security';

export const Settings = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  
  const tabs = [
    { id: 'profile' as SettingsTab, label: t('settings.tabs.profile'), icon: 'user' },
    { id: 'security' as SettingsTab, label: t('settings.tabs.security'), icon: 'lock' },
  ];

  const handleProfileUpdate = async () => {
    if (!user?.id) {
      console.error('User ID not found');
      setUpdateMessage({ type: 'error', text: 'Không tìm thấy ID người dùng' });
      return;
    }
    
    setUpdateMessage(null);
    
    try {
      console.log('[Settings] Updating profile with data:', profileData);
      const updatedUser = await updateProfileMutation.mutateAsync({
        ...profileData,
        userId: user.id,
      });
      console.log('[Settings] Profile updated successfully:', updatedUser);
      
      // Cập nhật Redux store với dữ liệu mới
      dispatch(setUser(updatedUser));
      
      setUpdateMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (error: any) {
      console.error('[Settings] Failed to update profile:', error);
      const errorMessage = error?.response?.data?.description || error?.message || 'Cập nhật thất bại';
      setUpdateMessage({ type: 'error', text: errorMessage });
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

                    {/* Thông báo kết quả */}
                    {updateMessage && (
                      <div className={`p-3 rounded-lg ${updateMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {updateMessage.text}
                      </div>
                    )}

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
                          <Input
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) =>
                                setPasswordData({
                                  ...passwordData,
                                  newPassword: e.target.value,
                                })
                              }
                              placeholder={t('settings.security.newPassword')}
                            />
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

        </div>
      </div>
    </SettingsLayout>
  );
};

export default Settings;

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { User, Mail, Phone, Briefcase, Building2, Calendar, Edit2, Save } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  RefreshButton,
  Label,
} from '@shared/components';

import ProfileLayout from '../../../layouts/ProfileLayout';
import { useAppSelector } from '@store/hooks';
import { useUpdateProfile } from '@features/auth';

export const Profile = () => {
  const { user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      await updateProfileMutation.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      department: user?.department || '',
      position: user?.position || '',
    });
    setIsEditing(false);
  };

  const handleRefresh = async () => {
    console.log('[Profile] Refreshing data...');
    setIsRefreshing(true);
    try {
      // Invalidate user-related queries if any
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      await queryClient.invalidateQueries({ queryKey: ['profile'] });

      // Reset form data to current user state
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        department: user?.department || '',
        position: user?.position || '',
      });

      console.log('[Profile] Refresh completed');
    } catch (error) {
      console.error('[Profile] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ProfileLayout
      title={t('profile.title')}
      breadcrumbs={[{ label: t('nav.profile'), current: true }]}
      loading={!user}
      loadingText={t('app.loading')}
      onRefresh={handleRefresh}
      headerRight={
        <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
      }
    >
      {user && (
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{t('profile.title')}</h1>
            <p className="text-gray-600">{t('profile.manage')}</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    {/* Avatar */}
                    <div className="w-32 h-32 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-4xl text-white font-bold">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </span>
                    </div>

                    {/* Name */}
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {user.firstName} {user.lastName}
                    </h2>
                    <p className="text-gray-600 mb-2">@{user.username}</p>

                    {/* Role Badge */}
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>

                    {/* Stats */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-gray-900">0</div>
                          <div className="text-sm text-gray-600">{t('profile.stats.repositories')}</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">0</div>
                          <div className="text-sm text-gray-600">{t('profile.stats.organizations')}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Details Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('profile.title')}</CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('profile.edit')}
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateProfileMutation.isPending}
                        >
                          {t('profile.cancel')}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleSave}
                          isLoading={updateProfileMutation.isPending}
                          className="flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          {t('profile.save')}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          {t('profile.labels.firstName')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder={t('profile.placeholders.firstName')}
                          />
                        ) : (
                          <p className="text-gray-900">{user.firstName}</p>
                        )}
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          {t('profile.labels.lastName')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder={t('profile.placeholders.lastName')}
                          />
                        ) : (
                          <p className="text-gray-900">{user.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Contact Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4" />
                          {t('profile.labels.email')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('profile.placeholders.email')}
                          />
                        ) : (
                          <p className="text-gray-900">{user.email}</p>
                        )}
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Phone className="w-4 h-4" />
                          {t('profile.labels.phone')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder={t('profile.placeholders.phone')}
                          />
                        ) : (
                          <p className="text-gray-900">{user.phone || t('profile.notSet')}</p>
                        )}
                      </div>
                    </div>

                    {/* Work Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Building2 className="w-4 h-4" />
                          {t('profile.labels.department')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="department"
                            value={formData.department}
                            onChange={handleChange}
                            placeholder="Engineering"
                          />
                        ) : (
                          <p className="text-gray-900">{user.department || t('profile.notSet')}</p>
                        )}
                      </div>
                      <div>
                        <Label className="flex items-center gap-2 mb-2">
                          <Briefcase className="w-4 h-4" />
                          {t('profile.labels.position')}
                        </Label>
                        {isEditing ? (
                          <Input
                            name="position"
                            value={formData.position}
                            onChange={handleChange}
                            placeholder="Software Engineer"
                          />
                        ) : (
                          <p className="text-gray-900">{user.position || t('profile.notSet')}</p>
                        )}
                      </div>
                    </div>

                    {/* Account Info */}
                    <div className="pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        {t('profile.account.title')}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t('profile.account.status')}</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {user.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{t('profile.account.role')}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {user.role}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {t('profile.account.memberSince')}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
}

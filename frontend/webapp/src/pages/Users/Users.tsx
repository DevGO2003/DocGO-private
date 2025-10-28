import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users as UsersIcon,
  UserPlus,
  Search,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Ban,
} from 'lucide-react';
import {
  Card,
  CardContent,
  Button,
  Input,
  LoadingSpinner,
} from '@shared/components';
import { useAppSelector } from '@store/hooks';
import { useUsers, useDeleteUser, useUpdateUserStatus } from '@features/users/api/usersApi';

export const Users = () => {
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const { data: usersData, isLoading } = useUsers({
    page,
    limit: 10,
    search: searchQuery,
    status: statusFilter,
  });

  const deleteUserMutation = useDeleteUser();
  const updateStatusMutation = useUpdateUserStatus();

  // Check if current user is admin
  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Ban className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h2>
            <p className="text-gray-600">
              Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể quản lý người dùng.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        await deleteUserMutation.mutateAsync(userId);
        alert('Đã xóa người dùng thành công!');
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Xóa người dùng thất bại!');
      }
    }
  };

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await updateStatusMutation.mutateAsync({ id: userId, status: newStatus });
      alert('Đã cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { bg: 'bg-green-100', text: 'text-green-800', label: 'Hoạt động' },
      INACTIVE: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Không hoạt động' },
      SUSPENDED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bị khóa' },
      DELETED: { bg: 'bg-black', text: 'text-white', label: 'Đã xóa' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.INACTIVE;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return <LoadingSpinner text="Đang tải danh sách người dùng..." fullScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <UsersIcon className="w-10 h-10" />
                Quản lý người dùng
              </h1>
              <p className="text-gray-600">
                Tổng số: {usersData?.total || 0} người dùng
              </p>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              animated
            >
              <UserPlus className="w-5 h-5" />
              Thêm người dùng
            </Button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card animated>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="Tìm kiếm theo tên, email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="md:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="INACTIVE">Không hoạt động</option>
                    <option value="SUSPENDED">Bị khóa</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card animated>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Người dùng
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vai trò
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {usersData?.users?.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                              {user.firstName?.[0] || user.username[0].toUpperCase()}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.firstName && user.lastName
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.username}
                              </div>
                              <div className="text-sm text-gray-500">@{user.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleUpdateStatus(
                                user.id,
                                user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                              )}
                              className="text-gray-600 hover:text-blue-600 transition-colors"
                              title={user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
                            >
                              {user.status === 'ACTIVE' ? (
                                <Lock className="w-5 h-5" />
                              ) : (
                                <Unlock className="w-5 h-5" />
                              )}
                            </button>
                            <button
                              className="text-gray-600 hover:text-blue-600 transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-gray-600 hover:text-red-600 transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Hiển thị {((page - 1) * 10) + 1} - {Math.min(page * 10, usersData?.total || 0)} của {usersData?.total || 0} kết quả
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage(page + 1)}
                    disabled={page * 10 >= (usersData?.total || 0)}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

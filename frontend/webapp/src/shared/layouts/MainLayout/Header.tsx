import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Input } from '@shared/components';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { logout } from '@features/auth/models/state/authSlice';
import { LOGIN_PATH } from '@constants';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
} from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  showUserMenu?: boolean;
}

export const Header = ({
  onMenuToggle,
  showSearch = true,
  showNotifications = true,
  showUserMenu = true,
}: HeaderProps) => {
  console.log('[Header] Rendering Header component');
  
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user: authUser } = useAppSelector((state) => state.auth);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Get user data from Redux store
  const user = {
    name: authUser?.firstName && authUser?.lastName 
      ? `${authUser.firstName} ${authUser.lastName}`
      : authUser?.username || 'User',
    email: authUser?.email || '',
    avatar: authUser?.avatar || null,
  };

  console.log('[Header] User from Redux:', authUser);
  console.log('[Header] Formatted user:', user);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', searchTerm);
  };

  const handleLogout = () => {
    console.log('[Header] Logging out...');
    dispatch(logout());
    navigate(LOGIN_PATH);
  };

  return (
    <header className="bg-white shadow-sm border-b-2 border-gray-200 sticky top-0 z-40">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu Toggle */}
          <div className="flex items-center gap-4">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-6 w-6" />
              </button>
            )}
          </div>

          {/* Center - Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </form>
            </div>
          )}

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center gap-4">
            {/* Search for mobile */}
            {showSearch && (
              <button className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100">
                <Search className="h-6 w-6" />
              </button>
            )}

            {/* Notifications */}
            {showNotifications && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Bell className="h-6 w-6" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-400"></span>
              </motion.button>
            )}

            {/* User Menu */}
            {showUserMenu && (
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-100"
                >
                  {user.avatar ? (
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={user.avatar}
                      alt={user.name}
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {user.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </motion.button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border-2 border-gray-200 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b-2 border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4" />
                      Hồ sơ
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4" />
                      Cài đặt
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Đăng xuất
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

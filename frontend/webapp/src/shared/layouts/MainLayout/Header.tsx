import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NotificationBell, ProgressBar } from '@shared/components';
import { useAppSelector, useAppDispatch } from '@store/hooks';
import { logout } from '@features/auth/models/state/authSlice';
import { LOGIN_PATH } from '@constants';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

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
    <header className="border-b-2 sticky top-0 z-40 relative" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} >
      <ProgressBar position="top" />
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Menu Toggle */}
          <div className="flex items-center gap-4">
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="lg:hidden p-2 rounded-md hover: hover:bg-gray-100" style={{ color: '#6b7280', color: '#9ca3af' }} >
                <CommonIcon name="menu" size={24} />
              </button>
            )}
          </div>

          {/* Center - Search Bar */}
          {showSearch && (
            <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <CommonIcon name="search" size={20} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:" style={{ borderColor: '#d1d5db', borderColor: '#3b82f6' }} />
              </div>
            </form>
          </div>
          )}

          {/* Right side - Actions and User Menu */}
          <div className="flex items-center gap-4">
            {/* Search for mobile */}
            {showSearch && (
              <button className="md:hidden p-2 rounded-md hover: hover:bg-gray-100" style={{ color: '#6b7280', color: '#9ca3af' }} >
                <CommonIcon name="search" size={20} color="#9ca3af" />
              </button>
            )}

            {/* Notifications */}
            {showNotifications && <NotificationBell />}

            {/* User Menu */}
            {showUserMenu && (
              <div className="relative">
                <button
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
                    <div className="h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3b82f6' }} >
                      <span className="text-sm font-medium" style={{ color: '#ffffff' }} >
                        {user.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {showUserDropdown && (
                  <div
                    style={{
                      opacity: showUserDropdown ? 1 : 0,
                      transform: showUserDropdown ? 'translateY(0)' : 'translateY(-10px)',
                    }}
                    className="absolute right-0 mt-2 rounded-lg border-2 py-1 z-50" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} >
                    <div className="px-4 py-2 border-b-2" style={{ borderColor: '#f3f4f6' }} >
                      <p className="text-sm font-medium" style={{ color: '#111827' }} >{user.name}</p>
                      <p className="text-xs" style={{ color: '#6b7280' }} >{user.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100" style={{ color: '#374151' }} >
                      <CommonIcon name="user" size={20} />
                      Hồ sơ
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-100" style={{ color: '#374151' }} >
                      <CommonIcon name="settings" size={16} />
                      Cài đặt
                    </Link>
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm hover:bg-red-50" style={{ color: '#dc2626' }} >
                      <CommonIcon name="logout" size={16} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

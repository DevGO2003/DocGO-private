import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  Users,
  Settings,
  BarChart3,
  Folder,
  X,
  Star,
  Building2,
  Edit2,
  GripVertical,
  Upload,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  onClose?: () => void;
}

const navigationGroups = [
  {
    title: 'Kho lưu trữ',
    items: [
      { name: 'Bảng điều khiển', href: '/dashboard', icon: Home },
      { name: 'Kho lưu trữ', href: '/repositories', icon: Folder },
      { name: 'Tải lên', href: '/upload', icon: Upload },
      { name: 'Phân tích', href: '/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Quản lý',
    items: [
      { name: 'Tài liệu', href: '/documents', icon: FileText },
      { name: 'Tổ chức', href: '/organizations', icon: Building2 },
      { name: 'Người dùng', href: '/users', icon: Users },
    ]
  },
  {
    title: 'Cài đặt',
    items: [
      { name: 'Tùy chọn', href: '/settings', icon: Settings },
    ]
  }
];

const STORAGE_KEYS = {
  PINNED_ITEMS: 'sidebar_pinned_items',
  MENU_ORDER: 'sidebar_menu_order',
};

export const Sidebar = ({ collapsed = false, onCollapseToggle, onClose }: SidebarProps) => {
  const location = useLocation();
  const [pinnedItems, setPinnedItems] = useState<string[]>(['Dashboard', 'Repositories']);
  const [editMode, setEditMode] = useState(false);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PINNED_ITEMS);
      if (saved) setPinnedItems(JSON.parse(saved));
      
      const savedLabels = localStorage.getItem('sidebar_custom_labels');
      if (savedLabels) setCustomLabels(JSON.parse(savedLabels));
    } catch (e) {
      console.error('Failed to load sidebar preferences:', e);
    }
  }, []);

  // Save to localStorage when pinnedItems changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PINNED_ITEMS, JSON.stringify(pinnedItems));
    } catch (e) {
      console.error('Failed to save pinned items:', e);
    }
  }, [pinnedItems]);

  // Save custom labels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_custom_labels', JSON.stringify(customLabels));
    } catch (e) {
      console.error('Failed to save custom labels:', e);
    }
  }, [customLabels]);

  const togglePin = (name: string) => {
    setPinnedItems(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const updateLabel = (name: string, newLabel: string) => {
    if (newLabel.trim()) {
      setCustomLabels(prev => ({ ...prev, [name]: newLabel }));
    }
    setEditingLabel(null);
  };

  const getDisplayLabel = (name: string) => {
    return customLabels[name] || name;
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Get all items and separate into pinned and regular
  const allItems = navigationGroups.flatMap(g => g.items);
  const pinnedItemsList = allItems.filter(item => pinnedItems.includes(item.name));
  const regularGroups = navigationGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => !pinnedItems.includes(item.name))
    }))
    .filter(group => group.items.length > 0);

  return (
    <div className="h-full flex flex-col bg-white border-r-2 border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 justify-between border-b-2 border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          {!collapsed && <span className="text-xl font-bold text-gray-900">DocGO</span>}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Collapse/Expand Button */}
          <button
            onClick={() => onCollapseToggle?.()}
            className="p-2 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600">
              {collapsed ? '>' : '<'}
            </span>
          </button>
          
          {/* Edit Mode Button */}
          {!collapsed && (
            <button
              onClick={() => setEditMode(!editMode)}
              className={`p-2 border-2 rounded-lg transition-all duration-200 ${
                editMode 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
              }`}
              title="Chế độ chỉnh sửa"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
          
          {/* Close Button (Mobile) */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 border-2 border-gray-300 rounded-lg text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-all duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-1 py-2' : 'px-2 py-4'} overflow-y-auto space-y-6`}>
        {/* Favorites Section */}
        {pinnedItemsList.length > 0 && (
          <div className="space-y-2">
            {!collapsed && (
              <div className="px-2 text-xs font-semibold text-yellow-600 uppercase tracking-wide flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400" />
                Yêu thích
              </div>
            )}
            {pinnedItemsList.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${active
                        ? 'bg-yellow-50 text-yellow-700 font-medium border-l-4 border-yellow-400'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-yellow-600' : 'text-gray-500'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{getDisplayLabel(item.name)}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            togglePin(item.name);
                          }}
                          className="p-1 hover:bg-yellow-200 rounded"
                          title="Bỏ yêu thích"
                        >
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        </button>
                      </>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Regular Menu Groups */}
        {regularGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            {!collapsed && (
              <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.name}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    to={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${active
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                      ${collapsed ? 'justify-center' : ''}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{getDisplayLabel(item.name)}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (editMode) {
                              setEditingLabel(item.name);
                            } else {
                              togglePin(item.name);
                            }
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                          title={editMode ? 'Chỉnh sửa' : 'Thêm vào yêu thích'}
                        >
                          {editMode ? (
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Star className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </>
                    )}
                  </Link>
                  
                  {/* Edit Mode - Label Input */}
                  {editMode && editingLabel === item.name && !collapsed && (
                    <div className="px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 mt-1">
                      <input
                        type="text"
                        defaultValue={getDisplayLabel(item.name)}
                        onBlur={(e) => updateLabel(item.name, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            updateLabel(item.name, e.currentTarget.value);
                          } else if (e.key === 'Escape') {
                            setEditingLabel(null);
                          }
                        }}
                        autoFocus
                        className="w-full px-2 py-1 text-sm border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tên mục"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t-2 border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            DocGO © 2025
          </div>
        </div>
      )}
    </div>
  );
};

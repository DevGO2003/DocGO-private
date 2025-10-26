import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  FileText,
  Users,
  Settings,
  BarChart3,
  Upload,
  Folder,
  Menu,
  X,
  Star,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onCollapseToggle?: () => void;
  onClose?: () => void;
}

const navigationGroups = [
  {
    title: 'Repositories',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Repositories', href: '/products', icon: Folder },
      { name: 'Upload Document', href: '/products/new', icon: Upload },
      { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    ]
  },
  {
    title: 'Management',
    items: [
      { name: 'Documents', href: '/documents', icon: FileText },
      { name: 'Organizations', href: '/organizations', icon: Building2 },
      { name: 'Users', href: '/users', icon: Users },
    ]
  },
  {
    title: 'Administration',
    items: [
      { name: 'Settings', href: '/settings', icon: Settings },
    ]
  }
];

export const Sidebar = ({ collapsed = false, onCollapseToggle, onClose }: SidebarProps) => {
  const location = useLocation();
  const [pinnedItems, setPinnedItems] = useState<string[]>(['Dashboard', 'Repositories']);

  const togglePin = (name: string) => {
    setPinnedItems(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <div className="h-full flex flex-col bg-white border-r-2 border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 justify-between border-b-2 border-gray-200">
        <FileText className="h-8 w-8 text-blue-600" />
        {!collapsed && <span className="ml-2 text-xl font-bold text-gray-900">DocGO</span>}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${collapsed ? 'px-1 py-2' : 'px-2 py-4'} overflow-y-auto space-y-6`}>
        {navigationGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            {!collapsed && (
              <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              const isPinned = pinnedItems.includes(item.name);

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
                        <span className="flex-1">{item.name}</span>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            togglePin(item.name);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Star
                            className={`h-4 w-4 ${isPinned ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`}
                          />
                        </button>
                      </>
                    )}
                  </Link>
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

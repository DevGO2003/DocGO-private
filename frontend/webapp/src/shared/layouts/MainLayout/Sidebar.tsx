import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
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

const NAV_ITEMS = [
  { name: 'dashboard', href: '/dashboard', icon: Home },
  { name: 'repositories', href: '/repositories', icon: Folder },
  { name: 'upload', href: '/upload', icon: Upload },
  { name: 'analytics', href: '/analytics', icon: BarChart3 },
  { name: 'documents', href: '/documents', icon: FileText },
  { name: 'organizations', href: '/organizations', icon: Building2 },
  { name: 'users', href: '/users', icon: Users },
  { name: 'settings', href: '/settings', icon: Settings },
];

const STORAGE_KEYS = {
  PINNED_ITEMS: 'sidebar_pinned_items',
  MENU_ORDER: 'sidebar_menu_order',
};

export const Sidebar = ({ collapsed = false, onCollapseToggle, onClose }: SidebarProps) => {
  const location = useLocation();
  const { t } = useTranslation();
  const [pinnedItems, setPinnedItems] = useState<string[]>(['dashboard', 'repositories']);
  const [editMode, setEditMode] = useState(false);
  const [editingLabel, setEditingLabel] = useState<string | null>(null);
  const [customLabels, setCustomLabels] = useState<Record<string, string>>({});
  const [menuOrder, setMenuOrder] = useState<string[]>([]);
  const [customGroupLabels, setCustomGroupLabels] = useState<Record<string, string>>({});
  const [editingGroupLabel, setEditingGroupLabel] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PINNED_ITEMS);
      if (saved) setPinnedItems(JSON.parse(saved));
      
      const savedLabels = localStorage.getItem('sidebar_custom_labels');
      if (savedLabels) setCustomLabels(JSON.parse(savedLabels));
      
      const savedGroupLabels = localStorage.getItem('sidebar_custom_group_labels');
      if (savedGroupLabels) setCustomGroupLabels(JSON.parse(savedGroupLabels));
      
      const savedOrder = localStorage.getItem(STORAGE_KEYS.MENU_ORDER);
      if (savedOrder) {
        setMenuOrder(JSON.parse(savedOrder));
      } else {
        // Initialize with default order
        setMenuOrder(NAV_ITEMS.map(item => item.name));
      }
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

  // Save menu order to localStorage
  useEffect(() => {
    if (menuOrder.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEYS.MENU_ORDER, JSON.stringify(menuOrder));
      } catch (e) {
        console.error('Failed to save menu order:', e);
      }
    }
  }, [menuOrder]);

  // Save custom labels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_custom_labels', JSON.stringify(customLabels));
    } catch (e) {
      console.error('Failed to save custom labels:', e);
    }
  }, [customLabels]);

  // Save custom group labels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_custom_group_labels', JSON.stringify(customGroupLabels));
    } catch (e) {
      console.error('Failed to save custom group labels:', e);
    }
  }, [customGroupLabels]);

  const togglePin = (name: string) => {
    setPinnedItems(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Get all items from all groups
    const allItems = navigationGroups.flatMap(g => g.items);
    
    // Create a map of item name to group
    const itemToGroup = new Map<string, string>();
    navigationGroups.forEach(group => {
      group.items.forEach(item => {
        itemToGroup.set(item.name, group.key);
      });
    });

    // Get current order
    const newOrder = Array.from(menuOrder);
    
    // Find the item being moved
    const movedItemName = allItems.find(item => 
      itemToGroup.get(item.name) === source.droppableId
    )?.name;
    
    if (!movedItemName) return;

    // Remove from source position
    const sourceIndex = newOrder.indexOf(movedItemName);
    if (sourceIndex !== -1) {
      newOrder.splice(sourceIndex, 1);
    }

    // Insert at destination position
    const destinationGroupItems = navigationGroups.find(g => g.key === destination.droppableId)?.items || [];
    const destinationItemName = destinationGroupItems[destination.index]?.name;
    
    if (destinationItemName) {
      const destIndex = newOrder.indexOf(destinationItemName);
      if (destIndex !== -1) {
        newOrder.splice(destIndex, 0, movedItemName);
      } else {
        newOrder.push(movedItemName);
      }
    } else {
      newOrder.push(movedItemName);
    }

    setMenuOrder(newOrder);
  };

  const updateLabel = (name: string, newLabel: string) => {
    if (newLabel.trim()) {
      setCustomLabels(prev => ({ ...prev, [name]: newLabel }));
    }
    setEditingLabel(null);
  };

  const updateGroupLabel = (groupKey: string, newLabel: string) => {
    if (newLabel.trim()) {
      setCustomGroupLabels(prev => ({ ...prev, [groupKey]: newLabel }));
    }
    setEditingGroupLabel(null);
  };

  const getItemLabel = (name: string) => {
    switch (name) {
      case 'dashboard': return t('nav.dashboard');
      case 'repositories': return t('nav.repositories');
      case 'upload': return t('nav.upload');
      case 'analytics': return t('nav.analytics');
      case 'documents': return t('nav.documents');
      case 'organizations': return t('nav.organizations');
      case 'users': return t('nav.users');
      case 'settings': return t('nav.settings');
      default: return name;
    }
  };

  const getDisplayLabel = (name: string) => {
    const localized = getItemLabel(name);
    return customLabels[name] || localized;
  };

  const getGroupDisplayLabel = (groupKey: string) => {
    const localized = t(`sidebar.groups.${groupKey}`);
    return customGroupLabels[groupKey] || localized;
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Build navigation groups with localized titles
  const navigationGroups = [
    {
      key: 'storage',
      title: t('sidebar.groups.storage'),
      items: NAV_ITEMS.filter(i => ['dashboard','repositories','upload','analytics'].includes(i.name))
    },
    {
      key: 'management',
      title: t('sidebar.groups.management'),
      items: NAV_ITEMS.filter(i => ['documents','organizations','users'].includes(i.name))
    },
    {
      key: 'settings',
      title: t('sidebar.groups.settings'),
      items: NAV_ITEMS.filter(i => ['settings'].includes(i.name))
    },
  ];

  // Get all items and separate into pinned and regular
  const allItems = navigationGroups.flatMap(g => g.items);
  const pinnedItemsList = allItems.filter(item => pinnedItems.includes(item.name));

  return (
    <div className="h-full flex flex-col bg-white border-r-2 border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center px-4 justify-between border-b-2 border-gray-200">
        <div className="flex items-center gap-2">
          <FileText className="h-8 w-8 text-blue-600" />
          {!collapsed && <span className="text-xl font-bold text-gray-900">{t('app.title')}</span>}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Collapse/Expand Button */}
          <button
            onClick={() => onCollapseToggle?.()}
            className="p-2 border-2 border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group"
            title={collapsed ? t('sidebar.tooltips.expand') : t('sidebar.tooltips.collapse')}
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
              title={t('sidebar.tooltips.editMode')}
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
                {t('sidebar.favorites')}
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
                          title={t('sidebar.tooltips.unpin')}
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
        <DragDropContext onDragEnd={handleDragEnd}>
          {navigationGroups.map((group) => (
            <div key={group.key} className="space-y-2">
              {!collapsed && (
                <div className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center justify-between group">
                  {editingGroupLabel === group.key ? (
                    <input
                      type="text"
                      defaultValue={getGroupDisplayLabel(group.key)}
                      onBlur={(e) => updateGroupLabel(group.key, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          updateGroupLabel(group.key, e.currentTarget.value);
                        } else if (e.key === 'Escape') {
                          setEditingGroupLabel(null);
                        }
                      }}
                      autoFocus
                      className="w-full px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      placeholder={t('sidebar.placeholder.groupName')}
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:text-gray-700"
                      onClick={() => editMode && setEditingGroupLabel(group.key)}
                      title={editMode ? t('sidebar.tooltips.editGroupLabel') : ''}
                    >
                      {getGroupDisplayLabel(group.key)}
                    </span>
                  )}
                  {editMode && editingGroupLabel !== group.key && (
                    <button
                      onClick={() => setEditingGroupLabel(group.key)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
                      title={t('sidebar.tooltips.editGroupLabel')}
                    >
                      <Edit2 className="h-3 w-3 text-gray-400" />
                    </button>
                  )}
                </div>
              )}
              <Droppable droppableId={group.key}>
                {(provided: any, snapshot: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-2 ${
                      snapshot.isDraggingOver ? 'bg-blue-50 rounded-lg p-2' : ''
                    }`}
                  >
                    {group.items
                      .sort((a, b) => {
                        const aIndex = menuOrder.indexOf(a.name);
                        const bIndex = menuOrder.indexOf(b.name);
                        return aIndex - bIndex;
                      })
                      .map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);

                        return (
                          <Draggable
                            key={item.name}
                            draggableId={item.name}
                            index={index}
                            isDragDisabled={!editMode}
                          >
                            {(provided: any, snapshot: any) => (
                              <motion.div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`${
                                  snapshot.isDragging ? 'z-50 shadow-lg' : ''
                                }`}
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
                                    ${editMode ? 'cursor-move' : ''}
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
                                        title={editMode ? t('sidebar.tooltips.editLabel') : t('sidebar.tooltips.pin')}
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
                                      placeholder={t('sidebar.placeholder.labelName')}
                                    />
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </Draggable>
                        );
                      })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </DragDropContext>
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

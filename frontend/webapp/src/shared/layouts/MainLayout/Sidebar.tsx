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
import { NoRecentRepositoryModal } from '../../components/UIComponents/Modal/NoRecentRepositoryModal';
import { useRecentRepositories } from '../../hooks/useRecentRepositories';

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
  { name: 'documents', href: '/repositories', icon: FileText },
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
  const [availableLabels, setAvailableLabels] = useState<string[]>(['storage', 'management', 'settings']);
  const [itemLabels, setItemLabels] = useState<Record<string, string>>({});
  const [showLabelManager, setShowLabelManager] = useState(false);
  const [showNoRecentModal, setShowNoRecentModal] = useState(false);
  
  const { navigateToRecentRepository, navigateToRepositories } = useRecentRepositories();

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PINNED_ITEMS);
      if (saved) setPinnedItems(JSON.parse(saved));
      
      const savedLabels = localStorage.getItem('sidebar_custom_labels');
      if (savedLabels) setCustomLabels(JSON.parse(savedLabels));
      
      const savedGroupLabels = localStorage.getItem('sidebar_custom_group_labels');
      if (savedGroupLabels) setCustomGroupLabels(JSON.parse(savedGroupLabels));
      
      const savedAvailableLabels = localStorage.getItem('sidebar_available_labels');
      if (savedAvailableLabels) setAvailableLabels(JSON.parse(savedAvailableLabels));
      
      const savedItemLabels = localStorage.getItem('sidebar_item_labels');
      if (savedItemLabels) setItemLabels(JSON.parse(savedItemLabels));
      
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

  // Save available labels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_available_labels', JSON.stringify(availableLabels));
    } catch (e) {
      console.error('Failed to save available labels:', e);
    }
  }, [availableLabels]);

  // Save item labels to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sidebar_item_labels', JSON.stringify(itemLabels));
    } catch (e) {
      console.error('Failed to save item labels:', e);
    }
  }, [itemLabels]);

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

  const addNewLabel = (labelName: string) => {
    if (labelName.trim() && !availableLabels.includes(labelName.trim())) {
      setAvailableLabels(prev => [...prev, labelName.trim()]);
    }
  };

  const removeLabel = (labelName: string) => {
    if (labelName !== 'others') { // Không cho phép xóa label "others"
      setAvailableLabels(prev => prev.filter(label => label !== labelName));
      // Di chuyển các item có label này về "others"
      setItemLabels(prev => {
        const newLabels = { ...prev };
        Object.keys(newLabels).forEach(itemName => {
          if (newLabels[itemName] === labelName) {
            newLabels[itemName] = 'others';
          }
        });
        return newLabels;
      });
    }
  };

  const assignItemToLabel = (itemName: string, labelName: string) => {
    setItemLabels(prev => ({ ...prev, [itemName]: labelName }));
  };

  const handleFilesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateToRecentRepository(() => setShowNoRecentModal(true));
  };

  const handleGoToRepositories = () => {
    setShowNoRecentModal(false);
    navigateToRepositories();
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

  // Build navigation groups based on labels
  const buildNavigationGroups = () => {
    const groups: Array<{key: string, title: string, items: any[]}> = [];
    
    // Tạo groups cho các labels có sẵn
    availableLabels.forEach(labelKey => {
      const items = NAV_ITEMS.filter(item => itemLabels[item.name] === labelKey);
      if (items.length > 0) {
        groups.push({
          key: labelKey,
          title: getGroupDisplayLabel(labelKey),
          items
        });
      }
    });
    
    // Thêm nhóm "Others" cho các item không có label
    const unlabeledItems = NAV_ITEMS.filter(item => !itemLabels[item.name]);
    if (unlabeledItems.length > 0) {
      groups.push({
        key: 'others',
        title: t('sidebar.groups.others'),
        items: unlabeledItems
      });
    }
    
    return groups;
  };

  const navigationGroups = buildNavigationGroups();

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
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group relative overflow-hidden"
            title={collapsed ? t('sidebar.tooltips.expand') : t('sidebar.tooltips.collapse')}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <svg 
                className={`w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-transform duration-300 ${
                  collapsed ? 'rotate-180' : 'rotate-0'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>
          
          {/* Edit Mode Button */}
          {!collapsed && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLabelManager(!showLabelManager)}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  showLabelManager 
                    ? 'bg-purple-50 text-purple-600 border border-purple-200' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={t('sidebar.tooltips.manageLabels')}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </button>
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
            </div>
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

      {/* Label Manager Panel */}
      {showLabelManager && !collapsed && (
        <div className="px-4 py-3 bg-purple-50 border-b border-purple-200">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-purple-800">{t('sidebar.labelManager.title')}</h3>
              <button
                onClick={() => setShowLabelManager(false)}
                className="p-1 hover:bg-purple-100 rounded"
              >
                <X className="h-4 w-4 text-purple-600" />
              </button>
            </div>
            
            {/* Add New Label */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder={t('sidebar.labelManager.addLabel')}
                className="flex-1 px-2 py-1 text-xs border border-purple-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addNewLabel(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  addNewLabel(input.value);
                  input.value = '';
                }}
                className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                {t('sidebar.labelManager.add')}
              </button>
            </div>
            
            {/* Available Labels */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-purple-700">{t('sidebar.labelManager.availableLabels')}</div>
              <div className="flex flex-wrap gap-1">
                {availableLabels.map(label => (
                  <div key={label} className="flex items-center gap-1 px-2 py-1 bg-white border border-purple-200 rounded text-xs">
                    <span className="text-purple-700">{getGroupDisplayLabel(label)}</span>
                    {label !== 'others' && (
                      <button
                        onClick={() => removeLabel(label)}
                        className="p-0.5 hover:bg-red-100 rounded"
                        title={t('sidebar.labelManager.removeLabel')}
                      >
                        <X className="h-3 w-3 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

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
                  {item.name === 'documents' ? (
                    <button
                      onClick={handleFilesClick}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left
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
                          <div className="flex items-center gap-1">
                            {editMode && (
                              <select
                                value={itemLabels[item.name] || 'others'}
                                onChange={(e) => assignItemToLabel(item.name, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {availableLabels.map(label => (
                                  <option key={label} value={label}>
                                    {getGroupDisplayLabel(label)}
                                  </option>
                                ))}
                                <option value="others">{t('sidebar.groups.others')}</option>
                              </select>
                            )}
                            <div
                              role="button"
                              tabIndex={0}
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
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  if (editMode) {
                                    setEditingLabel(item.name);
                                  } else {
                                    togglePin(item.name);
                                  }
                                }
                              }}
                            >
                              {editMode ? (
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Star className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </button>
                  ) : (
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
                          <div className="flex items-center gap-1">
                            {editMode && (
                              <select
                                value={itemLabels[item.name] || 'others'}
                                onChange={(e) => assignItemToLabel(item.name, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {availableLabels.map(label => (
                                  <option key={label} value={label}>
                                    {getGroupDisplayLabel(label)}
                                  </option>
                                ))}
                                <option value="others">{t('sidebar.groups.others')}</option>
                              </select>
                            )}
                        <div
                          role="button"
                          tabIndex={0}
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              if (editMode) {
                                setEditingLabel(item.name);
                              } else {
                                togglePin(item.name);
                              }
                            }
                          }}
                        >
                          {editMode ? (
                            <GripVertical className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Star className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                          </div>
                      </>
                    )}
                  </Link>
                  )}
                  
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
      
      {/* No Recent Repository Modal */}
      <NoRecentRepositoryModal
        isOpen={showNoRecentModal}
        onClose={() => setShowNoRecentModal(false)}
        onGoToRepositories={handleGoToRepositories}
      />
    </div>
  );
};

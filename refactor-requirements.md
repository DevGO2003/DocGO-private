# 🔧 Yêu Cầu Refactor - WebApp Frontend

## 📋 Tổng Quan

Tài liệu này mô tả chi tiết các thay đổi cần thực hiện cho 5 phần:
1. **Profile Page** (`/profile`)
2. **Dashboard Page** (`/dashboard`)
3. **Repositories List Page** (`/repositories`)
4. **Repository Detail Page** (`/repositories/:id`)
5. **Repository Files List Page** (`/repositories/:id/files`)

---

## 📄 PHẦN 1: PROFILE PAGE (`http://localhost:3000/profile`)

### 🎯 Mục Tiêu
1. Bỏ viền của Label components
2. Bỏ phần "Vai trò" (role) vì mỗi user có vai trò trong nhiều dự án, không phải toàn hệ thống
3. Kho mã và Tổ chức chưa có API (ghi chú/TODO)

### 📁 Files Bị Ảnh Hưởng

#### File 1: `frontend/webapp/src/features/profile/views/pages/Profile/Profile.tsx`

**Thay đổi 1.1: Bỏ viền Label**

- **Vị trí**: Lines 208, 224, 244, 261, 282, 298
- **Hiện tại**: Đang dùng `<Label>` component có viền (từ CommonLabel với canvas border)
- **Yêu cầu**: Thay bằng `<label>` HTML thông thường hoặc Label không có viền

```tsx
// TRƯỚC:
<Label className="flex items-center gap-2 mb-2">
  <User className="w-4 h-4" />
  {t('profile.labels.firstName')}
</Label>

// SAU:
<label className="flex items-center gap-2 mb-2 text-sm font-medium text-gray-700">
  <User className="w-4 h-4" />
  {t('profile.labels.firstName')}
</label>
```

**Thay đổi 1.2: Bỏ Role Badge**

- **Vị trí**: Lines 139-142
- **Yêu cầu**: Xóa hoàn toàn badge hiển thị role

```tsx
// TRƯỚC:
{/* Role Badge */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  {user.role}
</span>

// SAU:
// XÓA HOÀN TOÀN
```

**Thay đổi 1.3: Bỏ Role trong Account Info**

- **Vị trí**: Lines 327-331
- **Yêu cầu**: Xóa phần hiển thị role trong Account Info section

```tsx
// TRƯỚC:
<div className="flex items-center justify-between">
  <span className="text-sm text-gray-600">{t('profile.account.role')}</span>
  <span className="text-sm font-medium text-gray-900">
    {user.role}
  </span>
</div>

// SAU:
// XÓA HOÀN TOÀN
```

**Thay đổi 1.4: Thêm TODO cho Kho mã và Tổ chức**

- **Vị trí**: Sau line 313 (trong Details Card, sau Work Fields)
- **Yêu cầu**: Thêm section placeholder với TODO comment

```tsx
{/* TODO: Kho mã và Tổ chức - Chưa có API */}
<div className="pt-6 border-t border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">
    {t('profile.repositoriesAndOrganizations')}
  </h3>
  <div className="text-sm text-gray-500 italic">
    {/* API đang được phát triển */}
  </div>
</div>
```

#### File 2: `frontend/webapp/src/shared/components/UIComponents/Label/CommonLabel.tsx` (OPTIONAL)

**Thay đổi 1.5: Thêm prop `noBorder` (nếu muốn giữ Label component)**

- **Yêu cầu**: Thêm option để bỏ viền cho Label component

```tsx
// Thêm vào interface
interface CommonLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
  noBorder?: boolean; // NEW
}

// Trong component, chỉ vẽ canvas khi !noBorder
useEffect(() => {
  if (noBorder) return; // Skip drawing border
  drawCanvas();
  const timer = setTimeout(drawCanvas, 100);
  return () => clearTimeout(timer);
}, [noBorder, error, className, children]);
```

---

## 🎛️ PHẦN 2: DASHBOARD PAGE (`http://localhost:3000/dashboard`)

### 🎯 Mục Tiêu
1. ✅ Đảm bảo chỉ hiển thị thông tin của user đang đăng nhập (đã có, kiểm tra lại)
2. Tạo `CommonPanel` và `WindowPanel` components
3. Dashboard sử dụng `WindowPanel` với drag & drop
4. Có dropdown để quản lý panels (show/hide)
5. Minimize/Close functionality

### 📁 Files Cần Tạo

#### File 1: `frontend/webapp/src/shared/components/UIComponents/Panel/CommonPanel.tsx` (TẠO MỚI)

**Mô tả**: Base panel component với layout chuẩn

```tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';

interface CommonPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}

export const CommonPanel: React.FC<CommonPanelProps> = ({
  title,
  children,
  className = '',
  headerActions,
  footer,
  loading = false,
}) => {
  return (
    <Card className={className}>
      {(title || headerActions) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="py-6"><LoadingSpinner /></div>
        ) : (
          children
        )}
      </CardContent>
      {footer && <div className="px-6 py-4 border-t">{footer}</div>}
    </Card>
  );
};

export default CommonPanel;
```

#### File 2: `frontend/webapp/src/shared/components/UIComponents/Panel/WindowPanel.tsx` (TẠO MỚI)

**Mô tả**: WindowPanel extend CommonPanel với drag, minimize, close

**Features**:
- 3 nút ở header: Drag handle (☰), Minimize (⊖), Close (✕)
- Drag & drop để di chuyển panel
- Minimize: toggle height (từ 500px → 200px)
- Close: ẩn panel (tương đương visible=false)

```tsx
import React, { useState, useRef } from 'react';
import { GripVertical, Minus2, X } from 'lucide-react';
import CommonPanel from './CommonPanel';

interface WindowPanelProps {
  id: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minimized?: boolean;
  visible?: boolean;
  position?: { x: number; y: number };
  onMinimize?: (minimized: boolean) => void;
  onClose?: () => void;
  onPositionChange?: (id: string, x: number, y: number) => void;
  footer?: React.ReactNode;
  loading?: boolean;
}

export const WindowPanel: React.FC<WindowPanelProps> = ({
  id,
  title,
  children,
  className = '',
  defaultWidth = 400,
  defaultHeight = 500,
  minimized: controlledMinimized,
  visible: controlledVisible = true,
  position: controlledPosition,
  onMinimize,
  onClose,
  onPositionChange,
  footer,
  loading = false,
}) => {
  const [internalMinimized, setInternalMinimized] = useState(false);
  const [internalPosition, setInternalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const minimized = controlledMinimized !== undefined ? controlledMinimized : internalMinimized;
  const position = controlledPosition || internalPosition;
  const visible = controlledVisible;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    const newPosition = { x: newX, y: newY };
    setInternalPosition(newPosition);
    onPositionChange?.(id, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleMinimize = () => {
    const newMinimized = !minimized;
    if (onMinimize) {
      onMinimize(newMinimized);
    } else {
      setInternalMinimized(newMinimized);
    }
  };

  const handleClose = () => {
    onClose?.();
  };

  if (!visible) return null;

  const height = minimized ? 200 : defaultHeight;

  return (
    <div
      ref={panelRef}
      className={`absolute ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${defaultWidth}px`,
        height: `${height}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      <CommonPanel
        title={title}
        headerActions={
          <div className="flex items-center gap-1">
            {/* Drag Handle */}
            <button
              onMouseDown={handleMouseDown}
              className="p-1 hover:bg-gray-100 rounded cursor-grab active:cursor-grabbing"
              title="Di chuyển"
            >
              <GripVertical className="w-4 h-4 text-gray-500" />
            </button>
            {/* Minimize */}
            <button
              onClick={handleMinimize}
              className="p-1 hover:bg-gray-100 rounded"
              title={minimized ? "Mở rộng" : "Thu nhỏ"}
            >
              <Minus2 className="w-4 h-4 text-gray-500" />
            </button>
            {/* Close */}
            <button
              onClick={handleClose}
              className="p-1 hover:bg-red-100 rounded"
              title="Đóng"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        }
        footer={footer}
        loading={loading}
      >
        {minimized ? (
          <div className="text-sm text-gray-500 text-center py-8">
            Panel đã được thu nhỏ
          </div>
        ) : (
          children
        )}
      </CommonPanel>
    </div>
  );
};

export default WindowPanel;
```

#### File 3: `frontend/webapp/src/shared/components/UIComponents/Panel/index.ts` (TẠO MỚI)

```tsx
export { CommonPanel } from './CommonPanel';
export { WindowPanel } from './WindowPanel';
export type { CommonPanelProps } from './CommonPanel';
export type { WindowPanelProps } from './WindowPanel';
```

#### File 4: `frontend/webapp/src/features/dashboard/components/PanelSelector.tsx` (TẠO MỚI)

**Mô tả**: Dropdown để quản lý visible panels

```tsx
import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from '@shared/components';

interface PanelOption {
  id: string;
  label: string;
  visible: boolean;
}

interface PanelSelectorProps {
  panels: PanelOption[];
  onToggle: (id: string) => void;
}

export const PanelSelector: React.FC<PanelSelectorProps> = ({ panels, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        Quản lý Panel
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              {panels.map((panel) => (
                <label
                  key={panel.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={panel.visible}
                    onChange={() => onToggle(panel.id)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-sm text-gray-700">{panel.label}</span>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PanelSelector;
```

### 📁 Files Cần Sửa

#### File 5: `frontend/webapp/src/features/dashboard/views/pages/Dashboard/Dashboard.tsx`

**Thay đổi 2.1: Thêm state quản lý panels**

```tsx
// Thêm sau line 26
const [panels, setPanels] = useState([
  { id: 'stats', label: 'Thống kê', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'repositories', label: 'Repositories gần đây', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'files', label: 'Files gần đây', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'organizations', label: 'Tổ chức', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'quickActions', label: 'Hành động nhanh', visible: true, minimized: false, position: { x: 0, y: 0 } },
]);

const togglePanel = (id: string) => {
  setPanels(prev => prev.map(p => 
    p.id === id ? { ...p, visible: !p.visible } : p
  ));
};

const minimizePanel = (id: string) => {
  setPanels(prev => prev.map(p => 
    p.id === id ? { ...p, minimized: !p.minimized } : p
  ));
};

const closePanel = (id: string) => {
  setPanels(prev => prev.map(p => 
    p.id === id ? { ...p, visible: false } : p
  ));
};

const updatePanelPosition = (id: string, x: number, y: number) => {
  setPanels(prev => prev.map(p => 
    p.id === id ? { ...p, position: { x, y } } : p
  ));
};
```

**Thay đổi 2.2: Thêm PanelSelector vào headerRight**

```tsx
// Import
import PanelSelector from '../../components/PanelSelector';

// Trong DashboardLayout headerRight (sau line 138)
headerRight={
  <div className="flex items-center gap-2">
    <PanelSelector
      panels={panels.map(p => ({ id: p.id, label: p.label, visible: p.visible }))}
      onToggle={togglePanel}
    />
    <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
  </div>
}
```

**Thay đổi 2.3: Đổi Stats Grid từ Card sang WindowPanel**

```tsx
// TRƯỚC (lines 156-186):
<motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  {stats.map((stat, index) => (
    <motion.div key={index}>
      <Card className="h-full">
        <CardContent>...</CardContent>
      </Card>
    </motion.div>
  ))}
</motion.div>

// SAU:
import { WindowPanel } from '@shared/components/UIComponents/Panel';

<div className="relative min-h-[600px]">
  {stats.map((stat, index) => {
    const panel = panels.find(p => p.id === `stat-${index}`);
    if (!panel?.visible) return null;
    
    return (
      <WindowPanel
        key={index}
        id={`stat-${index}`}
        title={stat.title}
        defaultWidth={280}
        defaultHeight={200}
        minimized={panel.minimized}
        visible={panel.visible}
        position={panel.position}
        onMinimize={() => minimizePanel(`stat-${index}`)}
        onClose={() => closePanel(`stat-${index}`)}
        onPositionChange={(id, x, y) => updatePanelPosition(id, x, y)}
      >
        {/* Stat content */}
      </WindowPanel>
    );
  })}
</div>
```

**Thay đổi 2.4: Đổi Recent Repositories từ Card sang WindowPanel**

```tsx
// TRƯỚC (lines 190-236): Card component

// SAU:
const reposPanel = panels.find(p => p.id === 'repositories');

{reposPanel?.visible && (
  <WindowPanel
    id="repositories"
    title={t('dashboard.recentRepositories')}
    defaultWidth={500}
    defaultHeight={400}
    minimized={reposPanel.minimized}
    visible={reposPanel.visible}
    position={reposPanel.position}
    onMinimize={() => minimizePanel('repositories')}
    onClose={() => closePanel('repositories')}
    onPositionChange={updatePanelPosition}
  >
    {/* Repository list content */}
  </WindowPanel>
)}
```

**Thay đổi 2.5: Đổi Recent Files từ Card sang WindowPanel** (tương tự 2.4)

**Thay đổi 2.6: Đổi Organizations từ Card sang WindowPanel** (tương tự 2.4)

**Thay đổi 2.7: Đổi Quick Actions từ Card sang WindowPanel** (tương tự 2.4)

**Thay đổi 2.8: Kiểm tra filter theo userId** (đã có sẵn, chỉ cần verify)

- Lines 29, 32-35: Đã có filter theo userId ✅
- Không cần thay đổi

---

## 📁 PHẦN 4: REPOSITORY DETAIL PAGE (`http://localhost:3000/repositories/:id`)

### 🎯 Mục Tiêu
1. Thêm tab "Thông tin Repository" mới
2. Xóa tab "Cài đặt"
3. Xóa nút cài đặt ở header
4. Disable tab "Hoạt động" với tooltip "Tạm thời chưa có, tương lai các phiên bản kế tiếp sẽ có"
5. Xóa phần header info bị trùng (đã có trong RepositoryLayout)
6. Xóa nút quay lại
7. Hiển thị tên repository thay vì ID (fetch từ API)
8. Implement mời thành viên: Personal dùng link sharing, Organization chọn thành viên trong tổ chức
9. Admin có thể cấp quyền (upload, view, delete) cho thành viên
10. Mặc định người upload có quyền view và delete

### 📁 Files Bị Ảnh Hưởng

#### File 1: `frontend/webapp/src/features/repositories/views/pages/RepositoryDetail/RepositoryDetail.tsx`

**Thay đổi 4.1: Thêm tab Info mới và xóa tab Settings**

- **Vị trí**: Lines 258-305 (tabs navigation)
- **Thay đổi**: Thêm tab "Thông tin" làm tab đầu tiên, xóa tab "Cài đặt"
- **Import**: Thêm `Info` icon từ lucide-react

```tsx
// TRƯỚC:
import {
  ArrowLeft, 
  Settings, 
  Users, 
  FileText, 
  Activity,
  Building,
  User,
  Lock,
  Globe,
  Calendar,
  HardDrive
} from 'lucide-react';

const [activeTab, setActiveTab] = useState('files');

<Tabs className="border-b border-gray-200 mb-6">
  <TabList className="flex gap-4">
    <CommonTab value="files" activeValue={activeTab} onSelect={() => setActiveTab('files')}>
      {/* Files tab */}
    </CommonTab>
    <CommonTab value="members" activeValue={activeTab} onSelect={() => setActiveTab('members')}>
      {/* Members tab */}
    </CommonTab>
    <CommonTab value="activity" activeValue={activeTab} onSelect={() => setActiveTab('activity')}>
      {/* Activity tab */}
    </CommonTab>
    <CommonTab value="settings" activeValue={activeTab} onSelect={() => setActiveTab('settings')}>
      {/* Settings tab */}
    </CommonTab>
  </TabList>
</Tabs>

// SAU:
import {
  ArrowLeft, 
  Settings, 
  Users, 
  FileText, 
  Activity,
  Building,
  User,
  Lock,
  Globe,
  Calendar,
  HardDrive,
  Info // THÊM
} from 'lucide-react';

const [activeTab, setActiveTab] = useState('info'); // ĐỔI default

<Tabs className="border-b border-gray-200 mb-6">
  <TabList className="flex gap-4">
    <CommonTab value="info" activeValue={activeTab} onSelect={() => setActiveTab('info')} className="pb-3 px-4">
      <div className="flex items-center gap-2">
        <Info className="w-4 h-4" />
        {t('repositories.detail.tabs.info')}
      </div>
    </CommonTab>
    <CommonTab value="files" activeValue={activeTab} onSelect={() => setActiveTab('files')}>
      {/* Files tab */}
    </CommonTab>
    <CommonTab value="members" activeValue={activeTab} onSelect={() => setActiveTab('members')}>
      {/* Members tab */}
    </CommonTab>
    <CommonTab value="activity" activeValue={activeTab} onSelect={() => setActiveTab('activity')} disabled title="Tạm thời chưa có, tương lai các phiên bản kế tiếp sẽ có">
      <div className="flex items-center gap-2">
        <Activity className="w-4 h-4" />
        {t('repositories.detail.tabs.activity')}
      </div>
    </CommonTab>
    {/* XÓA tab settings */}
  </TabList>
</Tabs>
```

**Thay đổi 4.2: Thêm Tab Content cho Info**

- **Vị trí**: Sau line 358 (trước files tab content)
- **Thay đổi**: Thêm nội dung cho tab Info, di chuyển phần thông tin repository vào đây

```tsx
{/* Tab Content */}
{activeTab === 'info' && (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-2">
            {t('repositories.detail.info.description')}
          </h4>
          <p className="text-gray-600">
            {repository?.description || t('repositories.detail.info.noDescription')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              {t('repositories.detail.info.owner')}
            </h4>
            <p className="text-gray-600">
              {repository?.ownerName || 'Không có'}
            </p>
          </div>
          {repository?.organizationId && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                {t('repositories.detail.info.organization')}
              </h4>
              <p className="text-gray-600">
                {repository?.organizationName || 'Không có'}
              </p>
            </div>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)}

{activeTab === 'files' && (
  // Files content
)}
```

**Thay đổi 4.3: Xóa toàn bộ Header Info và nút Quay lại**

- **Vị trí**: Lines 126-174 (toàn bộ section này)
- **Thay đổi**: Xóa hoàn toàn vì đã có trong RepositoryLayout

```tsx
// TRƯỚC:
<div className="mb-6">
  <div className="flex items-center justify-between mb-4">
    <Button
      variant="outline"
      onClick={handleBack}
      className="text-gray-500 hover:text-gray-700"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {t('repositories.detail.back')}
    </Button>
    <Button
      variant="outline"
      onClick={handleSettings}
      className="inline-flex items-center gap-2"
    >
      <Settings className="w-4 h-4" />
      {t('repositories.detail.settings')}
    </Button>
  </div>
  {repository && (
    <div className="flex items-center gap-3 mb-2">
      {repository.type === 'ORGANIZATION' ? (
        <Building className="w-8 h-8 text-purple-500" />
      ) : (
        <User className="w-8 h-8 text-blue-500" />
      )}
      <h1 className="text-3xl font-bold text-gray-900">{repository.name}</h1>
    </div>
  )}
  {/* ... more info */}
</div>

// SAU:
{/* XÓA HOÀN TOÀN - Thông tin đã có trong RepositoryLayout header */}
```

**Thay đổi 4.4: Xóa Repository Info Card**

- **Vị trí**: Lines 177-253
- **Thay đổi**: Xóa grid layout với Info Card và Stats Sidebar, chuyển vào tab Info

```tsx
// TRƯỚC:
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
  <div className="lg:col-span-3">
    <Card>
      <CardHeader>
        <CardTitle>{t('repositories.detail.info.title')}</CardTitle>
      </CardHeader>
      {/* Info content */}
    </Card>
  </div>
  <div className="lg:col-span-1">
    <Card>
      <CardHeader>
        <CardTitle>{t('repositories.detail.stats.title')}</CardTitle>
      </CardHeader>
      {/* Stats content */}
    </Card>
  </div>
</div>

// SAU:
{/* XÓA - Di chuyển vào các tabs tương ứng */}
```

**Thay đổi 4.5: Disable Activity tab với tooltip**

- **Vị trí**: Lines 282-292
- **Thay đổi**: Disable và thêm tooltip hover

```tsx
<CommonTab
  value="activity"
  activeValue={activeTab}
  onSelect={() => {}} // Disable by empty function
  disabled={true}
  className="pb-3 px-4 opacity-50 cursor-not-allowed"
  title="Tạm thời chưa có, tương lai các phiên bản kế tiếp sẽ có"
>
  <div className="flex items-center gap-2">
    <Activity className="w-4 h-4" />
    {t('repositories.detail.tabs.activity')}
  </div>
</CommonTab>
```

**Thay đổi 4.6: Xóa Settings tab content**

- **Vị trí**: Lines 393-407
- **Thay đổi**: Xóa hoàn toàn

```tsx
// TRƯỚC:
{activeTab === 'settings' && (
  <Card>
    <CardContent className="p-6">
      {/* Settings content */}
    </CardContent>
  </Card>
)}

// SAU:
{/* XÓA HOÀN TOÀN */}
```

**Thay đổi 4.7: Thêm Invite Member functionality**

- **Vị trí**: Lines 360-375 (members tab)
- **Thay đổi**: Thêm logic mời thành viên

```tsx
// Thêm state
const [showInviteModal, setShowInviteModal] = useState(false);

// Thêm handler
const handleInviteMember = () => {
  setShowInviteModal(true);
};

// Cập nhật members tab
{activeTab === 'members' && (
  <Card>
    <CardContent className="p-6">
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('repositories.detail.empty.members.title')}
        </h3>
        <p className="text-gray-600 mb-4">
          {t('repositories.detail.empty.members.desc')}
        </p>
        <Button onClick={handleInviteMember}>
          {t('repositories.detail.empty.members.invite')}
        </Button>
      </div>
    </CardContent>
  </Card>
)}

// Thêm modal (tạo component mới)
{showInviteModal && (
  <InviteRepositoryMemberModal
    open={showInviteModal}
    onClose={() => setShowInviteModal(false)}
    repositoryId={repository?.id || ''}
    repositoryType={repository?.type || 'PERSONAL'}
  />
)}
```

---

## 📂 PHẦN 5: REPOSITORY FILES LIST PAGE (`http://localhost:3000/repositories/:id/files`)

### 🎯 Mục Tiêu
1. Bỏ giới hạn kích thước components trong HeaderControlLayout
2. Bỏ div wrapper quanh FilesFilters để nút Làm mới vào Right Section
3. Thêm i18n cho các phần còn thiếu
4. Show more chỉ hiện khi có nhiều dữ liệu
5. Đổi "Xóa tìm kiếm" thành "Xóa tìm kiếm và làm mới"

### 📁 Files Bị Ảnh Hưởng

#### File 1: `frontend/webapp/src/features/repositories/views/components/FilesFilters/FilesFilters.tsx`

**Thay đổi 5.1: Xóa div wrapper**

- **Vị trí**: Line 78
- **Thay đổi**: Bỏ wrapper div để component render trực tiếp

```tsx
// TRƯỚC:
return (
  <div className="bg-white/80 backdrop-blur rounded-lg p-[0px] w-full">
    {/* Row 1: Search + Sort + SortDir + Refresh (compact) */}
    <div className="flex items-center gap-[5px] w-full">
      {/* Content */}
    </div>
    {/* Row 2: Advanced toggle */}
    <div className="flex items-center gap-[5px] w-full mt-[5px]">
      {/* Content */}
    </div>
    {/* Row 3: Actions */}
    <div className="mt-[5px] flex items-center gap-[5px] justify-end">
      {/* Content */}
    </div>
  </div>
);

// SAU:
return (
  <>
    <div className="flex items-center gap-[5px] w-full">
      <div className="flex-1 min-w-[200px]">
        {/* Search input */}
      </div>
      {/* Sort controls */}
    </div>
    <div className="flex items-center gap-[5px] w-full mt-[5px]">
      {/* Advanced filters */}
    </div>
    <div className="mt-[5px] flex items-center gap-[5px] justify-end">
      {/* Actions */}
    </div>
  </>
);
```

#### File 2: `frontend/webapp/src/features/repositories/views/pages/RepositoryFilesList/RepositoryFilesList.tsx`

**Thay đổi 5.2: Bỏ giới hạn kích thước (nếu có)**

- **Vị trí**: Lines 303-329
- **Thay đổi**: Kiểm tra và loại bỏ max-width constraints

```tsx
// Hiện tại đã đúng structure, chỉ cần verify không có max-width
headerChildren={
  <FilesFilters
    search={search}
    onSearchChange={setSearch}
    // ... other props
  />
}
headerRight={
  <RefreshButton onClick={refreshFiles} loading={refreshing} />
}
```

**Thay đổi 5.3: Hiển thị ShowMore conditionally**

- **Vị trí**: Lines 469-480
- **Thay đổi**: Chỉ hiện khi có dữ liệu và hasMore

```tsx
// TRƯỚC:
{hasMore && (
  <div className="flex justify-center mt-6">
    <Button onClick={loadMore} variant="outline" disabled={isLoading}>
      {isLoading ? t('loading') : t('showMore', { count: 10 })}
    </Button>
  </div>
)}

// SAU:
{hasMore && filtered.length > 0 && (
  <div className="flex justify-center mt-6">
    <Button onClick={loadMore} variant="outline" disabled={isLoading}>
      {isLoading ? t('loading') : t('showMore', { count: 10 })}
    </Button>
  </div>
)}
```

**Thay đổi 5.4: Đổi "Xóa tìm kiếm" thành "Xóa và làm mới"**

- **Vị trí**: Line 364
- **Thay đổi**: Thêm logic refresh vào onClick

```tsx
// TRƯỚC:
<Button variant="outline" onClick={() => setSearch('')}>
  {t('repositories.files.empty.clearSearch')}
</Button>

// SAU:
<Button variant="outline" onClick={() => { 
  setSearch('');
  refreshFiles();
}}>
  {t('repositories.files.empty.clearSearchAndRefresh')}
</Button>
```

**Thay đổi 5.5: Thêm i18n**

- **Vị trí**: Các phần hardcoded text
- **Thay đổi**: Thêm translation keys

```tsx
// Tìm và thay các hardcoded strings như:
// "Loading..." → t('loading')
// "Retry" → t('common.retry')
// "Delete X files?" → t('repositories.files.confirmDelete', { count })
// etc.
```

#### File 3: `frontend/webapp/src/shared/layouts/HeaderControlLayout/HeaderControlLayout.tsx`

**Thay đổi 5.6: Kiểm tra và loại bỏ max-width (nếu cần)**

- **Vị trí**: Lines 64-83
- **Thay đổi**: Chỉ áp dụng cho files page nếu cần

```tsx
// Có thể thêm prop để config max-width
interface HeaderControlLayoutProps {
  // ... existing props
  maxTitleWidth?: string; // Thêm prop mới
}

// Usage
<div className={`min-w-0 ${maxTitleWidth || 'max-w-[40%]'}`}>
```

---

### 📄 FILE MỚI CẦN TẠO

#### File: `frontend/webapp/src/features/repositories/views/components/InviteRepositoryMemberModal/InviteRepositoryMemberModal.tsx`

Tham khảo từ `InviteMemberModal` của organizations, tùy chỉnh cho repository:

```tsx
interface InviteRepositoryMemberModalProps {
  open: boolean;
  onClose: () => void;
  repositoryId: string;
  repositoryType: 'PERSONAL' | 'ORGANIZATION';
}

export const InviteRepositoryMemberModal: React.FC<InviteRepositoryMemberModalProps> = ({
  open,
  onClose,
  repositoryId,
  repositoryType,
}) => {
  const { t } = useTranslation();
  
  if (repositoryType === 'PERSONAL') {
    // Hiển thị link sharing
    return (
      <Dialog open={open} onClose={onClose} title="Mời thành viên">
        {/* Link sharing UI */}
      </Dialog>
    );
  } else {
    // Hiển thị danh sách thành viên tổ chức để chọn
    return (
      <Dialog open={open} onClose={onClose} title="Mời thành viên">
        {/* Member selection UI */}
      </Dialog>
    );
  }
};
```

---

#### File: `frontend/webapp/src/i18n/locales/vi/common.json`

**Thay đổi i18n: Thêm keys mới**

- **Vị trí**: Thêm vào section `repositories`
- **Thay đổi**: Thêm các keys mới

```json
{
  "repositories": {
    "detail": {
      "tabs": {
        "info": "Thông tin",
        "files": "Tệp",
        "members": "Thành viên",
        "activity": "Hoạt động",
        "settings": "Cài đặt"
      }
    },
    "files": {
      "empty": {
        "clearSearchAndRefresh": "Xóa tìm kiếm và làm mới"
      },
      "confirmDelete": "Xóa {{count}} file?",
      "permissions": {
        "upload": "Tải lên",
        "view": "Xem",
        "delete": "Xóa"
      }
    }
  }
}
```

---

## 📚 PHẦN 3: REPOSITORIES PAGE (`http://localhost:3000/repositories`)

### 🎯 Mục Tiêu
1. Thay RepositoryTabs custom bằng UIComponent `CommonTabs`
2. Public repositories API đã có fallback (không cần sửa)
3. Hiển thị owner name (không phải ID)
4. Thay các component ngoài UIComponent

### 📁 Files Cần Sửa

#### File 1: `frontend/webapp/src/features/repositories/views/components/RepositoryTabs.tsx`

**Thay đổi 3.1: Thay custom tabs bằng CommonTabs**

```tsx
// TRƯỚC (lines 47-101): Custom button implementation

// SAU:
import { Tabs, TabList, CommonTab } from '@shared/components/UIComponents/Tabs/CommonTabs';

export const RepositoryTabs: React.FC<RepositoryTabsProps> = ({
  activeTab,
  onTabChange,
  personalCount = 0,
  organizationCount = 0,
  publicCount = 0,
}) => {
  const { t } = useTranslation();
  
  const tabs = [
    {
      id: 'PERSONAL' as RepositoryType,
      label: t('repositories.tabs.personal.label'),
      count: personalCount,
      description: t('repositories.tabs.personal.description'),
      icon: User,
    },
    {
      id: 'ORGANIZATION' as RepositoryType,
      label: t('repositories.tabs.organization.label'),
      count: organizationCount,
      description: t('repositories.tabs.organization.description'),
      icon: Building2,
    },
    {
      id: 'PUBLIC' as RepositoryType,
      label: t('repositories.tabs.public.label'),
      count: publicCount,
      description: t('repositories.tabs.public.description'),
      icon: Globe,
    },
  ];

  return (
    <Tabs>
      <TabList className="border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <CommonTab
              key={tab.id}
              value={tab.id}
              activeValue={activeTab}
              onSelect={(v) => onTabChange(v as RepositoryType)}
              className={`data-[state=active]:bg-indigo-600 data-[state=active]:text-white flex flex-col items-center justify-center px-6 py-4`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4" />
                <span className="font-semibold">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    {tab.count}
                  </span>
                )}
              </div>
              <p className="text-xs">{tab.description}</p>
            </CommonTab>
          );
        })}
      </TabList>
    </Tabs>
  );
};
```

#### File 2: `frontend/webapp/src/features/repositories/views/components/RepositoryGrid.tsx`

**Thay đổi 3.2: Sửa hiển thị Owner name**

```tsx
// TRƯỚC (line 197):
<span className="font-medium text-gray-900">
  {repo.ownerName || repo.ownerUserId || 'Không có'}
</span>

// SAU:
<span className="font-medium text-gray-900">
  {repo.ownerName || 'Chưa có thông tin'}
</span>
```

**Lưu ý**: Nếu API không trả về `ownerName`, cần:
1. Kiểm tra backend có trả về field này không
2. Nếu không có, thêm API call để fetch owner name từ user ID (nếu cần)

#### File 3: `frontend/webapp/src/features/repositories/models/api/repositoryApi.ts`

**Thay đổi 3.3: Verify Public Repositories API** (đã có fallback)

- Lines 63-82: Đã có try-catch với fallback empty array ✅
- Không cần thay đổi, nhưng có thể thêm comment:

```tsx
// TODO: Backend chưa có API public repositories, đang dùng fallback
```

#### File 4: Các component khác dùng HTML thô (từ phân tích trước)

**Lưu ý**: Các file này cần refactor nhưng không nằm trong yêu cầu hiện tại. Liệt kê để tham khảo:

1. `FilesFilters.tsx` - `<input>`, `<select>`, `<button>` → UIComponent
2. `MainTabsNav.tsx` - `Button` group → `CommonTabs`
3. `SubTabsNav.tsx` - `Button` group → `CommonTabs`

---

## ✅ CHECKLIST THỰC HIỆN

### Profile Page
- [ ] Bỏ viền Label (thay bằng HTML label hoặc thêm prop noBorder)
- [ ] Xóa Role Badge (line 139-142)
- [ ] Xóa Role trong Account Info (line 327-331)
- [ ] Thêm TODO cho Kho mã và Tổ chức

### Repositories Page (Phần 3)
- [ ] Thay RepositoryTabs custom → CommonTabs
- [ ] Sửa RepositoryGrid hiển thị owner name (không fallback ID)
- [ ] Verify Public Repositories API fallback

### Repository Detail Page (Phần 4)
- [ ] Thêm tab "Thông tin" mới
- [ ] Xóa tab "Cài đặt"
- [ ] Xóa phần header info bị trùng
- [ ] Disable tab Activity với tooltip
- [ ] Implement InviteMemberModal (Personal/Organization)
- [ ] Hiển thị tên repository thay vì ID

### Repository Files List Page (Phần 5)
- [ ] Xóa div wrapper quanh FilesFilters
- [ ] Hiển thị ShowMore conditionally
- [ ] Đổi "Xóa tìm kiếm" thành "Xóa và làm mới"
- [ ] Thêm i18n keys

### Dashboard Page
- [ ] Tạo `CommonPanel.tsx`
- [ ] Tạo `WindowPanel.tsx` với drag, minimize, close
- [ ] Tạo `PanelSelector.tsx`
- [ ] Thêm state quản lý panels trong Dashboard
- [ ] Đổi Stats Grid → WindowPanel
- [ ] Đổi Recent Repositories → WindowPanel
- [ ] Đổi Recent Files → WindowPanel
- [ ] Đổi Organizations → WindowPanel
- [ ] Đổi Quick Actions → WindowPanel
- [ ] Thêm PanelSelector vào header
- [ ] Verify filter theo userId

---

## 📝 GHI CHÚ KỸ THUẬT

### Drag & Drop Implementation
- Sử dụng HTML5 Drag API (native) để tránh thêm dependency
- Hoặc có thể dùng `react-dnd` nếu cần drag & drop phức tạp hơn
- Trong WindowPanel, dùng `mousedown`, `mousemove`, `mouseup` events

### Panel Positioning
- Lưu position vào state hoặc localStorage để persist
- Grid layout có thể dùng CSS Grid hoặc absolute positioning với WindowPanel

### Minimize Height
- Default: 500px
- Minimized: 200px
- Có thể config qua props

### Import Paths
- Tất cả UIComponent imports từ `@shared/components` hoặc `@shared/components/UIComponents/...`
- Không import trực tiếp từ nested paths nếu không cần thiết

---

## 🚀 THỨ TỰ THỰC HIỆN KHUYẾN NGHỊ

1. **Profile Page** (đơn giản nhất)
2. **Repositories Page** (refactor tabs)
3. **Dashboard Page** (phức tạp nhất - tạo components mới)

---

## ⚠️ LƯU Ý

- Tất cả thay đổi chỉ trong frontend, không ảnh hưởng backend
- Kiểm tra TypeScript types sau mỗi thay đổi
- Test responsive trên mobile/tablet
- Đảm bảo không break existing functionality

---

**Ngày tạo**: $(date)
**Người tạo**: AI Assistant
**Version**: 1.0


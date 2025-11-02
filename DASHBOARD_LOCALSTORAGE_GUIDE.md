# 📦 Dashboard LocalStorage & Responsive Positions - Implementation Guide

**Ngày:** 02/11/2025 1:20 PM  
**Status:** 🔄 Ready to implement  
**Files:** WindowPanel.tsx ✅ DONE | Dashboard.tsx ⏳ PENDING

---

## ✅ **ĐÃ HOÀN THÀNH**

### 1. WindowPanel.tsx - Drag & Drop Fix
**File:** `frontend/webapp/src/shared/components/UIComponents/Panel/WindowPanel.tsx`

**Changes:**
- ✅ Fixed drag offset calculation (line 48-59)
  - Before: Used `rect.left/top` (absolute position)
  - After: Used `position.x/y` (relative position)
- ✅ Fixed minimize behavior (line 150-158)
  - Before: Hiện text "Panel đã được thu nhỏ"
  - After: Thu nhỏ content với maxHeight + overflow hidden
- ✅ Added type="button" to all control buttons
- ✅ Smooth transitions (200ms duration)

---

## ⏳ **CẦN LÀM - Dashboard.tsx**

### Step 1: Add imports
```typescript
// Line 1
import React, { useState, useEffect } from 'react'; // Add useEffect
```

### Step 2: Add PanelState interface
```typescript
// After imports, before Dashboard component
interface PanelState {
  id: string;
  label: string;
  visible: boolean;
  minimized: boolean;
  position: { x: number; y: number };
}
```

### Step 3: Add helper functions
```typescript
// Inside Dashboard component, before state declarations

// Calculate responsive default positions
const getDefaultPositions = () => {
  const width = window.innerWidth;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  if (isMobile) {
    // Mobile: Stack vertically
    return {
      repositories: { x: 10, y: 0 },
      files: { x: 10, y: 420 },
      organizations: { x: 10, y: 840 },
      quickActions: { x: 10, y: 1310 },
    };
  } else if (isTablet) {
    // Tablet: 2 columns
    return {
      repositories: { x: 10, y: 0 },
      files: { x: 400, y: 0 },
      organizations: { x: 10, y: 420 },
      quickActions: { x: 10, y: 890 },
    };
  } else {
    // Desktop: 2 columns with more spacing
    return {
      repositories: { x: 20, y: 0 },
      files: { x: 560, y: 0 },
      organizations: { x: 20, y: 420 },
      quickActions: { x: 20, y: 890 },
    };
  }
};

// Load panel state from localStorage
const loadPanelState = (): PanelState[] => {
  const saved = localStorage.getItem('dashboard-panels');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved panel state:', e);
    }
  }
  
  // Default state with responsive positions
  const defaultPositions = getDefaultPositions();
  return [
    { id: 'stats', label: 'Thống kê', visible: true, minimized: false, position: { x: 0, y: 0 } },
    { id: 'repositories', label: 'Repositories gần đây', visible: true, minimized: false, position: defaultPositions.repositories },
    { id: 'files', label: 'Files gần đây', visible: true, minimized: false, position: defaultPositions.files },
    { id: 'organizations', label: 'Tổ chức', visible: true, minimized: false, position: defaultPositions.organizations },
    { id: 'quickActions', label: 'Hành động nhanh', visible: true, minimized: false, position: defaultPositions.quickActions },
  ];
};
```

### Step 4: Update panels state
```typescript
// REPLACE this:
const [panels, setPanels] = useState([
  { id: 'stats', label: 'Thống kê', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'repositories', label: 'Repositories gần đây', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'files', label: 'Files gần đây', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'organizations', label: 'Tổ chức', visible: true, minimized: false, position: { x: 0, y: 0 } },
  { id: 'quickActions', label: 'Hành động nhanh', visible: true, minimized: false, position: { x: 0, y: 0 } },
]);

// WITH this:
const [panels, setPanels] = useState<PanelState[]>(loadPanelState);
```

### Step 5: Add localStorage sync
```typescript
// Add after panels state
useEffect(() => {
  localStorage.setItem('dashboard-panels', JSON.stringify(panels));
}, [panels]);
```

### Step 6: Add reset function
```typescript
// Add after updatePanelPosition
const resetPanelPositions = () => {
  const defaultPositions = getDefaultPositions();
  setPanels((prev: PanelState[]) => prev.map((p: PanelState) => ({
    ...p,
    position: defaultPositions[p.id as keyof typeof defaultPositions] || p.position
  })));
};
```

### Step 7: Add Reset button to header
```typescript
// IN headerRight prop of DashboardLayout
headerRight={
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={resetPanelPositions}
      title="Đặt lại vị trí mặc định"
    >
      🔄 Reset vị trí
    </Button>
    <PanelSelector
      panels={panels.map((p: PanelState) => ({ id: p.id, label: p.label, visible: p.visible }))}
      onToggle={togglePanel}
    />
    <RefreshButton
      isRefreshing={isRefreshing}
      onRefresh={handleRefresh}
    />
  </div>
}
```

---

## 🎯 **FEATURES**

### 1. Responsive Default Positions ✨
- **Mobile (< 768px):** Stack vertically với x=10
- **Tablet (768-1024px):** 2 columns layout
- **Desktop (> 1024px):** 2 columns với spacing lớn hơn

### 2. LocalStorage Persistence 💾
- **Key:** `dashboard-panels`
- **Format:** JSON array of PanelState
- **Auto-save:** Mỗi khi panels state thay đổi
- **Auto-load:** Khi load trang

### 3. Reset Button 🔄
- **Vị trí:** Header, bên trái PanelSelector
- **Chức năng:** Reset tất cả panels về default positions (theo screen size)
- **Icon:** 🔄
- **Title:** "Đặt lại vị trí mặc định"

---

## 📝 **TESTING**

### Test LocalStorage:
1. Di chuyển các panels
2. Refresh trang → Panels giữ nguyên vị trí
3. Clear localStorage → Panels về default positions
4. Resize browser → Responsive positions

### Test Reset:
1. Di chuyển panels
2. Click "Reset vị trí"
3. Panels về default positions (theo screen size hiện tại)

### Test Responsive:
1. Desktop (> 1024px): 2 columns, spacing 20px, files at x=560
2. Tablet (768-1024px): 2 columns, spacing 10px, files at x=400
3. Mobile (< 768px): Stack vertical, all x=10

---

## 🚀 **DEPLOYMENT CHECKLIST**

- [ ] Apply all changes to Dashboard.tsx
- [ ] Test drag & drop
- [ ] Test localStorage save/load
- [ ] Test reset button
- [ ] Test responsive positions (mobile/tablet/desktop)
- [ ] Test minimize behavior
- [ ] Test close/reopen panels
- [ ] Clear browser cache and test fresh load

---

## 💡 **OPTIONAL ENHANCEMENTS**

### Future improvements:
1. **Export/Import layout** - Save và share panel layouts
2. **Layout presets** - Predefined layouts (coding, review, admin)
3. **Per-user storage** - Save to backend API instead of localStorage
4. **Snap to grid** - Auto-align panels
5. **Panel resize** - Không chỉ drag mà còn resize được
6. **Keyboard shortcuts** - Ctrl+R để reset, etc.

---

## 📊 **DATA STRUCTURE**

### LocalStorage format:
```json
[
  {
    "id": "repositories",
    "label": "Repositories gần đây",
    "visible": true,
    "minimized": false,
    "position": { "x": 560, "y": 0 }
  },
  {
    "id": "files",
    "label": "Files gần đây",
    "visible": true,
    "minimized": true,
    "position": { "x": 20, "y": 420 }
  }
]
```

### PanelState interface:
```typescript
interface PanelState {
  id: string;           // Unique identifier
  label: string;        // Display name
  visible: boolean;     // Show/hide
  minimized: boolean;   // Minimize state
  position: {           // Absolute position
    x: number;
    y: number;
  };
}
```

---

**Status:** 🟡 Implementation pending  
**Estimated time:** 10-15 minutes  
**Complexity:** Medium (requires careful editing)

**Recommendation:** Apply changes step by step, test after each step.

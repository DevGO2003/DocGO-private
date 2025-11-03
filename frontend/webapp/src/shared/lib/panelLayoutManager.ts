/**
 * Panel Layout Manager
 * Quản lý vị trí mặc định của các panel và lưu trữ vào localStorage
 */

export interface PanelPosition {
  x: number;
  y: number;
}

export interface PanelLayoutConfig {
  id: string;
  label: string;
  defaultWidth: number;
  defaultHeight: number;
  position: PanelPosition;
  order: number; // Thứ tự hiển thị
}

export interface PanelLayout {
  name: string;
  description: string;
  panels: PanelLayoutConfig[];
}

/**
 * Các layout preset được thiết kế đẹp
 */
export const PANEL_LAYOUTS: Record<string, PanelLayout> = {
  // Layout 1: Grid 2x2 (Responsive)
  grid2x2: {
    name: 'Grid 2x2',
    description: 'Bố cục lưới 2x2 cân bằng',
    panels: [
      {
        id: 'stats',
        label: 'Thống kê',
        defaultWidth: 500,
        defaultHeight: 350,
        position: { x: 16, y: 16 },
        order: 1,
      },
      {
        id: 'repositories',
        label: 'Repositories gần đây',
        defaultWidth: 500,
        defaultHeight: 350,
        position: { x: 532, y: 16 },
        order: 2,
      },
      {
        id: 'files',
        label: 'Files gần đây',
        defaultWidth: 500,
        defaultHeight: 350,
        position: { x: 16, y: 382 },
        order: 3,
      },
      {
        id: 'organizations',
        label: 'Tổ chức',
        defaultWidth: 500,
        defaultHeight: 350,
        position: { x: 532, y: 382 },
        order: 4,
      },
      {
        id: 'quickActions',
        label: 'Hành động nhanh',
        defaultWidth: 1032,
        defaultHeight: 300,
        position: { x: 16, y: 748 },
        order: 5,
      },
    ],
  },

  // Layout 2: Waterfall (Cascade)
  waterfall: {
    name: 'Waterfall',
    description: 'Bố cục xếp tầng từ trên xuống',
    panels: [
      {
        id: 'stats',
        label: 'Thống kê',
        defaultWidth: 1032,
        defaultHeight: 280,
        position: { x: 16, y: 16 },
        order: 1,
      },
      {
        id: 'repositories',
        label: 'Repositories gần đây',
        defaultWidth: 500,
        defaultHeight: 380,
        position: { x: 16, y: 312 },
        order: 2,
      },
      {
        id: 'files',
        label: 'Files gần đây',
        defaultWidth: 500,
        defaultHeight: 380,
        position: { x: 532, y: 312 },
        order: 3,
      },
      {
        id: 'organizations',
        label: 'Tổ chức',
        defaultWidth: 1032,
        defaultHeight: 350,
        position: { x: 16, y: 708 },
        order: 4,
      },
      {
        id: 'quickActions',
        label: 'Hành động nhanh',
        defaultWidth: 1032,
        defaultHeight: 300,
        position: { x: 16, y: 1074 },
        order: 5,
      },
    ],
  },

  // Layout 3: Focus (Tập trung vào một panel chính)
  focus: {
    name: 'Focus',
    description: 'Tập trung vào panel chính, các panel khác nhỏ bên cạnh',
    panels: [
      {
        id: 'organizations',
        label: 'Tổ chức',
        defaultWidth: 700,
        defaultHeight: 600,
        position: { x: 16, y: 16 },
        order: 1,
      },
      {
        id: 'stats',
        label: 'Thống kê',
        defaultWidth: 332,
        defaultHeight: 280,
        position: { x: 732, y: 16 },
        order: 2,
      },
      {
        id: 'repositories',
        label: 'Repositories gần đây',
        defaultWidth: 332,
        defaultHeight: 300,
        position: { x: 732, y: 312 },
        order: 3,
      },
      {
        id: 'files',
        label: 'Files gần đây',
        defaultWidth: 332,
        defaultHeight: 300,
        position: { x: 732, y: 628 },
        order: 4,
      },
      {
        id: 'quickActions',
        label: 'Hành động nhanh',
        defaultWidth: 1032,
        defaultHeight: 300,
        position: { x: 16, y: 632 },
        order: 5,
      },
    ],
  },

  // Layout 4: Minimal (Chỉ hiển thị essentials)
  minimal: {
    name: 'Minimal',
    description: 'Bố cục tối giản, chỉ hiển thị các panel quan trọng',
    panels: [
      {
        id: 'stats',
        label: 'Thống kê',
        defaultWidth: 1032,
        defaultHeight: 280,
        position: { x: 16, y: 16 },
        order: 1,
      },
      {
        id: 'quickActions',
        label: 'Hành động nhanh',
        defaultWidth: 1032,
        defaultHeight: 300,
        position: { x: 16, y: 312 },
        order: 2,
      },
    ],
  },
};

/**
 * Lấy layout mặc định (Grid 2x2)
 */
export const getDefaultLayout = (): PanelLayout => {
  return PANEL_LAYOUTS.grid2x2;
};

/**
 * Lấy layout từ localStorage hoặc mặc định
 */
export const getSavedLayout = (layoutName: string = 'grid2x2'): PanelLayout => {
  return PANEL_LAYOUTS[layoutName] || getDefaultLayout();
};

/**
 * Lưu layout hiện tại vào localStorage
 */
export const saveLayoutPreference = (layoutName: string): void => {
  try {
    localStorage.setItem('dashboard-layout-preference', layoutName);
  } catch (e) {
    console.error('Failed to save layout preference:', e);
  }
};

/**
 * Lấy layout preference từ localStorage
 */
export const getLayoutPreference = (): string => {
  try {
    return localStorage.getItem('dashboard-layout-preference') || 'grid2x2';
  } catch (e) {
    console.error('Failed to get layout preference:', e);
    return 'grid2x2';
  }
};

/**
 * Reset layout về mặc định
 */
export const resetLayout = (): void => {
  try {
    localStorage.removeItem('dashboard-panels');
    localStorage.removeItem('dashboard-layout-preference');
  } catch (e) {
    console.error('Failed to reset layout:', e);
  }
};

/**
 * Chuyển đổi layout
 */
export const switchLayout = (layoutName: string): PanelLayout => {
  const layout = PANEL_LAYOUTS[layoutName];
  if (!layout) {
    console.warn(`Layout ${layoutName} not found, using default`);
    return getDefaultLayout();
  }
  saveLayoutPreference(layoutName);
  return layout;
};

/**
 * Lấy danh sách tất cả layouts
 */
export const getAvailableLayouts = (): Array<{ name: string; key: string; description: string }> => {
  return Object.entries(PANEL_LAYOUTS).map(([key, layout]) => ({
    name: layout.name,
    key,
    description: layout.description,
  }));
};

/**
 * Tính toán vị trí panel dựa trên layout
 */
export const getPanelPositionFromLayout = (
  panelId: string,
  layoutName: string = 'grid2x2'
): PanelLayoutConfig | undefined => {
  const layout = PANEL_LAYOUTS[layoutName] || getDefaultLayout();
  return layout.panels.find((p) => p.id === panelId);
};

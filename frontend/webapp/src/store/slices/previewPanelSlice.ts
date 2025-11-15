import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PreviewPanelState {
  isOpen: boolean;
  fileId: string | null;
  fileName: string | null;
  fileType: string | null;
}

const initialState: PreviewPanelState = {
  isOpen: false,
  fileId: null,
  fileName: null,
  fileType: null,
};

interface OpenPreviewPayload {
  fileId: string;
  fileName: string;
  fileType: string;
}

const previewPanelSlice = createSlice({
  name: 'previewPanel',
  initialState,
  reducers: {
    openPreview: (state, action: PayloadAction<OpenPreviewPayload>) => {
      state.isOpen = true;
      state.fileId = action.payload.fileId;
      state.fileName = action.payload.fileName;
      state.fileType = action.payload.fileType;
    },
    closePreview: (state) => {
      state.isOpen = false;
      state.fileId = null;
      state.fileName = null;
      state.fileType = null;
    },
  },
});

export const { openPreview, closePreview } = previewPanelSlice.actions;
export default previewPanelSlice.reducer;




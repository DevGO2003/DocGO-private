import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/models/state/authSlice';
import previewPanelReducer from './slices/previewPanelSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    previewPanel: previewPanelReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

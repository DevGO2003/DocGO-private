import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@features/auth/models/state/authSlice';
import productReducer from '@features/products/models/state/productSlice';
import orderReducer from '@features/orders/models/state/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    orders: orderReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

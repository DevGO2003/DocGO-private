import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { PublicRoute } from './PublicRoute';
import {
  LOGIN_PATH,
  REGISTER_PATH,
  FORGOT_PASSWORD_PATH,
  HOME_PATH,
  PRODUCTS_PATH,
  PRODUCT_DETAIL_PATH,
  PRODUCT_EDIT_PATH,
  ORDERS_PATH,
  ORDER_DETAIL_PATH,
} from '@constants';

// Lazy load pages
const Login = lazy(() => import('@features/auth/views/pages/Login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('@features/auth/views/pages/Register').then(m => ({ default: m.Register })));
const ForgotPassword = lazy(() => import('@features/auth/views/pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })));
const OAuth2Callback = lazy(() => import('@features/auth/views/pages').then(m => ({ default: m.OAuth2Callback })));
const Dashboard = lazy(() => import('@features/dashboard').then(m => ({ default: m.Dashboard })));
const ProductList = lazy(() => import('@features/products/views/pages/ProductList').then(m => ({ default: m.ProductList })));
const ProductDetail = lazy(() => import('@features/products/views/pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const ProductEdit = lazy(() => import('@features/products/views/pages/ProductEdit').then(m => ({ default: m.ProductEdit })));
const OrderList = lazy(() => import('@features/orders/views/pages/OrderList').then(m => ({ default: m.OrderList })));
const OrderDetail = lazy(() => import('@features/orders/views/pages/OrderDetail').then(m => ({ default: m.OrderDetail })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-lg">Loading...</div>
  </div>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path={LOGIN_PATH} element={<Login />} />
            <Route path={REGISTER_PATH} element={<Register />} />
            <Route path={FORGOT_PASSWORD_PATH} element={<ForgotPassword />} />
          </Route>

          {/* OAuth2 callback - no auth required */}
          <Route path="/oauth2/callback" element={<OAuth2Callback />} />

          {/* Private routes */}
          <Route element={<PrivateRoute />}>
            <Route path={HOME_PATH} element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path={PRODUCTS_PATH} element={<ProductList />} />
            <Route path={PRODUCT_DETAIL_PATH} element={<ProductDetail />} />
            <Route path={PRODUCT_EDIT_PATH} element={<ProductEdit />} />
            <Route path="/products/new" element={<ProductEdit />} />
            <Route path={ORDERS_PATH} element={<OrderList />} />
            <Route path={ORDER_DETAIL_PATH} element={<OrderDetail />} />
          </Route>

          {/* Catch all - redirect to login if not authenticated */}
          <Route path="*" element={<Navigate to={LOGIN_PATH} replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

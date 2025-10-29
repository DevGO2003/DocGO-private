import { Suspense } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { errorRoutes } from './errorRoutes';
import { LoadingSpinner } from '@shared/components';

const LoadingFallback = () => (
  // Không dùng fullScreen để tránh phủ toàn màn hình khi route đang lazy load
  <div className="w-full h-full flex items-center justify-center p-8">
    <LoadingSpinner />
  </div>
);

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes */}
          {publicRoutes}

          {/* Protected routes */}
          {protectedRoutes}

          {/* Error routes */}
          {errorRoutes}
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

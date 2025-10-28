import { Suspense } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { errorRoutes } from './errorRoutes';
import { LoadingSpinner } from '@shared/components';

const LoadingFallback = () => (
  <LoadingSpinner fullScreen />
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

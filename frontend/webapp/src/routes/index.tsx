import { Suspense } from 'react';
import { BrowserRouter, Routes } from 'react-router-dom';
import { publicRoutes } from './publicRoutes';
import { protectedRoutes } from './protectedRoutes';
import { errorRoutes } from './errorRoutes';

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

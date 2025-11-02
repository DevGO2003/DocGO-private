import React from 'react';
import { CommonText } from '@shared/components';

const LandingHeader: React.FC = () => {
  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <CommonText className="text-xl font-semibold text-indigo-600">DocGO</CommonText>
        <nav className="flex items-center gap-6">
          <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">Tính năng</a>
          <a href="#demo" className="text-sm text-gray-600 hover:text-gray-900">Demo</a>
          <a href="#about" className="text-sm text-gray-600 hover:text-gray-900">Giới thiệu</a>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;

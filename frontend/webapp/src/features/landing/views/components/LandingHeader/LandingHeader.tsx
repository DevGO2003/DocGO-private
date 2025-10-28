import React from 'react';

const LandingHeader: React.FC = () => {
  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-semibold text-indigo-600">DocGO</div>
        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900">Tính năng</a>
          <a href="#demo" className="hover:text-gray-900">Demo</a>
          <a href="#about" className="hover:text-gray-900">Giới thiệu</a>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;

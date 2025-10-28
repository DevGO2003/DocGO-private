import React from 'react';

const LandingFooter: React.FC = () => {
  return (
    <footer className="py-8">
      <div className="max-w-7xl mx-auto px-6 text-sm text-gray-500">
        © {new Date().getFullYear()} DocGO. All rights reserved.
      </div>
    </footer>
  );
};

export default LandingFooter;

import React from 'react';
import { CommonText } from '@shared/components';

const LandingFooter: React.FC = () => {
  return (
    <footer className="py-8">
      <CommonText className="max-w-7xl mx-auto px-6 text-sm text-gray-500">
        © {new Date().getFullYear()} DocGO. All rights reserved.
      </CommonText>
    </footer>
  );
};

export default LandingFooter;

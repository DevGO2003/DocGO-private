import React from 'react';
import { useTranslation } from 'react-i18next';
import { CommonText } from '@shared/components';

const LandingFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-8 bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <CommonText className="text-sm text-gray-500">
          © {new Date().getFullYear()} {t('app.title')}. All rights reserved.
        </CommonText>
      </div>
    </footer>
  );
};

export default LandingFooter;

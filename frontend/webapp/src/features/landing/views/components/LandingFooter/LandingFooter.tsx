import React from 'react';
import { useTranslation } from 'react-i18next';
import { CommonText } from '@shared/components';

const LandingFooter: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="py-8 border-t" style={ borderColor: '#e5e7eb' } style={ backgroundColor: '#f9fafb' }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <CommonText className="text-sm" style={ color: '#6b7280' }>
          © {new Date().getFullYear()} {t('app.title')}. All rights reserved.
        </CommonText>
      </div>
    </footer>
  );
};

export default LandingFooter;

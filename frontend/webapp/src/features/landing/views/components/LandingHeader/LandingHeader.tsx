import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import anime from 'animejs';
import { CommonText, Button, CommonIcon } from '@shared/components';

const LandingHeader: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) {
      anime({
        targets: headerRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  return (
    <header ref={headerRef} className="w-full bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50" style={ borderColor: '#e5e7eb' }>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <CommonIcon name="file-text" size={24} color="#2563eb" />
          <CommonText className="text-xl font-bold" style={{ color: '#2563eb' }}>
            {t('app.title')}
          </CommonText>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-sm hover: transition" style={ color: '#111827' } style={ color: '#4b5563' }>
            {t('landing.features.title')}
          </a>
          <a href="#demo" className="text-sm hover: transition" style={ color: '#111827' } style={ color: '#4b5563' }>
            Demo
          </a>
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            {t('nav.login')}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;

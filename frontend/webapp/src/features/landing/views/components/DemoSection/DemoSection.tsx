import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import anime from 'animejs';
import { CommonText, Button, CommonIcon } from '@shared/components';

const DemoSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      anime({
        targets: sectionRef.current,
        opacity: [0, 1],
        scale: [0.95, 1],
        duration: 800,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  return (
    <section id="demo" className="py-20" style={{ background: 'linear-gradient(to bottom right, #2563eb, #9333ea)' }}>
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <CommonText as="h2" className="font-bold mb-6" style={{ color: '#ffffff' }} >
          {t('landing.demo.title')}
        </CommonText>
        <CommonText as="p" className="text-xl mb-10 max-w-2xl mx-auto" style={{ color: '#bfdbfe' }}>
          {t('landing.demo.description')}
        </CommonText>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/repositories')}
            className="hover:shadow-2xl flex items-center gap-2" style={{ backgroundColor: '#ffffff', color: '#2563eb' }} >
            <CommonText as="span">{t('landing.demo.ctaDemo')}</CommonText>
            <CommonIcon name="arrow-right" size={20} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/signup')}
            className="border-2 border-white hover:bg-white hover:" style={{ color: '#2563eb', color: '#ffffff' }} >
            <CommonText as="span">{t('landing.demo.ctaRegister')}</CommonText>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DemoSection;

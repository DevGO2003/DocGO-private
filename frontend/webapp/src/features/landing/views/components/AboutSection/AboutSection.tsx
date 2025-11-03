import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import anime from 'animejs';
import { CommonText } from '@shared/components';

const AboutSection: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      anime({
        targets: sectionRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        easing: 'easeOutQuad',
      });
    }
  }, []);

  return (
    <section id="about" className="py-20 bg-white">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CommonText as="h2" className="text-4xl font-bold text-gray-900 mb-6">
          {t('app.title')}
        </CommonText>
        <CommonText as="p" className="text-xl text-gray-600 max-w-3xl">
          {t('landing.hero.description')}
        </CommonText>
      </div>
    </section>
  );
};

export default AboutSection;

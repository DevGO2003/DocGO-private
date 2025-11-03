import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import anime from 'animejs';
import { CommonText, Button, Card, CommonIcon } from '@shared/components';

const HeroSection: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Entrance animations
    if (badgeRef.current) {
      anime({
        targets: badgeRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 600,
        easing: 'easeOutQuad',
      });
    }

    if (titleRef.current) {
      anime({
        targets: titleRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: 200,
        easing: 'easeOutQuad',
      });
    }

    if (descRef.current) {
      anime({
        targets: descRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: 400,
        easing: 'easeOutQuad',
      });
    }

    if (buttonsRef.current) {
      anime({
        targets: buttonsRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: 600,
        easing: 'easeOutQuad',
      });
    }

    if (statsRef.current) {
      anime({
        targets: statsRef.current.children,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 600,
        delay: anime.stagger(100, { start: 800 }),
        easing: 'easeOutQuad',
      });
    }
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <div ref={badgeRef} className="inline-flex items-center gap-2 mb-8">
          <Card className="px-4 py-2">
            <div className="flex items-center gap-2">
              <CommonIcon name="star" size={20} />
              <CommonText as="span" className="text-sm font-medium">
                {t('landing.hero.badge')}
              </CommonText>
            </div>
          </Card>
        </div>
        
        {/* Title */}
        <div ref={titleRef}>
          <CommonText as="h1" className="md:text-6xl font-bold mb-6" style={{ color: '#111827' }} >
            {t('landing.hero.title.part1')}{' '}
            <span style={{ 
              background: 'linear-gradient(to right, #2563eb, #9333ea)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {t('landing.hero.title.highlight')}
            </span>
            <br />
            {t('landing.hero.title.part2')}
          </CommonText>
        </div>
        
        {/* Description */}
        <div ref={descRef}>
          <CommonText as="p" className="text-xl mb-10 max-w-3xl mx-auto" style={{ color: '#4b5563' }} >
            {t('landing.hero.description')}
          </CommonText>
        </div>

        {/* Buttons */}
        <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            variant="default"
            size="lg"
            onClick={() => navigate('/repositories')}
            className="flex items-center gap-2"
          >
            <CommonText as="span">{t('landing.hero.ctaDemo')}</CommonText>
            <CommonIcon name="arrow-right" size={16} />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <CommonText as="span">{t('landing.hero.ctaLearnMore')}</CommonText>
          </Button>
        </div>

        {/* Stats */}
        <div ref={statsRef} className="mt-16 grid grid-cols-3 gap-8 max-w-3xl mx-auto">
          <div>
            <CommonText as="p" className="text-4xl font-bold" style={{ color: '#2563eb' }}>
              1000+
            </CommonText>
            <CommonText as="p" className="mt-1" style={{ color: '#4b5563' }} >
              {t('landing.hero.stats.documents')}
            </CommonText>
          </div>
          <div>
            <CommonText as="p" className="text-4xl font-bold" style={{ color: '#9333ea' }}>
              99%
            </CommonText>
            <CommonText as="p" className="mt-1" style={{ color: '#4b5563' }} >
              {t('landing.hero.stats.accuracy')}
            </CommonText>
          </div>
          <div>
            <CommonText as="p" className="text-4xl font-bold" style={{ color: '#16a34a' }}>
              5x
            </CommonText>
            <CommonText as="p" className="mt-1" style={{ color: '#4b5563' }} >
              {t('landing.hero.stats.faster')}
            </CommonText>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

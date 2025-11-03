import React, { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import anime from 'animejs';
import { CommonText, Card, CardContent, CommonIcon } from '@shared/components';

const FeaturesSection: React.FC = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const features = [
    { 
      icon: 'star',
      color: 'blue',
      title: t('landing.features.ai.title'),
      description: t('landing.features.ai.description'),
      items: [
        t('landing.features.ai.features.ocr'),
        t('landing.features.ai.features.summary'),
        t('landing.features.ai.features.classify'),
      ]
    },
    { 
      icon: 'shield',
      color: 'purple',
      title: t('landing.features.security.title'),
      description: t('landing.features.security.description'),
      items: [
        t('landing.features.security.features.encryption'),
        t('landing.features.security.features.permissions'),
        t('landing.features.security.features.audit'),
      ]
    },
    { 
      icon: 'zap',
      color: 'green',
      title: t('landing.features.speed.title'),
      description: t('landing.features.speed.description'),
      items: [
        t('landing.features.speed.features.fast'),
        t('landing.features.speed.features.search'),
        t('landing.features.speed.features.sync'),
      ]
    },
  ];

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

    if (cardsRef.current) {
      anime({
        targets: cardsRef.current.children,
        opacity: [0, 1],
        translateY: [40, 0],
        duration: 600,
        delay: anime.stagger(100, { start: 200 }),
        easing: 'easeOutQuad',
      });
    }
  }, []);

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: '#2563eb',
      purple: '#9333ea',
      green: '#16a34a',
    };
    return colors[color] || colors.blue;
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className="text-center mb-16">
          <CommonText as="h2" className="text-4xl font-bold text-gray-900 mb-4">
            {t('landing.features.title')}
          </CommonText>
          <CommonText as="p" className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </CommonText>
        </div>

        <div ref={cardsRef} className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-8 hover:shadow-xl transition-shadow">
              <CardContent>
                <div className="h-14 w-14 rounded-xl flex items-center justify-center mb-6" style={{ backgroundColor: `${getColorClass(feature.color)}20` }}>
                  <CommonIcon name={feature.icon as any} size={32} color={getColorClass(feature.color)} />
                </div>
                <CommonText as="h3" className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </CommonText>
                <CommonText as="p" className="text-gray-600 mb-6">
                  {feature.description}
                </CommonText>
                <ul className="space-y-2">
                  {feature.items.map((item, idx) => (
                    <li key={idx} className="flex items-center text-gray-700">
                      <CommonIcon name="check" size={20} color="#16a34a" className="mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

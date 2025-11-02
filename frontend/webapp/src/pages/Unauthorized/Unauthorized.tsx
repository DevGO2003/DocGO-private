import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRef, useEffect } from 'react';
import anime from 'animejs';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Card, CardContent, Button, CommonFont, CommonText } from '@shared/components';
import { HOME_PATH } from '@constants';

export const Unauthorized = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      anime({
        targets: containerRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 500,
        easing: 'easeOutQuad',
      });
    }
    if (iconRef.current) {
      anime({
        targets: iconRef.current,
        scale: [0, 1],
        delay: 200,
        duration: 400,
        easing: 'easeOutBack',
      });
    }
  }, []);

  return (
    <CommonFont className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #fef2f2, #ffedd5)' }}>
      <div ref={containerRef} className="w-full max-w-md">
        <Card>
          <CardContent className="p-8 text-center">
            <div ref={iconRef} className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
              <CommonIcon name="alert-circle" size={48} className="text-red-600" />
            </div>

            <CommonText as="h1" className="text-3xl font-bold text-gray-900 mb-3">
              {t('unauthorized.title')}
            </CommonText>

            <CommonText as="p" className="text-gray-600 mb-8">
              {t('unauthorized.description')}
            </CommonText>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <CommonIcon name="arrow-left" size={16} />
                {t('unauthorized.goBack')}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(HOME_PATH)}
                className="flex items-center gap-2"
              >
                <CommonIcon name="home" size={16} />
                {t('unauthorized.goHome')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CommonFont>
  );
};

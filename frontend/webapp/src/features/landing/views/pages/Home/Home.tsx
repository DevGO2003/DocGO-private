import React from 'react';
import { CommonFont } from '@shared/components';
import { LandingHeader } from '../../components/LandingHeader';
import { HeroSection } from '../../components/HeroSection';
import { FeaturesSection } from '../../components/FeaturesSection';
import { DemoSection } from '../../components/DemoSection';
import { AboutSection } from '../../components/AboutSection';
import { LandingFooter } from '../../components/LandingFooter';

export const Home: React.FC = () => {
  return (
    <CommonFont className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #faf5ff)' }}>
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <AboutSection />
      <LandingFooter />
    </CommonFont>
  );
};

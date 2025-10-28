import React from 'react';
import { LandingHeader } from '../../components/LandingHeader';
import { HeroSection } from '../../components/HeroSection';
import { FeaturesSection } from '../../components/FeaturesSection';
import { DemoSection } from '../../components/DemoSection';
import { AboutSection } from '../../components/AboutSection';
import { LandingFooter } from '../../components/LandingFooter';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <AboutSection />
      <LandingFooter />
    </div>
  );
};

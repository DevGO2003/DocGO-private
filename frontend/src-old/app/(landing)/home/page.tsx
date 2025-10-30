'use client'

import LandingHeader from './_components/LandingHeader'
import HeroSection from './_components/HeroSection'
import FeaturesSection from './_components/FeaturesSection'
import DemoSection from './_components/DemoSection'
import AboutSection from './_components/AboutSection'
import LandingFooter from './_components/LandingFooter'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <DemoSection />
      <AboutSection />
      <LandingFooter />
    </div>
  )
}

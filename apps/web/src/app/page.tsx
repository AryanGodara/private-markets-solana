'use client';

import Navbar from '@/components/Navbar';
import HeroSection from '@/components/LandingPage';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-off-white">
      <Navbar />
      <main>
        <HeroSection />
      </main>
    </div>
  );
}
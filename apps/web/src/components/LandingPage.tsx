'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, Lock, Eye, TrendingUp, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <Sparkles className="w-4 h-4 text-neon-purple" />
              <span className="font-bold text-sm">AI-Powered Prediction Markets</span>
            </div>

            <h1 className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight animate-slide-up" style={{ animationDelay: '0.2s' }}>
              Trade{' '}
              <span className="inline-block bg-dark text-[#4ADE80] px-6 py-2 rounded-2xl transform -rotate-1">
                Alpha
              </span>
              <br />
              Not Exposure.
            </h1>

            <p className="text-lg md:text-xl text-dark/70 max-w-lg mx-auto lg:mx-0 leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Encrypted prediction markets powered by AI.
              <br />
              <span className="text-dark font-bold">Your position stays private.</span> The odds stay fair.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link href="/markets">
                <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                  Enter The Markets
                  <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                </Button>
              </Link>
              <Link href="/agent">
                <Button variant="heroSecondary" size="xl" className="w-full sm:w-auto group">
                  AI Agent
                  <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right orb */}
          <div className="flex-1 flex items-center justify-center animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <PrivacyOrb />
          </div>

        </div>
      </div>
    </section>
  );
};

const PrivacyOrb = () => {
  return (
    <div className="relative w-80 h-80 md:w-[400px] md:h-[400px]">

      {/* Outer glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-neon-green/20 via-transparent to-neon-purple/20 animate-pulse-glow" />

      {/* Main orb */}
      <div className="absolute inset-4 rounded-full bg-dark border-4 border-dark shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden">

        {/* Inner gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 via-transparent to-neon-purple/10" />

        {/* Encrypted background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="text-center space-y-2">
            {['0x7F3...', '█████', '••••••', '0.00'].map((t, i) => (
              <div key={i} className="font-mono text-neon-green text-sm">
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* ORBIT SYSTEM */}
        <div className="absolute inset-0">
          <OrbitingIcon delay={0} Icon={Eye} color="neon-green" />
          <OrbitingIcon delay={5} Icon={TrendingUp} color="neon-purple" />
          <OrbitingIcon delay={10} Icon={Shield} color="neon-green" />
        </div>

        {/* Center lock */}
        <div className="relative z-10 w-20 h-20 rounded-2xl bg-white border-2 border-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center animate-float">
          <Lock className="w-10 h-10 text-neon-green" strokeWidth={2.5} />
        </div>
      </div>

      {/* ✅ RESTORED PULSING DOTS */}
      <div className="absolute top-10 right-5 w-3 h-3 rounded-full bg-neon-green animate-pulse" />
      <div
        className="absolute bottom-16 left-8 w-2 h-2 rounded-full bg-neon-purple animate-pulse"
        style={{ animationDelay: '1s' }}
      />
      <div
        className="absolute top-1/3 left-0 w-2 h-2 rounded-full bg-neon-green animate-pulse"
        style={{ animationDelay: '0.5s' }}
      />
    </div>
  );
};

const OrbitingIcon = ({
  delay,
  Icon,
  color,
}: {
  delay: number;
  Icon: React.ElementType;
  color: 'neon-green' | 'neon-purple';
}) => {
  return (
    <div
      className="absolute inset-0 orbit-upright"
      style={{ animationDelay: `-${delay}s` }}
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
        <div className="w-10 h-10 rounded-xl bg-white border-2 border-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
          <Icon
            className={`w-5 h-5 ${
              color === 'neon-green'
                ? 'text-neon-green'
                : 'text-neon-purple'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
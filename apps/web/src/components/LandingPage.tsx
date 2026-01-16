'use client';

import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left content */}
          <div className="flex-1 text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-dark shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles className="w-4 h-4 text-neon-purple" />
              <span className="font-bold text-sm">AI-Powered Prediction Markets</span>
            </div>

            {/* Headline */}
            <h1 className="font-black text-5xl md:text-6xl lg:text-7xl leading-[1.1] tracking-tight">
              Trade{" "}
              <span className="inline-block bg-dark text-[#4ADE80] px-6 py-2 rounded-2xl transform -rotate-1">
                Alpha
              </span>
              <br />
              Not Exposure.
            </h1>

            {/* Subtext */}
            <p className="text-lg md:text-xl text-dark/70 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Encrypted prediction markets powered by AI.
              <br />
              <span className="text-dark font-bold">Your position stays private.</span> The odds stay fair.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="xl" className="w-full sm:w-auto group">
                Enter The Markets
                <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
              </Button>
              <Button variant="heroSecondary" size="xl" className="w-full sm:w-auto group">
                Read Docs
                <ArrowRight className="w-5 h-5 group-hover:-rotate-45 transition-transform duration-300" />
              </Button>
            </div>
          </div>

          {/* Right - Orb */}
          <div className="flex-1 flex items-center justify-center">
            <PrivacyOrb />
          </div>
        </div>
      </div>
    </section>
  );
};

const PrivacyOrb = () => (
  <div className="relative">
    <div className="w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-white rounded-full border-[6px] border-dark flex items-center justify-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-300">
      {/* Inner content */}
      <div className="text-center">
        <div className="text-4xl md:text-5xl font-black text-dark italic">
          discussed
          <br />
          model
        </div>
      </div>
    </div>
  </div>
);

export default HeroSection;

'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Shield, Eye, Bot, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-16">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-shadow-primary" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-shadow-primary to-purple-400 bg-clip-text text-transparent">
            Dark Alpha
          </h1>
        </div>
        <WalletMultiButton className="bg-shadow-primary hover:bg-purple-600" />
      </header>

      {/* Hero Section */}
      <section className="text-center mb-20">
        <h2 className="text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Private Prediction Markets
          </span>
          <br />
          <span className="bg-gradient-to-r from-shadow-primary to-purple-400 bg-clip-text text-transparent">
            Where Whales Can't Front-Run
          </span>
        </h2>
        <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
          Trade with whale-grade privacy. Your bet amounts stay encrypted while market odds remain public. Stop alpha leakage today.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/markets"
            className="bg-shadow-primary hover:bg-purple-600 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Explore Markets
          </Link>
          <Link
            href="/trade"
            className="border border-shadow-primary hover:bg-shadow-primary/10 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Start Trading
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-8 mb-20">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <Eye className="h-12 w-12 text-privacy-green mb-4" />
          <h3 className="text-xl font-bold mb-4">Private Position Sizes</h3>
          <p className="text-gray-300">
            Your bet amounts are encrypted using Inco's confidential computing. Only aggregate market odds remain public.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <Bot className="h-12 w-12 text-shadow-primary mb-4" />
          <h3 className="text-xl font-bold mb-4">AI Market Creation</h3>
          <p className="text-gray-300">
            AI agents automatically create prediction markets based on crypto news and events, ensuring fresh opportunities.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
          <TrendingUp className="h-12 w-12 text-privacy-red mb-4" />
          <h3 className="text-xl font-bold mb-4">Privacy Tokens</h3>
          <p className="text-gray-300">
            Trade with Token-2022 privacy tokens as collateral, providing an extra layer of financial privacy.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white/5 backdrop-blur-sm rounded-xl p-8 mb-20 border border-white/10">
        <h3 className="text-3xl font-bold text-center mb-12">How ShadowAlpha Works</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-shadow-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h4 className="font-semibold mb-2">Connect Wallet</h4>
            <p className="text-sm text-gray-300">Connect your Solana wallet to start trading</p>
          </div>

          <div className="text-center">
            <div className="bg-shadow-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h4 className="font-semibold mb-2">Choose Market</h4>
            <p className="text-sm text-gray-300">Browse AI-generated prediction markets</p>
          </div>

          <div className="text-center">
            <div className="bg-shadow-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h4 className="font-semibold mb-2">Private Trade</h4>
            <p className="text-sm text-gray-300">Your position size is encrypted and hidden</p>
          </div>

          <div className="text-center">
            <div className="bg-shadow-primary/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">4</span>
            </div>
            <h4 className="font-semibold mb-2">Claim Rewards</h4>
            <p className="text-sm text-gray-300">Win big while maintaining privacy</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-gray-400">
        <p>Private prediction markets on Solana • Integrating PNP Exchange + Inco Network</p>
      </footer>
    </main>
  );
}
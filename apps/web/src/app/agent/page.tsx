'use client';

import { useEffect, useState } from 'react';
import {
  Bot,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle,
  Newspaper,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { fetchAgentStatus, triggerAgentScan, AgentStatus } from '@/lib/api';

interface Signal {
  id: string;
  type: 'buy' | 'sell' | 'create';
  market?: string;
  confidence: number;
  reason: string;
  timestamp: Date;
}

export default function AgentPage() {
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    newsItems: number;
    opportunities: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Demo signals
  const [signals] = useState<Signal[]>([
    {
      id: '1',
      type: 'create',
      confidence: 0.85,
      reason: 'Privacy regulation news detected - high market potential',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: '2',
      type: 'buy',
      market: 'Will ZK proofs be adopted by major exchanges?',
      confidence: 0.72,
      reason: 'Positive sentiment from institutional players',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: '3',
      type: 'sell',
      market: 'Privacy coin ban by 2026?',
      confidence: 0.68,
      reason: 'Regulatory uncertainty decreasing',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    },
  ]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchAgentStatus();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
    // Poll every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleScan = async () => {
    setScanning(true);
    setError(null);
    setScanResult(null);

    try {
      const result = await triggerAgentScan();
      setScanResult({
        newsItems: result.newsItems,
        opportunities: result.opportunities,
      });
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-dark rounded-2xl flex items-center justify-center border-2 border-dark shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Bot className="w-8 h-8 text-neon-green" />
              </div>
              <div>
                <h1 className="font-black text-4xl">AI Trading Agent</h1>
                <p className="text-dark/60 flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status?.status === 'active'
                        ? 'bg-neon-green animate-pulse'
                        : 'bg-gray-400'
                    }`}
                  />
                  {status?.status === 'active' ? 'Agent Active' : 'Agent Paused'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="heroSecondary"
                onClick={handleScan}
                disabled={scanning}
              >
                <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
                {scanning ? 'Scanning...' : 'Force Scan'}
              </Button>
              <Button variant="hero">
                {status?.status === 'active' ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause Agent
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start Agent
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Scan Result */}
          {scanResult && (
            <div className="bg-neon-green/10 border-2 border-neon-green rounded-xl p-4 mb-8 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-neon-green" />
              <div>
                <p className="font-bold">Scan Complete</p>
                <p className="text-sm text-dark/60">
                  Found {scanResult.newsItems} news items, {scanResult.opportunities}{' '}
                  market opportunities
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 mb-8 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Markets Created"
              value={status?.marketsCreated.toString() || '0'}
              icon={<TrendingUp className="w-5 h-5" />}
              color="bg-neon-green"
            />
            <StatCard
              label="Signals Today"
              value={signals.length.toString()}
              icon={<Zap className="w-5 h-5" />}
              color="bg-neon-purple"
            />
            <StatCard
              label="Privacy Mode"
              value="Enabled"
              icon={<Shield className="w-5 h-5" />}
              color="bg-neon-green"
            />
            <StatCard
              label="Last Scan"
              value={
                status?.lastScan
                  ? new Date(status.lastScan).toLocaleTimeString()
                  : 'Never'
              }
              icon={<Clock className="w-5 h-5" />}
              color="bg-gray-200"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Signals Feed */}
            <div className="lg:col-span-2">
              <div className="bg-white border-2 border-dark rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-xl">Recent Signals</h2>
                  <span className="text-sm text-dark/60">Auto-updated every 30s</span>
                </div>

                <div className="space-y-4">
                  {signals.map((signal) => (
                    <SignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              </div>
            </div>

            {/* Agent Config */}
            <div className="space-y-6">
              {/* Strategy Panel */}
              <div className="bg-white border-2 border-dark rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="font-bold text-xl mb-4">Strategy Config</h2>

                <div className="space-y-4">
                  <ConfigItem
                    label="Max Position Size"
                    value="$100 USDC"
                    encrypted
                  />
                  <ConfigItem label="Risk Level" value="Medium (5/10)" />
                  <ConfigItem
                    label="Auto-Trade"
                    value="Disabled"
                    status="warning"
                  />
                  <ConfigItem label="Signal Threshold" value="70% confidence" />
                </div>

                <Button variant="heroSecondary" className="w-full mt-4">
                  Configure Strategy
                </Button>
              </div>

              {/* News Sources */}
              <div className="bg-white border-2 border-dark rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-4">
                  <Newspaper className="w-5 h-5" />
                  <h2 className="font-bold text-xl">News Sources</h2>
                </div>

                <div className="space-y-2">
                  <SourceItem name="CoinDesk" status="active" />
                  <SourceItem name="CoinTelegraph" status="active" />
                  <SourceItem name="Decrypt" status="active" />
                  <SourceItem name="Custom RSS" status="inactive" />
                </div>
              </div>

              {/* Privacy Note */}
              <div className="bg-dark text-white rounded-2xl p-6 border-2 border-dark">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-neon-green" />
                  <h3 className="font-bold">Encrypted Trading</h3>
                </div>
                <p className="text-white/70 text-sm">
                  All agent trades use encrypted position sizes via Inco Network.
                  Strategy parameters can also be encrypted.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white border-2 border-dark rounded-xl p-5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-dark/60">{label}</span>
        <div className={`w-8 h-8 ${color} rounded-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="font-black text-2xl">{value}</p>
    </div>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  const typeColors = {
    buy: 'bg-neon-green',
    sell: 'bg-red-400',
    create: 'bg-neon-purple',
  };

  const typeLabels = {
    buy: 'BUY',
    sell: 'SELL',
    create: 'CREATE',
  };

  return (
    <div className="p-4 rounded-xl border-2 border-dark/10 hover:border-dark/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <span
          className={`text-xs font-bold px-2 py-1 rounded ${typeColors[signal.type]} text-dark`}
        >
          {typeLabels[signal.type]}
        </span>
        <span className="text-xs text-dark/50">
          {signal.timestamp.toLocaleTimeString()}
        </span>
      </div>
      {signal.market && (
        <p className="font-medium text-sm mb-1">{signal.market}</p>
      )}
      <p className="text-sm text-dark/60">{signal.reason}</p>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-neon-green"
            style={{ width: `${signal.confidence * 100}%` }}
          />
        </div>
        <span className="text-xs font-bold">
          {(signal.confidence * 100).toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

function ConfigItem({
  label,
  value,
  encrypted,
  status,
}: {
  label: string;
  value: string;
  encrypted?: boolean;
  status?: 'warning';
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-dark/10 last:border-0">
      <span className="text-sm text-dark/60">{label}</span>
      <div className="flex items-center gap-2">
        {encrypted && <Shield className="w-3 h-3 text-neon-green" />}
        <span
          className={`text-sm font-bold ${
            status === 'warning' ? 'text-yellow-600' : ''
          }`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

function SourceItem({ name, status }: { name: string; status: 'active' | 'inactive' }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{name}</span>
      <span
        className={`text-xs font-bold px-2 py-1 rounded ${
          status === 'active' ? 'bg-neon-green/20 text-neon-green' : 'bg-gray-100 text-gray-500'
        }`}
      >
        {status}
      </span>
    </div>
  );
}

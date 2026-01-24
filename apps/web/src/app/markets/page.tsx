'use client';

import { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw, TrendingUp, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import MarketCard from '@/components/MarketCard';
import { Button } from '@/components/ui/button';
import { fetchMarkets, Market, isMarketActive } from '@/lib/api';

type FilterType = 'all' | 'active' | 'resolved';

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('active');

  const loadMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMarkets();
      setMarkets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarkets();
  }, []);

  // Filter and search markets
  const filteredMarkets = markets
    .filter((market) => {
      if (filter === 'active') return isMarketActive(market);
      if (filter === 'resolved') return market.account.resolved;
      return true;
    })
    .filter((market) =>
      market.account.question.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, 50); // Limit to 50 for performance

  const activeCount = markets.filter(isMarketActive).length;
  const resolvedCount = markets.filter((m) => m.account.resolved).length;

  return (
    <div className="min-h-screen bg-off-white">
      <Navbar />

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-black text-4xl mb-2">Prediction Markets</h1>
              <p className="text-dark/60">
                Trade on outcomes with{' '}
                <span className="inline-flex items-center gap-1 text-neon-green font-bold">
                  <Shield className="w-4 h-4" /> encrypted positions
                </span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="heroSecondary"
                size="sm"
                onClick={loadMarkets}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Markets"
              value={markets.length.toLocaleString()}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              label="Active Markets"
              value={activeCount.toLocaleString()}
              icon={<TrendingUp className="w-5 h-5 text-neon-green" />}
            />
            <StatCard
              label="Resolved"
              value={resolvedCount.toLocaleString()}
              icon={<TrendingUp className="w-5 h-5 text-gray-400" />}
            />
            <StatCard
              label="Network"
              value="Devnet"
              icon={<Shield className="w-5 h-5 text-neon-purple" />}
            />
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark/40" />
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-dark bg-white
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                  focus:outline-none focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                  focus:translate-x-[2px] focus:translate-y-[2px]
                  transition-all font-medium"
              />
            </div>

            <div className="flex gap-2">
              {(['all', 'active', 'resolved'] as FilterType[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`
                    px-4 py-3 rounded-xl border-2 border-dark font-bold capitalize
                    transition-all
                    ${
                      filter === f
                        ? 'bg-dark text-white shadow-none translate-x-[2px] translate-y-[2px]'
                        : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
                    }
                  `}
                >
                  <Filter className="w-4 h-4 inline mr-2" />
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 rounded-xl p-4 mb-8">
              <p className="text-red-700 font-medium">{error}</p>
              <Button variant="heroSecondary" size="sm" onClick={loadMarkets} className="mt-2">
                Try Again
              </Button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white border-2 border-dark rounded-2xl p-5 h-64 animate-pulse"
                >
                  <div className="h-6 bg-gray-200 rounded w-20 mb-3" />
                  <div className="h-12 bg-gray-200 rounded mb-4" />
                  <div className="space-y-2">
                    <div className="h-6 bg-gray-200 rounded" />
                    <div className="h-6 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Markets Grid */}
          {!loading && filteredMarkets.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets.map((market) => (
                <MarketCard key={market.publicKey} market={market} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredMarkets.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="font-bold text-xl mb-2">No markets found</h3>
              <p className="text-dark/60">
                {searchQuery
                  ? 'Try a different search term'
                  : 'No markets match the current filter'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border-2 border-dark rounded-xl p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex items-center gap-2 text-dark/60 mb-1">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="font-black text-2xl">{value}</p>
    </div>
  );
}

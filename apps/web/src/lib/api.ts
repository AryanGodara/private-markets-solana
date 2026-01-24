/**
 * API client for Dark Alpha backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Market {
  publicKey: string;
  account: {
    id: string;
    question: string;
    resolved: boolean;
    resolvable: boolean;
    creator: string;
    end_time: string;
    creation_time: string;
    initial_liquidity: string;
    yes_token_mint: string;
    no_token_mint: string;
    yes_token_supply_minted: string;
    no_token_supply_minted: string;
    collateral_token: string;
    market_reserves: string;
    winning_token_id: { None: Record<string, never> } | { Some: string };
  };
}

export interface MarketPrices {
  yes: number;
  no: number;
}

export interface EncryptedTrade {
  encryptedAmount: string;
  encryptedSide: string;
  marketAddress: string;
  timestamp: number;
}

export interface AgentStatus {
  status: 'active' | 'paused' | 'stopped';
  lastScan: string;
  marketsCreated: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Markets API
export async function fetchMarkets(): Promise<Market[]> {
  const res = await fetch(`${API_BASE}/api/markets`);
  const json: ApiResponse<{ count: number; data: Market[] }> = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch markets');
  return json.data?.data || [];
}

export async function fetchMarket(marketId: string): Promise<Market | null> {
  const res = await fetch(`${API_BASE}/api/markets/${marketId}`);
  const json: ApiResponse<Market> = await res.json();
  if (!json.success) return null;
  return json.data || null;
}

export async function fetchMarketPrices(marketId: string): Promise<MarketPrices> {
  const res = await fetch(`${API_BASE}/api/trading/market/${marketId}/info`);
  const json: ApiResponse<{ market: Market; prices: MarketPrices }> = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch prices');
  return json.data?.prices || { yes: 0.5, no: 0.5 };
}

// Trading API
export async function encryptTrade(params: {
  amount: string;
  side: 'yes' | 'no';
  marketAddress: string;
}): Promise<EncryptedTrade> {
  const res = await fetch(`${API_BASE}/api/trading/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json: ApiResponse<EncryptedTrade> = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to encrypt trade');
  return json.data!;
}

export async function executeTrade(params: {
  market: string;
  side: 'yes' | 'no';
  amount: string;
}): Promise<unknown> {
  const res = await fetch(`${API_BASE}/api/trading/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  const json: ApiResponse<unknown> = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to execute trade');
  return json.data;
}

// Agent API
export async function fetchAgentStatus(): Promise<AgentStatus> {
  const res = await fetch(`${API_BASE}/api/agent/status`);
  const json: ApiResponse<AgentStatus> = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch agent status');
  return json.data!;
}

export async function triggerAgentScan(): Promise<{
  newsItems: number;
  opportunities: number;
  preview: unknown[];
}> {
  const res = await fetch(`${API_BASE}/api/agent/scan`, { method: 'POST' });
  const json: ApiResponse<{
    newsItems: number;
    opportunities: number;
    preview: unknown[];
  }> = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to trigger scan');
  return json.data!;
}

// Utility functions
export function calculatePriceFromReserves(
  yesSupply: string,
  noSupply: string
): MarketPrices {
  const yes = parseInt(yesSupply, 16) || 1;
  const no = parseInt(noSupply, 16) || 1;
  const total = yes + no;
  return {
    yes: Math.round((no / total) * 100) / 100,
    no: Math.round((yes / total) * 100) / 100,
  };
}

export function formatTimestamp(hexTimestamp: string): Date {
  const seconds = parseInt(hexTimestamp, 16);
  return new Date(seconds * 1000);
}

export function isMarketActive(market: Market): boolean {
  const endTime = formatTimestamp(market.account.end_time);
  return !market.account.resolved && endTime > new Date();
}

export function getMarketTimeRemaining(market: Market): string {
  const endTime = formatTimestamp(market.account.end_time);
  const now = new Date();
  const diff = endTime.getTime() - now.getTime();

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return 'Ending soon';
}

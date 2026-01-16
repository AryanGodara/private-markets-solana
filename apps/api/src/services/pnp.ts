import { PNPClient } from 'pnp-sdk';
import { PublicKey } from '@solana/web3.js';
import type { MarketType } from '../types';

export class PNPService {
  private client: PNPClient;
  private clientWithSigner?: PNPClient;

  constructor() {
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';

    // Read-only client
    this.client = new PNPClient(rpcUrl);

    // Client with signer for write operations (if private key provided)
    if (process.env.SOLANA_PRIVATE_KEY) {
      this.clientWithSigner = new PNPClient(rpcUrl, process.env.SOLANA_PRIVATE_KEY);
    }
  }

  async createPrivacyMarket(params: {
    question: string;
    initialLiquidity: bigint;
    endTime: bigint;
    privacyTokenMint: PublicKey;
  }) {
    if (!this.clientWithSigner?.market) {
      throw new Error('Signer required for market creation');
    }

    return await this.clientWithSigner.market.createMarket({
      question: params.question,
      initialLiquidity: params.initialLiquidity,
      endTime: params.endTime,
      baseMint: params.privacyTokenMint,
    });
  }

  async getMarketInfo(marketAddress: string) {
    const market = new PublicKey(marketAddress);
    return await this.client.fetchMarket(market);
  }

  async getAllMarkets() {
    return await this.client.fetchMarkets();
  }

  async executeTrade(params: {
    market: string;
    side: 'yes' | 'no';
    amount: bigint;
  }) {
    if (!this.clientWithSigner?.trading) {
      throw new Error('Signer required for trading');
    }

    const market = new PublicKey(params.market);

    return await this.clientWithSigner.trading.buyTokensUsdc({
      market,
      buyYesToken: params.side === 'yes',
      amountUsdc: Number(params.amount) / 1_000_000, // Convert to USDC units
    });
  }
}

export const pnpService = new PNPService();
import { encryptValue, decrypt } from '@inco/solana-sdk/encryption';
import { PublicKey } from '@solana/web3.js';

export class IncoPrivacyService {
  /**
   * Encrypt trading amount for private position size
   */
  async encryptTradeAmount(amount: bigint): Promise<string> {
    return await encryptValue(amount);
  }

  /**
   * Encrypt boolean values (e.g., trading strategy flags)
   */
  async encryptBoolean(value: boolean): Promise<string> {
    return await encryptValue(value);
  }

  /**
   * Decrypt values for authorized users (requires wallet signature)
   */
  async decryptValues(
    handles: string[],
    walletParams: {
      address: PublicKey;
      signMessage: (message: Uint8Array) => Promise<Uint8Array>;
    }
  ) {
    return await decrypt(handles, walletParams);
  }

  /**
   * Encrypt strategy parameters for AI agent
   */
  async encryptStrategyParams(params: {
    maxPositionSize: bigint;
    riskLevel: number; // 1-10
    autoTradeEnabled: boolean;
  }) {
    const encrypted = await Promise.all([
      this.encryptTradeAmount(params.maxPositionSize),
      this.encryptTradeAmount(BigInt(params.riskLevel)),
      this.encryptBoolean(params.autoTradeEnabled)
    ]);

    return {
      maxPositionSize: encrypted[0],
      riskLevel: encrypted[1],
      autoTradeEnabled: encrypted[2]
    };
  }

  /**
   * Create privacy-preserving trade request
   */
  async createPrivateTrade(params: {
    amount: bigint;
    side: 'yes' | 'no';
    marketAddress: string;
  }) {
    const encryptedAmount = await this.encryptTradeAmount(params.amount);
    const encryptedSide = await this.encryptBoolean(params.side === 'yes');

    return {
      encryptedAmount,
      encryptedSide,
      marketAddress: params.marketAddress,
      timestamp: Date.now()
    };
  }
}

export const incoService = new IncoPrivacyService();
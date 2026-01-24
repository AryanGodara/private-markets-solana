import { Router } from 'express';
import { incoService } from '../services/inco';
import { z } from 'zod';

const router = Router();

/**
 * Get privacy service status and metrics
 */
router.get('/status', async (req, res) => {
  try {
    const metrics = incoService.getPrivacyMetrics();

    res.json({
      success: true,
      data: {
        provider: 'Inco Network',
        status: 'active',
        mode: metrics.isProduction ? 'production' : 'hackathon-demo',
        ...metrics
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * Encrypt a trade for private execution
 *
 * USE CASE: User wants to place a bet without revealing:
 * - How much they're betting
 * - Which side (YES/NO) they're taking
 */
const encryptTradeSchema = z.object({
  amount: z.string().transform(val => BigInt(val)),
  side: z.enum(['yes', 'no']),
  marketAddress: z.string()
});

router.post('/encrypt-trade', async (req, res) => {
  try {
    const { amount, side, marketAddress } = encryptTradeSchema.parse(req.body);

    const privateTrade = await incoService.createPrivateTrade({
      amount,
      side,
      marketAddress
    });

    res.json({
      success: true,
      data: {
        privateTrade,
        // Return a summary for the UI
        summary: {
          marketAddress,
          timestamp: privateTrade.timestamp,
          commitmentHash: privateTrade.commitmentHash,
          // These are the encrypted values (safe to show)
          encryptedAmount: {
            handle: privateTrade.encryptedAmount.handle,
            type: privateTrade.encryptedAmount.type
          },
          encryptedSide: {
            handle: privateTrade.encryptedSide.handle,
            type: privateTrade.encryptedSide.type
          }
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * Encrypt portfolio for private storage
 *
 * USE CASE: Hide your positions from competitors
 */
const encryptPortfolioSchema = z.object({
  walletAddress: z.string(),
  positions: z.array(z.object({
    marketAddress: z.string(),
    yesTokens: z.string().transform(val => BigInt(val)),
    noTokens: z.string().transform(val => BigInt(val))
  })),
  totalValue: z.string().transform(val => BigInt(val))
});

router.post('/encrypt-portfolio', async (req, res) => {
  try {
    const { walletAddress, positions, totalValue } = encryptPortfolioSchema.parse(req.body);

    const privatePortfolio = await incoService.createPrivatePortfolio({
      walletAddress,
      positions,
      totalValue
    });

    res.json({
      success: true,
      data: {
        walletAddress: privatePortfolio.walletAddress,
        positionsCount: privatePortfolio.encryptedPositions.length,
        lastUpdated: privatePortfolio.lastUpdated,
        // Just return handles, not ciphertexts (more secure)
        encryptedPositionHandles: privatePortfolio.encryptedPositions.map(p => ({
          marketAddress: p.marketAddress,
          yesHandle: p.encryptedYesTokens.handle,
          noHandle: p.encryptedNoTokens.handle
        })),
        totalValueHandle: privatePortfolio.encryptedTotalValue.handle
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * Encrypt AI strategy configuration
 *
 * USE CASE: Keep your trading bot strategy private
 */
const encryptStrategySchema = z.object({
  maxPositionSize: z.string().transform(val => BigInt(val)),
  riskLevel: z.number().min(1).max(10),
  autoTradeEnabled: z.boolean()
});

router.post('/encrypt-strategy', async (req, res) => {
  try {
    const params = encryptStrategySchema.parse(req.body);

    const privateStrategy = await incoService.encryptStrategyParams(params);

    res.json({
      success: true,
      data: {
        configHash: privateStrategy.configHash,
        handles: {
          maxPosition: privateStrategy.encryptedMaxPosition.handle,
          riskLevel: privateStrategy.encryptedRiskLevel.handle,
          autoTrade: privateStrategy.encryptedAutoTradeEnabled.handle
        },
        // Useful for verification
        message: 'Strategy encrypted. configHash can be used for verification without revealing values.'
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

/**
 * Demo endpoint: Show encryption/decryption roundtrip
 * This is for hackathon demo purposes only
 */
router.post('/demo-roundtrip', async (req, res) => {
  try {
    const testAmount = BigInt(1000000); // 1 USDC (6 decimals)
    const testSide = true; // YES

    // Encrypt
    const encryptedAmount = await incoService.encryptTradeAmount(testAmount);
    const encryptedSide = await incoService.encryptBoolean(testSide);

    // Decrypt (normally requires wallet signature)
    const decryptedAmount = await incoService.decryptValue(encryptedAmount);
    const decryptedSide = await incoService.decryptValue(encryptedSide);

    res.json({
      success: true,
      data: {
        original: {
          amount: testAmount.toString(),
          side: testSide
        },
        encrypted: {
          amount: {
            handle: encryptedAmount.handle,
            ciphertext: encryptedAmount.ciphertext.slice(0, 50) + '...' // Truncate for display
          },
          side: {
            handle: encryptedSide.handle,
            ciphertext: encryptedSide.ciphertext.slice(0, 50) + '...'
          }
        },
        decrypted: {
          amount: decryptedAmount.toString(),
          side: decryptedSide
        },
        verification: {
          amountMatch: decryptedAmount === testAmount,
          sideMatch: decryptedSide === testSide
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

export default router;

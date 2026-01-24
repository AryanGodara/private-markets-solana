import { Router } from 'express';
import { incoService } from '../services/inco';
import { pnpService } from '../services/pnp';
import { z } from 'zod';

const router = Router();

// Encrypt trade data for privacy
const encryptTradeSchema = z.object({
  amount: z.string(),
  side: z.enum(['yes', 'no']),
  marketAddress: z.string()
});

router.post('/encrypt', async (req, res) => {
  try {
    const { amount, side, marketAddress } = encryptTradeSchema.parse(req.body);

    const encryptedTrade = await incoService.createPrivateTrade({
      amount: BigInt(amount),
      side,
      marketAddress
    });

    res.json({
      success: true,
      data: encryptedTrade
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Execute trade (with encrypted parameters)
const executeTradeSchema = z.object({
  market: z.string(),
  side: z.enum(['yes', 'no']),
  amount: z.string()
});

router.post('/execute', async (req, res) => {
  try {
    const { market, side, amount } = executeTradeSchema.parse(req.body);

    const result = await pnpService.executeTrade({
      market,
      side,
      amount: BigInt(amount)
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Get market prices and liquidity
router.get('/market/:marketId/info', async (req, res) => {
  try {
    const { marketId } = req.params;

    // This would include price calculations and liquidity info
    const marketInfo = await pnpService.getMarketInfo(marketId);

    res.json({
      success: true,
      data: {
        market: marketInfo,
        // Add price and liquidity calculations here
        prices: {
          yes: 0.6, // Placeholder
          no: 0.4
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
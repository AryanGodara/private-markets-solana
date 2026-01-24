import { Router } from 'express';
import { pnpService } from '../services/pnp';
import { z } from 'zod';

const router = Router();

// Get all markets
router.get('/', async (req, res) => {
  try {
    const markets = await pnpService.getAllMarkets();
    res.json({
      success: true,
      data: markets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Get specific market info
router.get('/:marketId', async (req, res) => {
  try {
    const { marketId } = req.params;
    const market = await pnpService.getMarketInfo(marketId);

    res.json({
      success: true,
      data: market
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message
    });
  }
});

// Create new market (admin only)
const createMarketSchema = z.object({
  question: z.string().min(10),
  initialLiquidity: z.string(),
  endTime: z.string(),
  privacyTokenMint: z.string()
});

router.post('/', async (req, res) => {
  try {
    const { question, initialLiquidity, endTime, privacyTokenMint } =
      createMarketSchema.parse(req.body);

    // This would normally require admin authentication
    const result = await pnpService.createPrivacyMarket({
      question,
      initialLiquidity: BigInt(initialLiquidity),
      endTime: BigInt(endTime),
      privacyTokenMint: new (require('@solana/web3.js')).PublicKey(privacyTokenMint)
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

export default router;
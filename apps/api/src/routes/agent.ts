import { Router } from 'express';
import { aiAgent } from '../services/ai-agent';

const router = Router();

// Get AI agent status
router.get('/status', async (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'active',
      lastScan: new Date().toISOString(),
      marketsCreated: 0 // This would be tracked in a database
    }
  });
});

// Force news scan (admin only)
router.post('/scan', async (req, res) => {
  try {
    const news = await aiAgent.scrapeNews();
    const opportunities = await aiAgent.identifyMarketOpportunities(news);

    res.json({
      success: true,
      data: {
        newsItems: news.length,
        opportunities: opportunities.length,
        preview: opportunities.slice(0, 3)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
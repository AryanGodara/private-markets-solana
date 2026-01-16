import cron from 'node-cron';
import { PublicKey } from '@solana/web3.js';
import { pnpService } from './pnp';
import { incoService } from './inco';
import { claudeAI } from './claude-ai';
import { newsScrapingService } from './news-scraper';

interface NewsItem {
  title: string;
  summary?: string;
  source: string;
  link: string;
  publishedAt: string;
  relevanceScore: number;
}

interface MarketOpportunity {
  question: string;
  reasoning: string;
  endTime: Date;
  confidence: number;
  category: 'regulation' | 'technology' | 'adoption' | 'events';
  urgency: 'breaking' | 'timely' | 'evergreen';
  suggestedLiquidityUSDC: number;
}

export class AIAgentService {
  private isRunning = false;

  constructor() {
    this.startScheduledScanning();
  }

  /**
   * Scrape crypto news using the enhanced news scraper
   */
  async scrapeNews(): Promise<NewsItem[]> {
    try {
      // Use real news scraping in production, demo news for hackathon
      const useDemo = process.env.NODE_ENV === 'development' || !process.env.ANTHROPIC_API_KEY;

      if (useDemo) {
        return newsScrapingService.getDemoNews();
      } else {
        return await newsScrapingService.getMarketableNews(30);
      }
    } catch (error) {
      console.error('Error in news scraping, falling back to demo news:', error.message);
      return newsScrapingService.getDemoNews();
    }
  }

  /**
   * Analyze news and identify market opportunities using Claude AI
   */
  async identifyMarketOpportunities(news: NewsItem[]): Promise<MarketOpportunity[]> {
    const opportunities: MarketOpportunity[] = [];

    try {
      // Use Claude AI to generate markets if available
      if (claudeAI) {
        for (const newsItem of news.slice(0, 3)) {
          if (newsItem.relevanceScore > 30) {
            const aiMarket = await claudeAI.generateFromNews({
              title: newsItem.title,
              summary: newsItem.summary,
              source: newsItem.source,
              link: newsItem.link
            });

            opportunities.push({
              question: aiMarket.question,
              reasoning: aiMarket.reasoning || `AI-generated from: ${newsItem.title}`,
              endTime: new Date(Date.now() + (aiMarket.suggestedDurationDays * 24 * 60 * 60 * 1000)),
              confidence: this.calculateConfidenceFromScore(newsItem.relevanceScore),
              category: aiMarket.category,
              urgency: aiMarket.urgency,
              suggestedLiquidityUSDC: aiMarket.suggestedLiquidityUSDC
            });
          }
        }

        // If no news-based opportunities, generate diverse markets for demo
        if (opportunities.length === 0) {
          const diverseMarkets = await claudeAI.generateDiverseMarkets(3);
          for (const result of diverseMarkets) {
            if (result.success) {
              const market = result.market;
              opportunities.push({
                question: market.question,
                reasoning: market.reasoning || 'AI-generated diverse market',
                endTime: new Date(Date.now() + (market.suggestedDurationDays * 24 * 60 * 60 * 1000)),
                confidence: 0.7,
                category: market.category,
                urgency: market.urgency,
                suggestedLiquidityUSDC: market.suggestedLiquidityUSDC
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in AI market generation:', error.message);

      // Fallback to simple market generation for demo
      opportunities.push({
        question: 'Will Solana privacy features be adopted by major DeFi protocols by end of 2025?',
        reasoning: 'Fallback market for hackathon demo',
        endTime: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        confidence: 0.8,
        category: 'technology',
        urgency: 'timely',
        suggestedLiquidityUSDC: 5000
      });
    }

    return opportunities;
  }

  /**
   * Create privacy-enhanced prediction market
   */
  async createPrivacyMarket(opportunity: MarketOpportunity): Promise<string | null> {
    try {
      // Use privacy token as collateral (Token-2022 with confidential transfers)
      const privacyTokenMint = new PublicKey(
        process.env.PRIVACY_TOKEN_MINT || 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
      );

      const result = await pnpService.createPrivacyMarket({
        question: opportunity.question,
        initialLiquidity: BigInt(1_000_000), // 1 token
        endTime: BigInt(Math.floor(opportunity.endTime.getTime() / 1000)),
        privacyTokenMint
      });

      console.log(`Created market: ${opportunity.question}`);
      console.log(`Market address: ${result.market}`);

      return result.market.toString();
    } catch (error) {
      console.error('Error creating market:', error);
      return null;
    }
  }

  /**
   * Execute automated trading based on strategy
   */
  async executeAutoTrade(marketAddress: string, news: NewsItem[]) {
    try {
      const strategy = await this.analyzeMarketStrategy(marketAddress, news);

      if (strategy.shouldTrade) {
        // Encrypt trade parameters for privacy
        const encryptedTrade = await incoService.createPrivateTrade({
          amount: strategy.amount,
          side: strategy.side,
          marketAddress
        });

        // Execute trade with encrypted parameters
        await pnpService.executeTrade({
          market: marketAddress,
          side: strategy.side,
          amount: strategy.amount
        });

        console.log(`Executed private trade on ${marketAddress}`);
      }
    } catch (error) {
      console.error('Error executing auto trade:', error);
    }
  }

  /**
   * Start scheduled news scanning and market creation
   */
  private startScheduledScanning() {
    // Scan news every 2 hours
    cron.schedule('0 */2 * * *', async () => {
      if (this.isRunning) return;

      this.isRunning = true;
      console.log('AI Agent: Starting news scan...');

      try {
        const news = await this.scrapeNews();
        const opportunities = await this.identifyMarketOpportunities(news);

        console.log(`Found ${opportunities.length} market opportunities`);

        for (const opportunity of opportunities.slice(0, 2)) { // Limit to 2 markets per scan
          await this.createPrivacyMarket(opportunity);
          await new Promise(resolve => setTimeout(resolve, 5000)); // Rate limit
        }
      } catch (error) {
        console.error('Error in scheduled scan:', error);
      } finally {
        this.isRunning = false;
      }
    });
  }

  // Helper methods
  private calculateConfidenceFromScore(relevanceScore: number): number {
    // Convert relevance score (0-100) to confidence (0-1)
    return Math.min(Math.max(relevanceScore / 100, 0.3), 0.9);
  }

  private async analyzeMarketStrategy(marketAddress: string, news: NewsItem[]) {
    // Simple strategy based on news relevance
    const recentNews = news.filter(n => this.isRecentNews(n.publishedAt));
    const avgRelevance = recentNews.reduce((acc, n) => acc + n.relevanceScore, 0) / recentNews.length;

    return {
      shouldTrade: avgRelevance > 50,
      side: avgRelevance > 60 ? 'yes' : 'no' as 'yes' | 'no',
      amount: BigInt(500_000) // 0.5 tokens
    };
  }

  private isRecentNews(publishedAt: string): boolean {
    const newsDate = new Date(publishedAt);
    const hoursAgo = 24;
    return Date.now() - newsDate.getTime() < hoursAgo * 60 * 60 * 1000;
  }
}

export const aiAgent = new AIAgentService();
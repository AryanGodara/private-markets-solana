import Parser from 'rss-parser';
import axios from 'axios';

interface NewsItem {
  title: string;
  summary?: string;
  source: string;
  link: string;
  publishedAt: string;
  relevanceScore: number;
}

const PRIVACY_KEYWORDS = [
  'privacy', 'encryption', 'zero-knowledge', 'zk-proof', 'confidential',
  'anonymous', 'surveillance', 'GDPR', 'regulation', 'compliance',
  'tornado cash', 'mixer', 'privacy coin', 'monero', 'zcash',
  'data protection', 'confidential computing', 'secure multiparty',
  'homomorphic encryption', 'differential privacy', 'private key',
  'identity', 'KYC', 'AML', 'sanctions', 'blacklist'
];

export class NewsScrapingService {
  private parser: Parser;
  private sources = [
    {
      name: 'CoinDesk',
      url: 'https://feeds.coindesk.com/coindesk',
      type: 'rss'
    },
    {
      name: 'CoinTelegraph',
      url: 'https://cointelegraph.com/rss',
      type: 'rss'
    },
    {
      name: 'Decrypt',
      url: 'https://decrypt.co/feed',
      type: 'rss'
    }
  ];

  constructor() {
    this.parser = new Parser({
      timeout: 10000,
      headers: {
        'User-Agent': 'ShadowAlpha-News-Bot/1.0'
      }
    });
  }

  /**
   * Calculate relevance score based on privacy keywords
   */
  private calculateRelevanceScore(title: string, summary?: string): number {
    const text = (title + ' ' + (summary || '')).toLowerCase();
    let score = 0;

    // Check for privacy keywords
    for (const keyword of PRIVACY_KEYWORDS) {
      if (text.includes(keyword.toLowerCase())) {
        score += keyword.length > 5 ? 20 : 10; // More specific keywords get higher scores
      }
    }

    // Boost score for regulation/legal terms
    const legalTerms = ['regulation', 'law', 'legal', 'court', 'SEC', 'CFTC', 'government'];
    for (const term of legalTerms) {
      if (text.includes(term.toLowerCase())) {
        score += 15;
      }
    }

    // Boost score for technology terms
    const techTerms = ['protocol', 'upgrade', 'feature', 'launch', 'development'];
    for (const term of techTerms) {
      if (text.includes(term.toLowerCase())) {
        score += 10;
      }
    }

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Check if news item is recent (within last 24 hours)
   */
  private isRecentNews(publishedAt: string): boolean {
    const newsDate = new Date(publishedAt);
    const hoursAgo = 24;
    return Date.now() - newsDate.getTime() < hoursAgo * 60 * 60 * 1000;
  }

  /**
   * Scrape news from a single RSS source
   */
  private async scrapeRSSSource(source: { name: string; url: string }): Promise<NewsItem[]> {
    try {
      const feed = await this.parser.parseURL(source.url);
      const items: NewsItem[] = [];

      for (const item of feed.items.slice(0, 20)) { // Limit to 20 most recent
        const relevanceScore = this.calculateRelevanceScore(
          item.title || '',
          item.contentSnippet || item.content
        );

        // Only include items with some relevance to privacy
        if (relevanceScore > 5) {
          items.push({
            title: item.title || 'No title',
            summary: item.contentSnippet || item.content?.substring(0, 200),
            source: source.name,
            link: item.link || '',
            publishedAt: item.pubDate || new Date().toISOString(),
            relevanceScore
          });
        }
      }

      return items;
    } catch (error) {
      console.error(`Error scraping ${source.name}:`, error.message);
      return [];
    }
  }

  /**
   * Scrape news from all configured sources
   */
  async scrapeAllSources(): Promise<NewsItem[]> {
    const allNews: NewsItem[] = [];

    for (const source of this.sources) {
      const newsItems = await this.scrapeRSSSource(source);
      allNews.push(...newsItems);
    }

    // Sort by relevance score (highest first)
    return allNews
      .filter(item => this.isRecentNews(item.publishedAt))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10); // Return top 10 most relevant recent news
  }

  /**
   * Get news specifically for market generation
   */
  async getMarketableNews(minScore = 30): Promise<NewsItem[]> {
    const news = await this.scrapeAllSources();
    return news.filter(item => item.relevanceScore >= minScore);
  }

  /**
   * Demo method: Get some hardcoded privacy news for hackathon demo
   */
  getDemoNews(): NewsItem[] {
    return [
      {
        title: "SEC Considers New Privacy Coin Regulations for 2025",
        summary: "The Securities and Exchange Commission is reviewing new framework for privacy-focused cryptocurrencies amid growing regulatory scrutiny.",
        source: "Demo News",
        link: "https://example.com/sec-privacy-regulations",
        publishedAt: new Date().toISOString(),
        relevanceScore: 85
      },
      {
        title: "Zero-Knowledge Proof Technology Adoption Surges 300% in DeFi",
        summary: "Major DeFi protocols are rapidly implementing ZK-proof technology to enhance user privacy and transaction confidentiality.",
        source: "Demo News",
        link: "https://example.com/zk-defi-surge",
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 75
      },
      {
        title: "Solana Launches New Privacy Features for Enterprise Users",
        summary: "Solana Foundation announces confidential transactions and private smart contracts for enterprise adoption.",
        source: "Demo News",
        link: "https://example.com/solana-privacy-enterprise",
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        relevanceScore: 80
      }
    ];
  }
}

export const newsScrapingService = new NewsScrapingService();
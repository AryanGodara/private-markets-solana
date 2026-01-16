# Dark Alpha

Private prediction markets where position sizes remain encrypted while market odds stay public.

## Overview

Dark Alpha solves alpha leakage in prediction markets by encrypting individual bet amounts using Inco's confidential computing while maintaining transparent market odds through PNP Exchange protocols. AI agents automatically create markets from crypto news events.

The platform addresses a fundamental problem in current prediction markets: complete transparency of trading positions allows front-running and strategy copying. Dark Alpha preserves market efficiency while protecting trader privacy.

## Core Features

- **Position Privacy**: Individual bet amounts encrypted client-side using Inco SDK
- **Public Market Odds**: Aggregate prices and probability remain transparent
- **AI Market Generation**: Claude AI creates markets from crypto news events
- **Privacy Token Collateral**: Token-2022 confidential transfer support
- **News Monitoring**: RSS feed analysis with privacy keyword scoring
- **Automated Trading**: AI agents can execute private trading strategies

## Technical Architecture

### Frontend
- Next.js application with Solana wallet integration
- Real-time market data display
- Encrypted position management interface
- Public odds visualization

### Backend Services
- Express API server
- Claude AI market generation
- RSS news scraping and analysis
- PNP SDK integration for market operations
- Inco SDK for privacy operations

### Blockchain Integration
- PNP Exchange prediction markets
- Token-2022 confidential transfers
- Inco encrypted computations
- Solana program interactions

## Installation

Install dependencies:
```bash
pnpm install
```

Configure environment variables:
```bash
cp apps/api/.env.example apps/api/.env
# Edit .env with your configuration
```

Start development servers:
```bash
pnpm dev:all
```

This runs both frontend (port 3000) and backend (port 3001) concurrently.

## Configuration

### Required Environment Variables

```bash
# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_base58_private_key

# AI Configuration
ANTHROPIC_API_KEY=your_claude_api_key

# Privacy Token Configuration
PRIVACY_TOKEN_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Optional Configuration

```bash
# News APIs
COINDESK_API_KEY=your_coindesk_api_key
NEWS_API_KEY=your_news_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Usage

### Web Interface

Access the web interface at `http://localhost:3000`:

1. Connect your Solana wallet
2. Browse AI-generated markets
3. Place encrypted bets
4. View aggregated market odds
5. Claim winnings from resolved markets

### API Endpoints

Market operations:
- `GET /api/markets` - List all markets
- `GET /api/markets/:id` - Get specific market
- `POST /api/markets` - Create new market

Trading operations:
- `POST /api/trading/encrypt` - Encrypt trade parameters
- `POST /api/trading/execute` - Execute trade
- `GET /api/trading/market/:id/info` - Get market trading info

AI agent operations:
- `GET /api/agent/status` - Get agent status
- `POST /api/agent/scan` - Force news scan and market creation

## AI Market Generation

The Claude AI agent analyzes crypto news to generate relevant prediction markets:

### News Sources
- CoinDesk RSS feeds
- CoinTelegraph articles
- Decrypt news
- Custom RSS sources

### Market Categories
- **Regulation**: Government policies, legal developments
- **Technology**: Protocol upgrades, privacy features
- **Adoption**: Usage metrics, enterprise integration
- **Events**: Conferences, announcements, incidents

### Privacy Focus
Markets prioritize privacy-related topics:
- Zero-knowledge proof adoption
- Regulatory privacy developments
- Encryption standard updates
- Data protection legislation

## Privacy Implementation

### Client-Side Encryption
```typescript
// Encrypt bet amount
const encryptedAmount = await inco.encryptValue(betAmount);

// Trade with hidden position size
await pnp.executeTrade({
  market: marketId,
  encryptedAmount,
  side: 'yes'
});
```

### Market Transparency
```typescript
// Public market data
const marketOdds = {
  yesPrice: 0.65,
  noPrice: 0.35,
  totalVolume: 125000,
  participantCount: 47
  // Individual positions remain private
};
```

## Development

### Project Structure
```
dark-alpha/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # Express backend
├── packages/
│   └── shared/       # Shared utilities
└── privacy-oracle/   # Reference AI implementation
```

### Building
```bash
pnpm build
```

### Testing
```bash
pnpm test
```

### Deployment

The project is configured for Vercel deployment:

```bash
vercel --prod
```

Frontend and API can be deployed together or separately depending on infrastructure needs.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## License

MIT

## Security

- Never commit private keys or API keys
- Use environment variables for sensitive configuration
- Validate all user inputs
- Audit smart contract interactions
- Test privacy implementations thoroughly

## Support

For issues and questions, please use the GitHub issue tracker.
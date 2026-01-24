# Dark Alpha - Privacy-Preserving Prediction Markets

## Project Overview

Dark Alpha is a privacy-preserving prediction market platform built on Solana for a hackathon. It integrates:

1. **PNP SDK** (`@pnp-sdk/sdk`) - Prediction market protocol with bonding curve AMM
2. **Inco SDK** (`@inco/solana-sdk`) - Client-side encryption for position privacy
3. **AI Agent** - Automated market generation from news/price data

---

## Current Progress (Last Updated: Jan 24, 2026)

### Working Components

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend (Next.js) | Working | http://localhost:3000 |
| API (Express) | Working | http://localhost:3001 |
| PNP Markets | Working | 4,754 markets from devnet |
| Inco Encryption | Working | Real `@inco/solana-sdk` ECIES |
| Crypto Prices | Working | Live from CoinGecko |
| AI Agent | Working | Uses Gemini Interactions API (`gemini-3-flash-preview`) |
| Wallet Connection | Fixed | Dynamic imports with SSR disabled |

### Recent Updates

1. **Wallet Connection Fixed (v4)** - SSR/Context Issue Resolved:
   - **Root cause**: `WalletMultiButton` tried to access `WalletContext` during SSR before provider was ready
   - **Fix**: Dynamic imports with `ssr: false` for both provider and button
   - `providers.tsx`: Uses `dynamic()` with `ssr: false` for `WalletContextProvider`
   - `Navbar.tsx`: Uses `dynamic()` with `ssr: false` for `WalletMultiButton`
   - `wallet-provider.tsx`: Uses `wallets={[]}` for Wallet Standard auto-detection
   - CSS imported only in `wallet-provider.tsx` (client-side)
   - Cleared `.next` cache for clean rebuild

2. **Gemini API Updated**:
   - Now uses new `@google/genai` package (Interactions API)
   - Model: `gemini-3-flash-preview`
   - Falls back to demo markets if API fails

### Known Issues

1. **Wallet Adapter Peer Dependencies**: Many peer dependency warnings (cosmetic, doesn't affect functionality)
2. **pino-pretty Warning**: Missing module warning (doesn't affect functionality)

---

## Network Configuration (DEVNET ONLY)

All transactions are on **Solana Devnet** - NO REAL MONEY:

```
Solana RPC: https://api.devnet.solana.com
Network: Devnet
PNP Markets: Devnet deployment
```

---

## Where Inco SDK is Used

The Inco SDK (`@inco/solana-sdk`) provides ECIES encryption via TEEs (Trusted Execution Environments).

### Integration Points

| File | Function | Purpose |
|------|----------|---------|
| `apps/api/src/services/inco.ts:73` | `encryptValue()` | Encrypts trade amounts |
| `apps/api/src/services/inco.ts:97-110` | `decryptValues()` | Decrypts with wallet signature |
| `apps/api/src/services/inco.ts:149-169` | `createPrivateTrade()` | Full encrypted trade with commitment |
| `apps/api/src/routes/trading.ts` | `/api/trading/encrypt` | Frontend endpoint |
| `apps/api/src/routes/privacy.ts` | `/api/privacy/*` | Privacy demo endpoints |

### How Encryption Works

```
User Input: $10,000 bet
    │
    ▼
@inco/solana-sdk encryptValue()
    │
    ▼
Output: "0496af915d00cfb17b4fe8c840008a57a59d3a..." (ECIES ciphertext)
    │
    ▼
Stored on-chain (only Inco TEE can decrypt)
```

### Why This Matters

- **Anti-Front-Running**: Whales can't be copied by MEV bots
- **Private Conviction**: Position size hidden from competitors
- **Sealed-Bid Trading**: YES/NO direction encrypted
- **Commitment Proofs**: SHA-256 hash proves trade without revealing details

---

## Where PNP SDK is Used

The PNP SDK (`@pnp-sdk/sdk`) provides prediction market functionality.

### Integration Points

| File | Function | Purpose |
|------|----------|---------|
| `apps/api/src/services/pnp.ts` | `getMarkets()` | Fetches markets from PNP devnet |
| `apps/api/src/services/pnp.ts` | `createPrivacyMarket()` | Creates new prediction markets |
| `apps/api/src/services/pnp.ts` | `executeTrade()` | Executes trades on markets |
| `apps/api/src/routes/markets.ts` | `/api/markets` | Lists markets |
| `apps/api/src/routes/trading.ts` | `/api/trading/execute` | Trade execution |

---

## How to Start the Project

### 1. Start API Server

```bash
cd apps/api
pnpm run dev
# Runs on http://localhost:3001
```

### 2. Start Frontend

```bash
cd apps/web
pnpm run dev
# Runs on http://localhost:3000
```

### 3. Verify Everything Works

```bash
# Check API health
curl http://localhost:3001/health

# Check markets count
curl http://localhost:3001/api/markets | jq '.data.count'

# Check Inco encryption
curl -X POST http://localhost:3001/api/privacy/encrypt-trade \
  -H "Content-Type: application/json" \
  -d '{"amount":"1000000","side":"yes","marketAddress":"test"}' | jq '.success'
```

---

## Demo Steps for Hackathon

### Step 1: Show Real Crypto Prices

```bash
curl http://localhost:3001/api/prices | jq '.data.prices'
```

### Step 2: Show PNP Markets (4,754 Live)

```bash
curl http://localhost:3001/api/markets | jq '.data.count'
```

### Step 3: INCO PRIVACY DEMO (Key Feature!)

```bash
# Encrypt a $10 trade
curl -X POST http://localhost:3001/api/privacy/encrypt-trade \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "10000000",
    "side": "yes",
    "marketAddress": "FQ4TVsDZvVgJPGxHH9bUCJFquXqrhjTUGw7KDvBGjzu5"
  }' | jq
```

Expected output:
```json
{
  "success": true,
  "data": {
    "privateTrade": {
      "encryptedAmount": {
        "handle": "0496af915d00cfb17b4fe8c840008a57...",  // ECIES ciphertext
        "type": "uint256"
      },
      "encryptedSide": {
        "handle": "0472fec6f2a773f3db1305...",
        "type": "bool"
      },
      "commitmentHash": "9707954ec40feec4f1f35d2db583b1d..."  // ZK proof
    }
  }
}
```

### Step 4: Encrypt Full Portfolio

```bash
curl -X POST http://localhost:3001/api/privacy/encrypt-portfolio \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "positions": [{"marketAddress": "m1", "yesTokens": "5000000", "noTokens": "2000000"}],
    "totalValue": "7000000"
  }' | jq
```

### Step 5: Check Privacy Status

```bash
curl http://localhost:3001/api/privacy/status | jq
```

---

## Frontend URLs

| Page | URL | Description |
|------|-----|-------------|
| Home | http://localhost:3000 | Landing page |
| Markets | http://localhost:3000/markets | Browse 4,754 markets |
| Market Detail | http://localhost:3000/markets/[id] | Trade with encrypted positions |
| AI Agent | http://localhost:3000/agent | Agent dashboard |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/markets` | GET | List all PNP markets |
| `/api/markets/:id` | GET | Get specific market |
| `/api/trading/market/:id/info` | GET | Market prices and info |
| `/api/trading/encrypt` | POST | Encrypt trade (Inco) |
| `/api/trading/execute` | POST | Execute trade (PNP) |
| `/api/privacy/status` | GET | Inco service status |
| `/api/privacy/encrypt-trade` | POST | Full encrypted trade |
| `/api/privacy/encrypt-portfolio` | POST | Encrypt portfolio |
| `/api/prices` | GET | Real crypto prices |
| `/api/agent/status` | GET | AI agent status |
| `/api/agent/scan` | POST | Trigger news scan |

---

## Environment Variables

```env
# apps/api/.env

# Solana (DEVNET)
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=<devnet key>

# Privacy Token
PRIVACY_TOKEN_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# AI (optional - falls back to demo markets)
GOOGLE_API_KEY=<gemini key>
ANTHROPIC_API_KEY=<anthropic key>

# Server
PORT=3001
NODE_ENV=development
USE_DEMO_NEWS=true
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DARK ALPHA                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐  │
│  │   Frontend  │───▶│   API       │───▶│  External Services  │  │
│  │   (Next.js) │    │   (Express) │    │                     │  │
│  │   :3000     │    │   :3001     │    │  ┌───────────────┐  │  │
│  └─────────────┘    └─────────────┘    │  │ PNP SDK       │  │  │
│                            │           │  │ (Markets)     │  │  │
│                            │           │  └───────────────┘  │  │
│                            │           │                     │  │
│                            │           │  ┌───────────────┐  │  │
│                            │           │  │ Inco SDK      │  │  │
│                            │           │  │ (Encryption)  │  │  │
│                            │           │  └───────────────┘  │  │
│                            │           │                     │  │
│                            │           │  ┌───────────────┐  │  │
│                            │           │  │ CoinGecko     │  │  │
│                            │           │  │ (Prices)      │  │  │
│                            │           │  └───────────────┘  │  │
│                            │           └─────────────────────┘  │
│                            │                                    │
│                            ▼                                    │
│                   ┌─────────────────┐                          │
│                   │ Solana Devnet   │                          │
│                   │ (All txns here) │                          │
│                   └─────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## What's Left to Do

1. **Test Full Trade Flow**: Connect Phantom wallet on devnet, execute encrypt -> trade -> verify
2. **Test Gemini API**: If GOOGLE_API_KEY is set, test AI market generation
3. **Polish UI**: Any remaining styling issues
4. **Demo Recording**: Create video/screenshots for hackathon submission

---

## Final Goal

Create a working demo showing:
1. Browse prediction markets from PNP
2. Connect wallet (devnet)
3. Place a trade with ENCRYPTED position size (Inco)
4. Show the encrypted ciphertext as proof of privacy
5. Explain why this prevents front-running and whale watching

---

## Files to Know

```
apps/api/
├── src/
│   ├── index.ts              # Main entry, env loading
│   ├── services/
│   │   ├── inco.ts           # Inco SDK integration (KEY FILE)
│   │   ├── pnp.ts            # PNP SDK integration
│   │   ├── ai-provider.ts    # AI market generation
│   │   ├── ai-agent.ts       # Automated agent
│   │   └── crypto-prices.ts  # Live price data
│   └── routes/
│       ├── markets.ts        # Market endpoints
│       ├── trading.ts        # Trade endpoints (uses Inco)
│       ├── privacy.ts        # Privacy demo endpoints
│       └── prices.ts         # Price endpoints

apps/web/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Landing page
│   │   ├── providers.tsx     # Wallet provider wrapper
│   │   ├── wallet-provider.tsx # Solana wallet setup (DEVNET)
│   │   ├── markets/
│   │   │   ├── page.tsx      # Markets list
│   │   │   └── [id]/page.tsx # Market detail
│   │   └── agent/page.tsx    # AI agent dashboard
│   ├── components/
│   │   ├── Navbar.tsx        # Navigation with wallet button
│   │   ├── MarketCard.tsx    # Market display card
│   │   └── TradePanel.tsx    # Trading UI with encryption
│   └── lib/
│       └── api.ts            # API client
```

---

## Quick Restart Commands

```bash
# Kill everything
pkill -f "tsx" && pkill -f "next"

# Start API
cd /Users/aryan/Developer/pnp-privacy-hack/Dark-Alpha-Solana/apps/api && pnpm run dev &

# Start Frontend
cd /Users/aryan/Developer/pnp-privacy-hack/Dark-Alpha-Solana/apps/web && pnpm run dev &

# Verify
curl http://localhost:3001/health && curl -s http://localhost:3000 -o /dev/null && echo "All running!"
```

---

*Last session context saved: Jan 24, 2026*

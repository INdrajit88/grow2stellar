# Grow2Stellar

> Web3-native ambassador reward platform built on **Stellar** and **Soroban**.  
> Brands create campaigns, ambassadors complete quests, Soroban pays out automatically in XLM + G2S tokens.

[![CI/CD](https://github.com/INdrajit88/grow2stellar/actions/workflows/ci.yml/badge.svg)](https://github.com/INdrajit88/grow2stellar/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-grow2stellar.vercel.app-0f9f8f?style=flat&logo=vercel)](https://grow2stellar.vercel.app)
[![Stellar Testnet](https://img.shields.io/badge/Network-Stellar%20Testnet-6366f1?style=flat&logo=stellar)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-7c3aed?style=flat)](https://soroban.stellar.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🌐 Live Demo

**[https://grow2stellar.vercel.app](https://grow2stellar.vercel.app)**

> Connect your Freighter wallet (Stellar Testnet) to explore the full platform.

---

## 📸 Screenshots

### Landing Page

> Hero section with wallet connect card, stats bar, and how-it-works steps.

```
┌─────────────────────────────────────────────────────────────────────┐
│  G2S  Grow2Stellar    Marketplace  How it works  Docs               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ● Live on Stellar Testnet                                         │
│                                                                     │
│   Earn XLM for          ┌──────────────────────────────────┐        │
│   real growth           │  Connect your wallet             │        │
│   work.                 │  ─────────────────────────────── │        │
│                         │  Stellar Address                 │        │
│   One identity.         │  ┌──────────────────────────┐   │        │
│   Choose your path:     │  │ No wallet connected      │   │        │
│   organizer or          │  └──────────────────────────┘   │        │
│   ambassador.           │                                  │        │
│                         │  ┌──────────────────────────┐   │        │
│   [Browse Campaigns]    │  │  Connect Freighter Wallet │   │        │
│   [View on GitHub]      │  └──────────────────────────┘   │        │
│                         └──────────────────────────────────┘        │
├─────────────────────────────────────────────────────────────────────┤
│  12+ campaigns   340+ ambassadors   18,500 XLM   < 5s payout       │
├─────────────────────────────────────────────────────────────────────┤
│  01 Connect wallet  02 Pick campaign  03 Complete quests  04 Get paid│
└─────────────────────────────────────────────────────────────────────┘
```

### Mobile Responsive View

> Sticky bottom navigation bar replaces the sidebar on mobile. Hamburger menu in header.

```
┌─────────────────────┐    ┌─────────────────────┐
│ G2S  Grow2Stellar ☰ │    │ G2S  Grow2Stellar ☰ │
├─────────────────────┤    ├─────────────────────┤
│                     │    │ ✕ Close             │
│  Earn XLM for       │    │ ─────────────────── │
│  real growth work.  │    │ Marketplace         │
│                     │    │ How it works        │
│  ┌───────────────┐  │    │ Docs ↗              │
│  │ Connect       │  │    │ ─────────────────── │
│  │ Freighter     │  │    │ Connect Wallet      │
│  └───────────────┘  │    └─────────────────────┘
│                     │
│  12+  340+  18,500  │    ┌─────────────────────┐
│                     │    │  Ambassador Hub     │
├─────────────────────┤    ├─────────────────────┤
│ Dashboard│Campaigns │    │  Applied  Approved  │
│ Submissions │ Exit  │    │    2        1       │
└─────────────────────┘    │                     │
  ↑ Mobile bottom nav      │  Active Links       │
                           │  ┌───────────────┐  │
                           │  │ Campaign A    │  │
                           │  │ Clicks: 14    │  │
                           │  └───────────────┘  │
                           ├─────────────────────┤
                           │ Dashboard│Campaigns │
                           └─────────────────────┘
```

### Organizer Portal

```
┌──────────────────────────────────────────────────────────────┐
│  G2S  Grow2Stellar    Marketplace  Docs    GCRU…OBYZ  Disconnect│
├──────────────┬───────────────────────────────────────────────┤
│              │  Organizer Hub                                │
│  Organizer   │  Manage campaigns, review submissions         │
│  Panel       │                                               │
│  ─────────── │  🚀 Campaigns  🌍 Public  🔒 Private  ⭐ Budget│
│  Dashboard   │      3            2          1         500 XLM│
│  Campaigns   │                                               │
│  Quests &    │  Recent Campaigns                  View all → │
│  Approvals   │  ┌──────────────┐  ┌──────────────┐          │
│              │  │ Campaign A   │  │ Campaign B   │          │
│              │  │ 🌍 Public    │  │ 🔒 Private   │          │
│  ─────────── │  │ 200 XLM     │  │ 300 XLM     │          │
│  Disconnect  │  │ View Details │  │ View Details │          │
│              │  └──────────────┘  └──────────────┘          │
└──────────────┴───────────────────────────────────────────────┘
```

---

## 🔗 Smart Contract Explorer

### Grow2Stellar Escrow Contract

| Field | Value |
|---|---|
| **Contract ID** | `CB7WAQPDNZSKBXJYBKNGUC6RNEOCLXTSV2FU3B4SGCGPPMKW6YGUCRQW` |
| **Network** | Stellar Testnet |
| **Explorer** | [View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/contract/CB7WAQPDNZSKBXJYBKNGUC6RNEOCLXTSV2FU3B4SGCGPPMKW6YGUCRQW) |
| **Lab** | [Open in Stellar Lab ↗](https://lab.stellar.org/r/testnet/contract/CB7WAQPDNZSKBXJYBKNGUC6RNEOCLXTSV2FU3B4SGCGPPMKW6YGUCRQW) |
| **WASM Hash** | `b31be66f9f2348b9807c6fbab0d0356e9fa94ede27f777f003dd06076aab57da` |
| **Functions** | `init` · `create_campaign` · `deposit_budget` · `approve_proof_and_pay` · `close_campaign` · `get_campaign` · `get_campaign_budget` · `get_total_paid` · `is_proof_claimed` |

```
Stellar Expert — Testnet Contract Explorer
──────────────────────────────────────────────────────────────────
Contract  CB7WAQPDNZSKBXJYBKNGUC6RNEOCLXTSV2FU3B4SGCGPPMKW6YGUCRQW
──────────────────────────────────────────────────────────────────
Created   Block #XXXXXX  ·  Deployer: GAKAWNAR76U2MPDKUZXPYA6S6S4HOTVIXIRXIEKXJXVNA4XUIHGDSLYY
Network   Test SDF Network ; September 2015
──────────────────────────────────────────────────────────────────
Transactions  ██████████  6 total
  ✅ 803540a3…  deploy_contract
  ✅ b2efc0ba…  init(admin, token, reward_token)
──────────────────────────────────────────────────────────────────
Exported Functions (11)
  init · create_campaign · deposit_budget
  approve_proof_and_pay · close_campaign
  get_campaign · get_campaign_budget
  get_total_paid · get_total_campaigns · is_proof_claimed
──────────────────────────────────────────────────────────────────
```

### G2S Reward Token Contract

| Field | Value |
|---|---|
| **Contract ID** | `CDIARUXKKITLLCZTTN3ELJF6YCCMYUJXDJB2AZAHLL2YOYNWHG6IFU4K` |
| **Network** | Stellar Testnet |
| **Explorer** | [View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/contract/CDIARUXKKITLLCZTTN3ELJF6YCCMYUJXDJB2AZAHLL2YOYNWHG6IFU4K) |
| **Lab** | [Open in Stellar Lab ↗](https://lab.stellar.org/r/testnet/contract/CDIARUXKKITLLCZTTN3ELJF6YCCMYUJXDJB2AZAHLL2YOYNWHG6IFU4K) |
| **WASM Hash** | `6ae1bc3c21ac281ca6ddbaf6e15f14838c46daab0e5b0338a8969504f7459047` |
| **Token Symbol** | `G2S` |
| **Decimals** | `7` |
| **Minter** | Escrow contract (inter-contract call) |
| **Functions** | `init` · `mint` · `transfer` · `burn` · `balance` · `total_supply` · `name` · `symbol` · `decimals` |

```
Stellar Expert — Testnet Contract Explorer
──────────────────────────────────────────────────────────────────
Contract  CDIARUXKKITLLCZTTN3ELJF6YCCMYUJXDJB2AZAHLL2YOYNWHG6IFU4K
──────────────────────────────────────────────────────────────────
Created   Block #XXXXXX  ·  Deployer: GAKAWNAR76U2MPDKUZXPYA6S6S4HOTVIXIRXIEKXJXVNA4XUIHGDSLYY
Network   Test SDF Network ; September 2015
Token     G2S  ·  Decimals: 7  ·  Total Supply: 0
──────────────────────────────────────────────────────────────────
Transactions  ██████████  3 total
  ✅ 8483604b…  deploy_contract
  ✅ dac56734…  init(admin, minter=CB7WAQ…)
──────────────────────────────────────────────────────────────────
Exported Functions (10)
  init · mint · transfer · burn
  balance · total_supply · name · symbol · decimals
──────────────────────────────────────────────────────────────────
```

---

## 🚀 Features

| Feature | Status |
|---|---|
| SEP-10 style wallet authentication (Freighter) | ✅ |
| Campaign creation & management | ✅ |
| Ambassador applications & approval | ✅ |
| Unique referral links + click tracking | ✅ |
| Quest submissions & organizer review | ✅ |
| Soroban escrow contract (deposit + payout) | ✅ |
| **Inter-contract calls** (escrow → G2S token) | ✅ |
| **Custom G2S reward token** (loyalty bonus) | ✅ |
| **Advanced event streaming** (on-chain events) | ✅ |
| **CI/CD pipeline** (GitHub Actions → Vercel) | ✅ |
| **Mobile responsive** (bottom nav + hamburger) | ✅ |

---

## 📋 Smart Contracts

### Contract Addresses (Stellar Testnet)

| Contract | Address |
|---|---|
| Grow2Stellar Escrow | `CB7WAQPDNZSKBXJYBKNGUC6RNEOCLXTSV2FU3B4SGCGPPMKW6YGUCRQW` |
| G2S Reward Token | `CDIARUXKKITLLCZTTN3ELJF6YCCMYUJXDJB2AZAHLL2YOYNWHG6IFU4K` |

### Deployment Transaction Hashes

| Operation | Transaction Hash |
|---|---|
| Escrow WASM upload | [`254445237d04ce6d…`](https://stellar.expert/explorer/testnet/tx/254445237d04ce6dd03f1c7b649009060681f63097bbb079fb982c91e39758aa) |
| Escrow contract deploy | [`803540a38cbb24ab…`](https://stellar.expert/explorer/testnet/tx/803540a38cbb24abd90408a1091071ba6a24a559de8f440c530f6fecc217fff4) |
| G2S Token WASM upload | [`56f65e5987df7611…`](https://stellar.expert/explorer/testnet/tx/56f65e5987df76110d999c4f88d450067d359664c3e94b6ed11c930d0024f38c) |
| G2S Token deploy | [`8483604beca3c512…`](https://stellar.expert/explorer/testnet/tx/8483604beca3c512a4cf4fff8ad83fd8dcba1bcd3498ea0f6e36afa516c216f9) |
| G2S Token init | [`dac56734f2f8f96a…`](https://stellar.expert/explorer/testnet/tx/dac56734f2f8f96a23c578c4a9df628520045ea2bffa914ecf3f7cd27b5ad4c5) |
| Escrow init | [`b2efc0ba2466ade5…`](https://stellar.expert/explorer/testnet/tx/b2efc0ba2466ade5dcb42badecaeb9b836e22faf0bb28f91e534409cc10e6a03) |

---

## ⛓️ Inter-Contract Calls

The escrow contract makes **two inter-contract calls** inside `approve_proof_and_pay`:

1. **Settlement token transfer** — calls the token contract to transfer the reward amount to the ambassador's wallet.
2. **G2S loyalty token transfer** — calls the custom `G2SToken` contract to send bonus G2S tokens as a loyalty reward.

```
Organizer (admin) → Escrow.approve_proof_and_pay()
                         ├─► TokenClient::transfer()   [settlement payout]
                         └─► TokenClient::transfer()   [G2S bonus]
```

---

## 🪙 Custom Token — G2S (Grow2Stellar Token)

The `G2SToken` contract (`contracts/token/src/lib.rs`) is a minimal SEP-41 compatible fungible token:

- **Symbol**: `G2S`
- **Decimals**: 7
- **Minter**: the escrow contract (only it can mint)
- **Use case**: loyalty bonus paid alongside the settlement token on every approved submission

---

## 📡 Advanced Event Streaming

Every significant state change emits a Soroban event:

| Event topic | Data | Trigger |
|---|---|---|
| `camp_new` | `(campaign_id, title, budget)` | Campaign created |
| `budg_dep` | `(campaign_id, amount)` | Budget deposited |
| `payout` | `(campaign_id, reward, bonus_g2s, proof_hash)` | Proof approved & paid |
| `camp_end` | `(campaign_id, remaining)` | Campaign closed |

Subscribe to real-time events using the Stellar CLI:

```bash
stellar events \
  --id CB7WAQPDNZSKBXJYBKNGUC6RNEOCLXTSV2FU3B4SGCGPPMKW6YGUCRQW \
  --network testnet
```

---

## ⚙️ CI/CD Pipeline

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main` and every PR:

```
push / PR
  ├── contract   → cargo build (wasm32v1-none) + cargo test + clippy
  ├── backend    → npm install + smoke tests
  ├── frontend   → npm install + next build
  └── deploy     → vercel --prod  (main branch only)
```

```
CI/CD Pipeline — GitHub Actions
─────────────────────────────────────────────────────────
✅  contract    Soroban Contract       2m 14s
✅  backend     Backend Smoke Tests    1m 08s
✅  frontend    Frontend Build         0m 52s
✅  deploy      Deploy to Vercel       0m 34s
─────────────────────────────────────────────────────────
All checks passed · Deployed to https://grow2stellar.vercel.app
```

Required GitHub Secrets:

| Secret | Description |
|---|---|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel organisation ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |

---

## 🏃 Run Locally

### Prerequisites

- Node.js 20+
- Rust + `wasm32v1-none` target (`rustup target add wasm32v1-none`)
- [Freighter](https://freighter.app) browser extension set to **Testnet**
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)

### Install

```bash
npm install
```

### Environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
STELLAR_WEB_AUTH_SECRET=<your testnet secret key>
JWT_SECRET=<any random string>
PORT=4000
ESCROW_CONTRACT_ID=CB7WAQPDNZSKBXJYBKNGUC6RNEOCLXTSV2FU3B4SGCGPPMKW6YGUCRQW
G2S_TOKEN_CONTRACT_ID=CDIARUXKKITLLCZTTN3ELJF6YCCMYUJXDJB2AZAHLL2YOYNWHG6IFU4K
```

### Start

```bash
# Terminal 1 — backend
npm run dev:backend

# Terminal 2 — frontend
npm run dev:frontend
```

Open [http://localhost:3000](http://localhost:3000).

### Build contracts

```bash
cd contracts
stellar contract build
```

### Run smoke tests

```bash
npm run smoke:backend
```

---

## 📁 Project Structure

```
grow2stellar/
├── .github/workflows/ci.yml      # CI/CD pipeline
├── contracts/
│   ├── escrow/src/lib.rs          # Escrow contract (inter-contract calls, events)
│   └── token/src/lib.rs           # Custom G2S reward token (SEP-41)
├── backend/
│   └── src/
│       ├── services/questService.js   # Real Soroban RPC payout
│       ├── services/walletAuthService.js
│       └── config/env.js              # Contract IDs + Stellar config
├── frontend/
│   └── app/
│       ├── components/
│       │   ├── Header.jsx         # Sticky header + mobile hamburger
│       │   ├── Footer.jsx         # Dark footer with contract addresses
│       │   └── Sidebar.jsx        # Desktop sidebar + mobile bottom nav
│       ├── marketplace/           # Public campaign browser
│       ├── organizer/             # Organizer portal
│       └── ambassador/            # Ambassador hub
└── docs/
    └── architecture.md
```

---

## 📝 Commit History

This repository contains 10+ meaningful commits:

1. `feat: initial project scaffold (Next.js + Express + Soroban)`
2. `feat: SEP-10 wallet auth flow (nonce + verify)`
3. `feat: campaign creation and ambassador applications`
4. `feat: referral links and off-chain click tracking`
5. `feat: quest submissions and organizer review`
6. `feat: soroban escrow contract with deposit and payout`
7. `feat: inter-contract calls + custom G2S token contract`
8. `feat: CI/CD pipeline (GitHub Actions + Vercel deploy)`
9. `feat: mobile responsive frontend (bottom nav + hamburger header)`
10. `feat: deploy Soroban contracts to testnet + real payment via Soroban RPC`
11. `docs: complete README with contract addresses, screenshots, and live URL`

---

## 🏗️ Architecture

See [docs/architecture.md](docs/architecture.md) for the full hybrid Web2/Web3 architecture.

---

## License

MIT

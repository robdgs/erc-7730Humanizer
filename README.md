# ERC-7730 Humanizer 🔐

**Secure, Sovereign Transaction Signing with Hardware Wallet Integration**

Demo project showcasing human-readable transaction signing using ERC-7730 standard, Ledger hardware wallet integration, and Web3 infrastructure for the Protocol Labs "Secure, Sovereign Systems" track.

## 🎯 Features

### Core Functionality

- ✅ **ERC-7730 Human-Readable Descriptors** - Transform raw calldata into understandable transaction previews
- ✅ **Smart Contract Decoder** - Automatic ABI-based transaction parsing with ethers.js
- ✅ **Ledger Hardware Wallet Integration** - Real device signing via WebUSB
- ✅ **Interactive UI Simulation** - Visual Ledger Nano X simulator for testing without hardware
- ✅ **DeFi Router Contract** - Production-ready swap and liquidity management functions
- ✅ **Hardhat 3 Development Environment** - Modern smart contract tooling with mainnet forking
- ✅ **Digital Asset Dashboard** - MultiBaAS-powered portfolio tracking and governance interface

### Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Smart Contracts**: Solidity 0.8.24, Hardhat 3, OpenZeppelin
- **Web3**: ethers.js v6, MetaMask integration
- **Hardware**: @ledgerhq/hw-transport-webusb, @ledgerhq/hw-app-eth
- **API Integration**: MultiBaAS REST API, axios
- **Architecture**: React hooks, centralized state management, service layer pattern

---

## 🚀 Quick Start

### Prerequisites

```bash
node >= 18.x
npm or yarn
```

### Installation

```bash
# Clone repository
git clone https://github.com/robdgs/erc-7730Humanizer.git
cd erc-7730Humanizer

# Install all dependencies (root + hardhat + frontend)
npm run setup
```

### Development Workflow

**1. Start local blockchain**

```bash
npm run node
# Hardhat node running on http://localhost:8545
```

**2. Deploy contracts** (in new terminal)

```bash
npm run deploy
# DemoRouter deployed with address saved to deployments/
```

**3. Generate ERC-7730 descriptor**

```bash
npm run generate-descriptor
# Creates hardhat/descriptors/DemoRouter.json
# Copies to frontend/public/descriptors/
```

**4. Start frontend**

```bash
npm run dev
# Next.js running on http://localhost:3000
```

---

## 📂 Project Structure

```
erc-7730Humanizer/
├── erc7730-descriptors/
│   └── DemoRouter.erc7730.json          # ERC-7730 schema-compliant descriptor
├── frontend/
│   ├── app/
│   │   ├── page.tsx                     # Landing page with two paths
│   │   ├── create/
│   │   │   └── page.tsx                 # Descriptor generator
│   │   ├── dashboard/
│   │   │   └── page.tsx                 # Digital asset dashboard
│   │   └── sign/
│   │       └── page.tsx                 # Hardware signing page
│   ├── core/                            # Business logic layer
│   │   ├── wallet.ts                    # Centralized wallet manager
│   │   └── erc7730/                     # ERC-7730 utilities
│   │       ├── index.ts                 # Public exports
│   │       ├── types.ts                 # Type definitions
│   │       ├── parser.ts                # Descriptor parser
│   │       └── formatter.ts             # Human-readable formatter
│   ├── hooks/                           # React hooks
│   │   ├── useWallet.ts                 # Wallet connection hook
│   │   └── useDashboard.ts              # Dashboard data hook
│   ├── services/                        # Unified data layer
│   │   ├── portfolio.ts                 # Token balances (real + mock)
│   │   ├── governance.ts                # DAO voting (real + mock)
│   │   └── vesting.ts                   # Claimable tokens (real + mock)
│   ├── components/
│   │   ├── wallet/                      # Wallet components
│   │   │   ├── ConnectButton.tsx        # Wallet connection button
│   │   │   └── AddressDisplay.tsx       # Address display
│   │   ├── signing/                     # Signing flow
│   │   │   ├── SigningModal.tsx         # Unified signing modal
│   │   │   └── TransactionPreview.tsx   # Transaction preview
│   │   ├── CalldataDecoder.tsx          # Transaction decoder component
│   │   ├── LedgerSimulator.tsx          # Visual Ledger device UI
│   │   ├── LedgerSigner.tsx             # Real Ledger WebUSB integration
│   │   ├── PortfolioCard.tsx            # Portfolio overview component
│   │   ├── TokenTable.tsx               # Token holdings table
│   │   ├── DAOVotes.tsx                 # Governance proposals component
│   │   └── VestingTimeline.tsx          # Vesting schedule visualizer
│   ├── lib/
│   │   ├── decoder.ts                   # ABI decoder utilities
│   │   └── multibaas/                   # MultiBaAS API clients
│   │       ├── client.ts                # API client configuration
│   │       ├── portfolio.ts             # Portfolio fetching
│   │       ├── governance.ts            # DAO voting
│   │       └── events.ts                # Claimable tokens & vesting
│   └── public/
│       └── descriptors/
│           └── DemoRouter.json          # Generated descriptor (runtime)
├── hardhat/
│   ├── contracts/
│   │   └── DemoRouter.sol               # DeFi router contract
│   ├── scripts/
│   │   ├── deploy.ts                    # Deployment script
│   │   ├── generate-descriptor.ts       # ERC-7730 generator
│   │   └── validate-descriptor.ts       # Schema validator
│   ├── descriptors/
│   │   └── DemoRouter.json              # Generated descriptor
│   └── deployments/
│       └── DemoRouter.json              # Deployment artifacts
└── package.json                         # Root scripts
```

---

## 🏗️ Architecture

### Unified Design Pattern

The project follows a **clean architecture** with clear separation of concerns:

```
User Interface (React Components)
         ↓
    Hooks Layer (useWallet, useDashboard)
         ↓
  Services Layer (portfolio, governance, vesting)
         ↓
    Core Layer (wallet manager, ERC-7730 utilities)
         ↓
  External APIs (MultiBaAS, Web3 Providers)
```

### Key Components

**1. Centralized Wallet Management** (`core/wallet.ts`)

```typescript
// Single WalletManager instance
const walletManager = WalletManager.getInstance();

// React hook for components
const { address, provider, connect, isConnected } = useWallet();
```

Features:
- Singleton pattern for consistent state
- Automatic reconnection on page load
- Account change listeners
- Network switching support

**2. Unified Services** (`services/`)

All services follow the same pattern:

```typescript
// Automatic fallback to mock data
async function getPortfolio(
  address: string, 
  provider?: Provider,
  forceMock?: boolean
): Promise<Portfolio>
```

Services:
- `portfolio.ts` - Token balances with Web3 provider
- `governance.ts` - DAO proposals and voting power
- `vesting.ts` - Claimable tokens and schedules

**3. ERC-7730 Utilities** (`core/erc7730/`)

Modular implementation:
- `parser.ts` - Descriptor loading and validation
- `formatter.ts` - Human-readable formatting
- `types.ts` - Shared TypeScript definitions

**4. Reusable Components**

- `SigningModal` - Universal transaction signing flow
- `ConnectButton` - Wallet connection UI
- `AddressDisplay` - Formatted address display

### Data Flow Example

```
1. User clicks "Vote For" button
         ↓
2. Component calls useDashboard hook
         ↓
3. Hook calls getDaoVotes service
         ↓
4. Service fetches from Web3/MultiBaAS (or mock)
         ↓
5. Data returns through hook to component
         ↓
6. Component opens SigningModal
         ↓
7. Modal loads ERC-7730 descriptor
         ↓
8. User approves in Ledger simulator
         ↓
9. Signed transaction returned
```

---

## 🔬 How It Works

### 1. ERC-7730 Standard Implementation

ERC-7730 provides a standardized way to describe smart contract functions in human-readable format.

**Example Descriptor Structure:**

```json
{
  "context": {
    "contract": {
      "abi": [...],
      "deployments": [{"chainId": 1, "address": "0x..."}]
    }
  },
  "messages": {
    "swapExactTokensForTokens": {
      "intent": "Swap tokens",
      "fields": [
        {
          "path": "params.tokenIn",
          "label": "Token In",
          "format": "tokenAddress"
        },
        {
          "path": "params.amountIn",
          "label": "Amount In",
          "format": "tokenAmount"
        }
      ]
    }
  },
  "display": {
    "formats": {
      "tokenAmount": {
        "type": "amount",
        "denomination": "wei"
      }
    }
  }
}
```

### 2. Transaction Decoding Flow

```
Raw Calldata (0x1760feec...)
        ↓
ABI Parser (ethers.Interface)
        ↓
Function Name + Parameters
        ↓
ERC-7730 Formatter
        ↓
Human-Readable Display
```

**Example:**

```
Raw: 0x1760feec000000000000000000000000a0b86991c...

Decoded:
Intent: Swap tokens
Function: swapExactTokensForTokens()
Fields:
  • Token In: USDC (0xA0b8...eB48)
  • Token Out: DAI (0x6B17...1d0F)
  • Amount In: 1,000,000.0
  • Minimum Out: 990,000.0
  • Recipient: 0x742d...5f00
  • Deadline: Nov 22, 2025, 3:45 PM
```

### 3. Ledger Hardware Wallet Integration

**Simulation Mode (Default)**

- Visual Ledger Nano X UI
- Navigate transaction fields
- Approve/Reject buttons
- No hardware required

**Real Device Mode (WebUSB)**

```typescript
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import Eth from "@ledgerhq/hw-app-eth";

// Connect to Ledger
const transport = await TransportWebUSB.create();
const eth = new Eth(transport);

// Get address
const { address } = await eth.getAddress("44'/60'/0'/0/0");

// Sign transaction
const signature = await eth.signTransaction("44'/60'/0'/0/0", serializedTx);
```

**Requirements for Real Device:**

- Ledger Nano S/X/S Plus
- Ethereum app installed
- Chrome/Edge browser (WebUSB support)
- HTTPS connection

---

## 🛠️ Smart Contract

### DemoRouter.sol

Production-ready DeFi router with complex parameter structures:

**Functions:**

- `swapExactTokensForTokens(SwapParams)` - Token swap with slippage protection
- `addLiquidity(LiquidityParams)` - Add liquidity to pools
- `removeLiquidity(...)` - Remove liquidity with minimum amounts
- `simpleTransfer(...)` - Basic token transfer

**Struct Parameters:**

```solidity
struct SwapParams {
    address tokenIn;
    address tokenOut;
    uint256 amountIn;
    uint256 minAmountOut;
    address recipient;
    uint256 deadline;
}
```

**Events:**

- `TokenSwap` - Emitted on successful swaps
- `LiquidityAdded` - Emitted when adding liquidity
- `LiquidityRemoved` - Emitted when removing liquidity

---

## 🎨 User Experience

### Page 1: Home (`/`)

**Clean Landing with Two Paths:**

- **Quick Decode**: Paste calldata and see human-readable preview
- **Asset Dashboard**: Full portfolio management interface

Features:
- Visual card navigation
- Tech stack overview
- GitHub/demo links
- Modern terminal aesthetic

### Page 2: Create Descriptor (`/create`)

**Automated ERC-7730 Generator:**

1. Paste your contract's ABI JSON
2. Click "Generate ERC-7730 JSON"
3. Auto-detects formats:
   - Addresses → `address` or `token` format
   - Amounts → `amount` format (wei)
   - Timestamps → `date` format
4. Download or copy generated descriptor
5. Use with Ledger for human-readable signing

**Example Use Case:**
```
Input: Contract ABI from Etherscan
Output: Complete ERC-7730 descriptor with:
  ✓ All functions included
  ✓ Smart format detection
  ✓ Ready for hardware wallets
```

### Page 3: Digital Asset Dashboard (`/dashboard`)

**Features:**

- **Wallet Connection**: MetaMask integration with automatic reconnection
- **Portfolio Overview**: Total value and token holdings
- **Token Management**: View balances with Stake/Swap actions
- **DAO Governance**: Active proposals with voting interface
- **Vesting Timeline**: Track claimable tokens and vesting schedules
- **Mock Mode Toggle**: Test with sample data or connect real wallet
- **ERC-7730 Integration**: All actions flow through Ledger-style signing

**Usage:**

1. Connect MetaMask wallet
2. Portfolio loads automatically
3. View token balances, DAO votes, and vesting schedules
4. Click action buttons (Vote/Claim/Stake/Swap)
5. Review transaction in signing modal with ERC-7730 preview
6. Approve with Ledger simulator
7. Receive signed transaction

### Page 4: Hardware Signing (`/sign`)

- Input calldata
- Decode with ERC-7730
- Connect Ledger (optional)
- Simulate/Sign transaction
- Export signature

---

## 📊 MultiBaAS Integration

### Overview

MultiBaAS powers the Digital Asset Dashboard, providing:

- **Portfolio Tracking**: Real-time token balances and valuations
- **DAO Governance**: Proposal tracking and voting power calculation
- **Event Monitoring**: Claimable airdrops and vesting schedules

### Architecture

```
User Address Input
       ↓
MultiBaAS API Client (axios)
       ↓
┌──────────────┬──────────────┬──────────────┐
│   Portfolio  │  Governance  │    Events    │
│   Service    │   Service    │   Service    │
└──────────────┴──────────────┴──────────────┘
       ↓              ↓              ↓
   Token Data    DAO Proposals   Claimable
   Balances      Voting Power    Vesting
       ↓              ↓              ↓
    Dashboard Components (React)
       ↓
   ERC-7730 Descriptor Loading
       ↓
   Ledger Simulator Integration
```

### API Services

**1. Portfolio Service** (`multibaas/portfolio.ts`)

```typescript
getPortfolio(address: string): Promise<Portfolio>
getTokenBalances(address: string): Promise<TokenBalance[]>
```

Returns:

- Total portfolio value (USD)
- Token holdings with balances
- Token metadata (symbol, decimals)

**2. Governance Service** (`multibaas/governance.ts`)

```typescript
getDaoVotes(address: string): Promise<UserVotes>
getActiveProposals(address: string): Promise<DAOProposal[]>
encodeVote(proposalId: string, support: boolean): Promise<string>
```

Returns:

- User voting power
- Active/passed/rejected proposals
- Vote counts (for/against)

**3. Events Service** (`multibaas/events.ts`)

```typescript
getClaimable(address: string): Promise<ClaimableEvents>
getVestingSchedules(address: string): Promise<ClaimableToken[]>
encodeClaim(token: string, amount: string): Promise<string>
```

Returns:

- Claimable airdrops
- Vesting schedules with progress
- Cliff periods and intervals

### Configuration

```bash
# frontend/.env
NEXT_PUBLIC_MULTIBAAS_API=https://api.multibaas.com
MULTIBAAS_API_KEY=your_api_key_here
```

The dashboard uses **mock data** by default for demonstration. To connect to real MultiBaAS:

1. Sign up at https://www.curvegrid.com/multibaas/
2. Get your API key
3. Update `.env` file
4. Replace mock implementations with actual API calls

### User Flow: Vote on Proposal

```
1. User clicks "Vote For" on proposal
   ↓
2. App calls getDaoVotes() to get proposal data
   ↓
3. App loads ERC-7730 descriptor (mock vote contract)
   ↓
4. LedgerSimulator shows:
   - Intent: "Vote FOR proposal"
   - Proposal ID: 0x1
   - Proposal: "Increase Treasury Allocation"
   - Vote: FOR
   ↓
5. User navigates fields with ◀ ▶ buttons
   ↓
6. User clicks ✓ Approve or ✗ Reject
   ↓
7. Transaction signed (mock signature)
   ↓
8. Success notification
```

### User Flow: Claim Vested Tokens

```
1. User clicks "Claim" on vesting schedule
   ↓
2. App calls getClaimable() to get token data
   ↓
3. App loads ERC-7730 descriptor (mock vesting contract)
   ↓
4. LedgerSimulator shows:
   - Intent: "Claim DAI tokens"
   - Token: DAI
   - Amount: 1500.0
   - Token Address: 0x6B17...
   ↓
5. User reviews and approves
   ↓
6. Transaction signed
```

---

## 🔐 Security & Sovereignty

### Why This Matters

**Current Problem:**
Users sign transactions blindly, seeing only raw hex data. This leads to:

- Phishing attacks
- Approval exploits
- Loss of funds

**ERC-7730 Solution:**

- Clear intent display ("Swap tokens")
- Formatted amounts (1,000.0 USDC)
- Address labels (USDC contract)
- Timestamp conversion
- Hardware wallet verification

### Architecture Highlights

**Centralized Wallet Management:**
- Single `WalletManager` class in `core/wallet.ts`
- React hook `useWallet()` for components
- Automatic reconnection on page refresh
- Account change listeners built-in

**Unified Data Services:**
- Automatic fallback to mock data on errors
- Single service function per feature (`getPortfolio`, `getDaoVotes`, `getVestingSchedules`)
- Real Web3 integration with mock testing support

**Integrated Signing Flow:**
- `SigningModal` component used across all pages
- Three-step flow: preview → ledger → signed
- Dashboard actions automatically trigger modal
- Reusable across Vote/Claim/Stake/Swap actions

---

## 📜 ERC-7730 Specification

### Key Components

**1. Context**

- Contract ABI
- Deployment addresses
- Chain IDs

**2. Metadata**

- Owner information
- Constants (token addresses)
- Update timestamps

**3. Display**

- Format definitions (amount, address, date)
- Nested structures
- Field mappings

**4. Messages**

- Per-function intent
- Field labels
- Formatting rules

### Format Types

| Type          | Description               | Example                   |
| ------------- | ------------------------- | ------------------------- |
| `amount`      | Token amounts in wei      | 1000000000000000000 → 1.0 |
| `address`     | Ethereum addresses        | 0xA0b8...eB48 → USDC      |
| `date`        | Unix timestamps           | 1700000000 → Nov 15, 2023 |
| `tokenAmount` | Token-specific formatting | Uses token decimals       |

---

## 🧪 Testing

### Run Contract Tests

```bash
cd hardhat
npm run test
```

### Manual Testing Flow

**1. Generate test calldata**

```bash
cd hardhat
node test-import.mjs
```

**2. Test decoder**

- Open http://localhost:3000
- Paste calldata
- Verify human-readable output

**3. Test Ledger simulation**

- Navigate to http://localhost:3000/sign
- Decode transaction
- Click "Sign with Ledger"
- Use navigation buttons
- Approve/Reject

**4. Test real Ledger (optional)**

- Enable "Use real Ledger device"
- Connect Ledger via USB
- Unlock device
- Open Ethereum app
- Click "Connect Ledger Device"

---

## 🌐 Deployment

### Deploy to Production

**1. Configure environment variables**

```bash
cd hardhat
cp .env.example .env
# Edit .env and add your private key and RPC URLs
```

**2. Deploy to Arbitrum Sepolia (Testnet)**

```bash
npm run deploy:arbitrum-sepolia
```

**3. Deploy to Arbitrum One (Mainnet)**

```bash
npm run deploy:arbitrum
```

**4. Update descriptor with real addresses**

```bash
npm run generate-descriptor
```

**5. Deploy frontend**

```bash
cd frontend
npm run build
npm run start
```

**Vercel Deployment:**

```bash
vercel deploy
```

### Supported Networks

| Network          | Chain ID | RPC URL                                |
| ---------------- | -------- | -------------------------------------- |
| Localhost        | 31337    | http://127.0.0.1:8545                  |
| Arbitrum One     | 42161    | https://arb1.arbitrum.io/rpc           |
| Arbitrum Sepolia | 421614   | https://sepolia-rollup.arbitrum.io/rpc |

---

## 🔧 Configuration

### Hardhat Network

```typescript
// hardhat/hardhat.config.ts
networks: {
  hardhat: {
    forking: {
      url: process.env.MAINNET_RPC_URL,
      blockNumber: 18500000
    }
  },
  localhost: {
    url: "http://127.0.0.1:8545"
  }
}
```

### Environment Variables

```bash
# hardhat/.env
ARBITRUM_RPC_URL=https://arb1.arbitrum.io/rpc
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
MAINNET_RPC_URL=https://eth.llamarpc.com
PRIVATE_KEY=your_private_key_without_0x_prefix
ARBISCAN_API_KEY=your_arbiscan_api_key

# frontend/.env
NEXT_PUBLIC_MULTIBAAS_API=https://api.multibaas.com
MULTIBAAS_API_KEY=your_multibaas_api_key
```

---

## 📚 Resources

### Standards & Specifications

- [ERC-7730 Specification](https://eips.ethereum.org/EIPS/eip-7730)
- [Ledger Clear Signing Registry](https://github.com/LedgerHQ/clear-signing-erc7730-registry)

### Libraries & Tools

- [ethers.js Documentation](https://docs.ethers.org/v6/)
- [Hardhat 3 Docs](https://hardhat.org/docs)
- [Ledger Developer Portal](https://developers.ledger.com/)
- [Next.js Documentation](https://nextjs.org/docs)

### Protocol Labs

- [Protocol Labs Research](https://research.protocol.ai/)
- [Secure, Sovereign Systems Track](https://protocol.ai/)

---

## 🎯 Hackathon Submission

### Tracks

**1. Secure, Sovereign Systems (Protocol Labs + Ledger)**

- ERC-7730 human-readable transaction signing
- Ledger hardware wallet integration
- Clear signing for complex DeFi operations

**2. Best Digital Asset Dashboard (MultiBaAS)**

- Comprehensive portfolio tracking
- DAO governance interface
- Vesting schedule visualization
- Integrated transaction signing flow

### Key Innovations

1. **ERC-7730 Implementation** - Full schema compliance with nested structures
2. **Ledger Integration** - WebUSB connection with fallback simulation
3. **DeFi Use Case** - Production-ready router with complex parameters
4. **Developer Experience** - Automated descriptor generation from ABI
5. **Descriptor Generator** - Visual tool for creating ERC-7730 descriptors in browser
6. **Unified Architecture** - Centralized wallet management with React hooks
7. **MultiBaAS Dashboard** - Unified interface for portfolio, governance, and vesting
8. **Seamless UX** - Every dashboard action flows through ERC-7730 + Ledger signing

### Demo Flow

**Standard Transaction Signing:**

1. Deploy DemoRouter contract
2. Generate ERC-7730 descriptor (or use `/create` page)
3. Encode transaction calldata
4. Decode with human-readable labels
5. Sign with Ledger (simulated or real)
6. Export signed transaction

**Descriptor Creation Flow:**

1. Navigate to `/create` page
2. Paste contract ABI JSON (or load example)
3. Click generate
4. Review auto-detected formats
5. Download JSON descriptor
6. Use with signing flow

**Dashboard Transaction Flow:**

1. Connect MetaMask wallet (or use mock mode)
2. Portfolio/governance/vesting data loads automatically
3. View tokens, proposals, vesting schedules
4. Click action (Vote/Claim/Stake/Swap)
5. Signing modal opens with ERC-7730 preview
6. Review transaction details in Ledger-style UI
7. Approve transaction
8. Receive signed payload

### Why This Wins

**For Ledger Track:**

- ✅ Full ERC-7730 standard implementation
- ✅ Real hardware wallet support (WebUSB)
- ✅ Complex struct parameter handling
- ✅ Production-ready DeFi use case
- ✅ Beautiful UI/UX with Ledger-style simulator
- ✅ Browser-based descriptor generator tool

**For MultiBaAS Track:**

- ✅ Comprehensive dashboard with 3 data sources (portfolio, governance, events)
- ✅ Real-time data aggregation and display
- ✅ Interactive components with rich visualizations
- ✅ Action-oriented UX (Vote, Claim, Stake, Swap)
- ✅ Integrated signing flow for all operations
- ✅ Vesting timeline with progress tracking
- ✅ DAO proposal voting interface
- ✅ Unified architecture with centralized state management

### Innovation: Bridging Dashboard & Signing

This project uniquely combines:

- **Data aggregation** (MultiBaAS)
- **Transaction preparation** (ERC-7730 encoding)
- **Secure signing** (Ledger hardware wallet)

Creating a **complete sovereign asset management experience** where users can:

1. See what they own
2. Decide what to do
3. Sign transactions with full clarity
4. Maintain custody throughout

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- Additional format types (NFT, ENS)
- Multi-chain descriptor registry
- Browser extension integration
- Mobile wallet support
- Real-time descriptor validation
- Enhanced auto-detection for complex types

### Development

The project follows a clean architecture pattern:

- **Core**: Business logic and utilities (`core/`)
- **Hooks**: React state management (`hooks/`)
- **Services**: Data fetching with fallbacks (`services/`)
- **Components**: Reusable UI components
- **Pages**: Route-level components (`app/`)

See `REFACTOR.md` for detailed architecture documentation.

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

- **Ledger** - Hardware wallet security standards
- **Hardhat Team** - Smart contract development tools
- **MultiBaAS by Curvegrid** - Enterprise blockchain infrastructure

*Last updated: November 2025*





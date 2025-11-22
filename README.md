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

### Technical Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Smart Contracts**: Solidity 0.8.24, Hardhat 3, OpenZeppelin
- **Web3**: ethers.js v6
- **Hardware**: @ledgerhq/hw-transport-webusb, @ledgerhq/hw-app-eth

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
│   │   ├── page.tsx                     # Home page with decoder
│   │   └── sign/
│   │       └── page.tsx                 # Hardware signing page
│   ├── components/
│   │   ├── CalldataDecoder.tsx          # Transaction decoder component
│   │   ├── LedgerSimulator.tsx          # Visual Ledger device UI
│   │   └── LedgerSigner.tsx             # Real Ledger WebUSB integration
│   ├── lib/
│   │   ├── decoder.ts                   # ABI decoder utilities
│   │   ├── erc7730.ts                   # ERC-7730 parser
│   │   └── erc7730-formatter.ts         # Human-readable formatter
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

### Page 1: Transaction Decoder (`/`)

- Paste calldata
- View human-readable preview
- Copy formatted output
- Example transactions included

### Page 2: Hardware Signing (`/sign`)

- Input calldata
- Decode with ERC-7730
- Connect Ledger (optional)
- Simulate/Sign transaction
- Export signature

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

### Track

**Secure, Sovereign Systems (Protocol Labs + Ledger)**

### Key Innovations

1. **ERC-7730 Implementation** - Full schema compliance with nested structures
2. **Ledger Integration** - WebUSB connection with fallback simulation
3. **DeFi Use Case** - Production-ready router with complex parameters
4. **Developer Experience** - Automated descriptor generation from ABI

### Demo Flow

1. Deploy DemoRouter contract
2. Generate ERC-7730 descriptor
3. Encode transaction calldata
4. Decode with human-readable labels
5. Sign with Ledger (simulated or real)
6. Export signed transaction

---

## 🤝 Contributing

Contributions welcome! Areas for improvement:

- Additional format types (NFT, ENS)
- Multi-chain descriptor registry
- Browser extension integration
- Mobile wallet support

---

## 📄 License

MIT License - see LICENSE file

---

## 🙏 Acknowledgments

- **Ledger** - Hardware wallet security standards
- **Ethereum Foundation** - ERC-7730 specification
- **Hardhat Team** - Smart contract development tools
- **Vercel** - Next.js framework and deployment

---

## 📞 Contact

**GitHub**: [@robdgs](https://github.com/robdgs)
**Project**: [erc-7730Humanizer](https://github.com/robdgs/erc-7730Humanizer)

---

**Built with ❤️ for Ledger**

# QuickKash - Decentralized Tip Jars on Algorand

![QuickKash Logo](https://img.shields.io/badge/QuickKash-Algorand%20Tip%20Jars-00D4AA?style=for-the-badge&logo=algorand)

**QuickKash** is a decentralized application that enables creators to receive ALGO tips directly to their wallets while rewarding supporters with premium content. Built on the Algorand blockchain with a focus on privacy, security, and creator ownership.

## 🌟 Features

### Core Features
- **🔗 Decentralized**: No central authority, built on Algorand blockchain
- **💰 Direct Payments**: Tips go directly to creator wallets (98% to creator, 2% platform fee)
- **🎁 Premium Content**: Unlock exclusive content for tips ≥ 10 ALGO
- **📱 Wallet Integration**: Support for Pera Wallet and MyAlgo
- **🔒 Privacy First**: No logins, no tracking, no personal data collection
- **📊 Real-time Analytics**: Track tips, supporters, and engagement

### Pro Features
- **🎨 Custom Branding**: Personalized colors, fonts, and logos
- **👑 Pro Badge**: Special recognition for Pro creators
- **📈 Advanced Analytics**: Detailed insights and reporting
- **🛠️ Premium Support**: Priority customer support

### Technical Features
- **⚡ Instant Transactions**: Fast Algorand blockchain confirmations
- **🔐 Secure**: Non-custodial, wallet-based authentication
- **📱 Responsive**: Works on desktop and mobile devices
- **🌐 Shareable**: QR codes and social media integration
- **💾 Persistent**: Data stored in Supabase with RLS security

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Algorand wallet (Pera or MyAlgo)
- Nodely API access (for Algorand node)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/quickkash-tip-jar.git
   cd quickkash-tip-jar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   
   # Algorand Configuration
   VITE_ALGOD_TOKEN=your_nodely_api_token
   
   # QuickKash Platform Configuration
   VITE_DEV_FEE_ADDRESS=your_platform_wallet_address
   
   # RevenueCat Configuration (Optional)
   VITE_REVENUECAT_PUBLIC_API_KEY=your_revenuecat_key
   ```

4. **Set up Supabase database**
   ```bash
   # Run the migration files in supabase/migrations/
   # This creates the necessary tables and RLS policies
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons

### Blockchain Integration
- **Algorand SDK** for blockchain interactions
- **Pera Wallet Connect** for wallet integration
- **MyAlgo Connect** for alternative wallet support
- **Nodely API** for Algorand node access

### Backend Services
- **Supabase** for database and real-time features
- **Row Level Security (RLS)** for data protection
- **RevenueCat** for subscription management (optional)

### Key Components

```
src/
├── components/           # React components
│   ├── WalletConnector.tsx      # Homepage and wallet connection
│   ├── CreatorDashboard.tsx     # Creator management interface
│   ├── CreatorProfile.tsx       # Public creator profiles
│   ├── TipButton.tsx           # Tip functionality
│   ├── ProBrandingCustomizer.tsx # Pro branding features
│   └── PremiumContentManager.tsx # Content management
├── utils/               # Utility functions
│   ├── walletConnection.ts      # Wallet integration
│   ├── algorandTransactions.ts  # Blockchain transactions
│   ├── supabase.ts             # Database operations
│   └── checkProStatus.ts       # Pro feature access
└── pages/               # Route components
```

## 📊 Database Schema

### Tables

#### `creators`
- Creator profiles and settings
- Pro status and subscription info
- Custom branding configuration

#### `tips`
- Transaction records
- Tip amounts and timestamps
- Premium access tracking

#### `premium_content`
- Exclusive content for supporters
- Content types: video, PDF, download, link
- Minimum tip requirements

### Security
- **Row Level Security (RLS)** enabled on all tables
- **Wallet-based authentication** (no passwords)
- **Public read access** for creator profiles
- **Creator-only write access** for their own data

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_ALGOD_TOKEN` | Nodely API token | ✅ |
| `VITE_DEV_FEE_ADDRESS` | Platform fee wallet address | ✅ |
| `VITE_REVENUECAT_PUBLIC_API_KEY` | RevenueCat API key | ❌ |

### Supabase Setup

1. Create a new Supabase project
2. Run the migration files in `supabase/migrations/`
3. Enable Row Level Security on all tables
4. Configure storage bucket for creator logos (optional)

### Algorand Setup

1. Get API access from [Nodely](https://nodely.io)
2. Set up your platform wallet for receiving fees
3. Configure mainnet/testnet endpoints as needed

## 🎯 Usage

### For Creators

1. **Connect Wallet**: Use Pera or MyAlgo wallet
2. **Create Profile**: Set up name, bio, and avatar
3. **Add Premium Content**: Upload exclusive content for supporters
4. **Customize Branding** (Pro): Personalize colors and fonts
5. **Share Your Link**: Promote your tip jar URL

### For Supporters

1. **Visit Creator Profile**: Navigate to `/creator/{wallet_address}`
2. **Connect Wallet**: Connect your Algorand wallet
3. **Send Tip**: Choose amount and send ALGO tip
4. **Unlock Content**: Tips ≥ 10 ALGO unlock premium content

### URL Structure

- `/` - Homepage and wallet connection
- `/creator/{wallet}` - Public creator profile
- `/dashboard` - Creator management (requires wallet)
- `/demo` - TipButton component demo

## 🔐 Security

### Wallet Security
- **Non-custodial**: Users control their private keys
- **No key storage**: Private keys never leave user's wallet
- **Secure transactions**: All transactions signed locally

### Data Security
- **Row Level Security**: Database-level access control
- **No personal data**: Minimal data collection
- **Encrypted connections**: HTTPS and WSS only

### Smart Contract Security
- **Grouped transactions**: Atomic tip + fee transactions
- **Validation**: Amount and address validation
- **Error handling**: Graceful failure recovery

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy automatically on push to main branch

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` and follow prompts
3. Set environment variables in Vercel dashboard

## 🧪 Testing

### Run Tests
```bash
npm run test
```

### Test Wallet Integration
1. Use Algorand TestNet for development
2. Get test ALGO from [TestNet Dispenser](https://testnet.algoexplorer.io/dispenser)
3. Test with small amounts first

### Test Components
```bash
# Visit the demo page
http://localhost:5173/demo
```

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit with conventional commits: `git commit -m "feat: add amazing feature"`
5. Push to your branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Configured for React and TypeScript
- **Prettier**: Code formatting (run `npm run format`)
- **Conventional Commits**: Use conventional commit messages

### Testing Guidelines

- Test all wallet integrations
- Verify transaction flows
- Check responsive design
- Test Pro feature access control

## 📈 Roadmap

### Phase 1 (Current)
- ✅ Basic tip jar functionality
- ✅ Premium content system
- ✅ Pro branding features
- ✅ Creator dashboard

### Phase 2 (Next)
- 🔄 Mobile app (React Native)
- 🔄 Advanced analytics dashboard
- 🔄 Creator collaboration features
- 🔄 NFT integration

### Phase 3 (Future)
- 📋 Multi-chain support
- 📋 Creator marketplace
- 📋 Subscription tiers
- 📋 API for third-party integrations

## 🐛 Troubleshooting

### Common Issues

**Wallet Connection Fails**
- Ensure wallet extension is installed and unlocked
- Check network connection
- Try refreshing the page

**Transaction Fails**
- Verify sufficient ALGO balance
- Check wallet is connected to correct network
- Ensure minimum transaction amount (0.001 ALGO)

**Premium Content Not Unlocking**
- Verify tip amount is ≥ 10 ALGO
- Check transaction was confirmed
- Refresh the page

**Pro Features Not Available**
- Contact support to enable Pro status
- Verify wallet address is correct
- Check subscription status in dashboard

### Getting Help

- 📧 Email: support@quickkash.app
- 💬 Discord: [QuickKash Community](https://discord.gg/quickkash)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/quickkash-tip-jar/issues)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Algorand Foundation** for the amazing blockchain platform
- **Supabase** for the excellent backend-as-a-service
- **Pera Wallet** and **MyAlgo** for wallet integration
- **Nodely** for reliable Algorand API access
- **The Creator Economy** for inspiring this project

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/your-username/quickkash-tip-jar?style=social)
![GitHub forks](https://img.shields.io/github/forks/your-username/quickkash-tip-jar?style=social)
![GitHub issues](https://img.shields.io/github/issues/your-username/quickkash-tip-jar)
![GitHub license](https://img.shields.io/github/license/your-username/quickkash-tip-jar)

---

**Built with ❤️ for the creator economy on Algorand**

*QuickKash - Empowering creators with decentralized monetization*
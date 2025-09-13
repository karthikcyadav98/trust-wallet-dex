# Trust Wallet DEX Integration

A production-ready React application showcasing comprehensive Trust Wallet integration for decentralized exchanges (DEX). Built with TypeScript, React hooks, and ethers.js for robust blockchain interactions.

## 🚀 Features

- **Trust Wallet Detection**: Automatically detects Trust Wallet browser extension
- **Secure Connection**: Direct integration with Trust Wallet's injected provider
- **Multi-Network Support**: Supports Ethereum, BSC, and Polygon networks
- **Real-time Balance**: Display and refresh native token balances
- **Network Switching**: Seamless network switching with user confirmation
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Responsive Design**: Mobile-first design with dark mode support
- **TypeScript**: Full TypeScript support for type safety
- **Extensible Architecture**: Easy to extend for additional wallet providers

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── TrustWalletConnect.tsx    # Main wallet connection component
│   └── TrustWalletConnect.css    # Component styles
├── contexts/
│   └── WalletContext.tsx         # Wallet state management
├── types/
│   └── wallet.ts                 # TypeScript type definitions
├── utils/
│   └── walletUtils.ts            # Utility functions for wallet operations
├── App.tsx                       # Main application component
├── App.css                       # Application styles
└── index.tsx                     # Application entry point
```

## 🔧 Usage

### Basic Implementation

```tsx
import { WalletProvider } from './contexts/WalletContext';
import TrustWalletConnect from './components/TrustWalletConnect';

function App() {
  const handleConnect = (account: string) => {
    console.log('Wallet connected:', account);
  };

  const handleDisconnect = () => {
    console.log('Wallet disconnected');
  };

  const handleError = (error: string) => {
    console.error('Wallet error:', error);
  };

  return (
    <WalletProvider>
      <TrustWalletConnect
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        onError={handleError}
        showBalance={true}
        showNetwork={true}
        autoConnect={false}
      />
    </WalletProvider>
  );
}
```

### Advanced Usage with Custom Hook

```tsx
import { useWallet } from './contexts/WalletContext';

function CustomWalletComponent() {
  const { 
    walletState, 
    connectWallet, 
    disconnectWallet, 
    switchNetwork,
    refreshBalance 
  } = useWallet();

  const handleSwitchToBSC = async () => {
    try {
      await switchNetwork(56); // BSC Chain ID
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  return (
    <div>
      {walletState.isConnected ? (
        <div>
          <p>Connected: {walletState.account}</p>
          <p>Network: {walletState.chainId}</p>
          <p>Balance: {walletState.balance}</p>
          <button onClick={handleSwitchToBSC}>Switch to BSC</button>
          <button onClick={refreshBalance}>Refresh Balance</button>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
```

## 🔌 Component Props

### TrustWalletConnect Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onConnect` | `(account: string) => void` | - | Callback fired when wallet connects |
| `onDisconnect` | `() => void` | - | Callback fired when wallet disconnects |
| `onError` | `(error: string) => void` | - | Callback fired when an error occurs |
| `className` | `string` | `''` | Additional CSS classes |
| `showBalance` | `boolean` | `true` | Show/hide balance display |
| `showNetwork` | `boolean` | `true` | Show/hide network selector |
| `autoConnect` | `boolean` | `false` | Automatically connect on load |

## 🌐 Supported Networks

| Network | Chain ID | Native Token |
|---------|----------|--------------|
| Ethereum Mainnet | 1 | ETH |
| Binance Smart Chain | 56 | BNB |
| Polygon | 137 | MATIC |

## Available Scripts

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## 🛠️ Utility Functions

### Address Utilities
- `shortenAddress(address, startLength, endLength)` - Format address for display
- `isValidAddress(address)` - Validate Ethereum address format

### Network Utilities
- `getNetworkById(chainId)` - Get network configuration by chain ID
- `switchNetwork(chainId)` - Switch to specified network

### Balance Utilities
- `formatBalance(balance, decimals, displayDecimals)` - Format balance for display
- `getBalance(address)` - Get account balance
- `refreshBalance()` - Refresh current balance

### Provider Utilities
- `isTrustWalletAvailable()` - Check if Trust Wallet is installed
- `getTrustWalletProvider()` - Get Trust Wallet provider instance
- `requestAccounts()` - Request account access

## 🔐 Security Features

- **No Private Key Handling**: Only interacts with wallet through standard APIs
- **User Confirmation**: All transactions require user approval in Trust Wallet
- **Input Validation**: Address and transaction validation before processing
- **Error Boundaries**: Comprehensive error handling and recovery
- **Secure Context**: Only works in secure (HTTPS) contexts

## 📱 Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

**Note**: Trust Wallet browser extension is required for full functionality.

## 🔄 Integration with Existing Projects

### 1. Copy Required Files
```bash
# Copy these files to your project:
src/components/TrustWalletConnect.tsx
src/components/TrustWalletConnect.css
src/contexts/WalletContext.tsx
src/types/wallet.ts
src/utils/walletUtils.ts
```

### 2. Install Dependencies
```bash
npm install ethers
```

### 3. Wrap Your App
```tsx
import { WalletProvider } from './contexts/WalletContext';

function App() {
  return (
    <WalletProvider>
      {/* Your existing app */}
    </WalletProvider>
  );
}
```

## 🐛 Troubleshooting

### Common Issues

**Trust Wallet not detected:**
- Ensure Trust Wallet browser extension is installed
- Refresh the page after installation
- Check that you're accessing the site via HTTPS

**Connection fails:**
- Check that Trust Wallet is unlocked
- Ensure you're on a supported network
- Clear browser cache and try again

**Balance not showing:**
- Verify you're connected to the correct network
- Click the refresh button to reload balance
- Check network connection

**Network switching fails:**
- Ensure the target network is supported
- Check that Trust Wallet has the network configured
- Approve the network switch in Trust Wallet

## 🔗 Useful Links

- [Trust Wallet Documentation](https://docs.trustwallet.com/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)

---

**Built with ❤️ for the Web3 community**

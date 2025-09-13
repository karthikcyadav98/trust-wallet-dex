import React from 'react';
import './App.css';
import { WalletProvider } from './contexts/WalletContext';
import TrustWalletConnect from './components/TrustWalletConnect';
import ActivityLog from './components/ActivityLog';

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
      <div className="App">
        <header className="App-header">
          <h1>Trust Wallet DEX Integration</h1>
          <p>Production-ready Trust Wallet connection for your DEX</p>
        </header>
        
        <main className="App-main">
          <div className="wallet-section">
            <h2>Connect Your Trust Wallet</h2>
            <TrustWalletConnect
              onConnect={handleConnect}
              onDisconnect={handleDisconnect}
              onError={handleError}
              showBalance={true}
              showNetwork={true}
              autoConnect={false}
              className="demo-wallet"
            />
          </div>

          {/* <div className="features-section">
            <h2>Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>🔒 Secure Connection</h3>
                <p>Direct integration with Trust Wallet browser extension</p>
              </div>
              <div className="feature-card">
                <h3>🌐 Multi-Network</h3>
                <p>Support for Ethereum, BSC, and Polygon networks</p>
              </div>
              <div className="feature-card">
                <h3>💰 Balance Display</h3>
                <p>Real-time native token balance with refresh capability</p>
              </div>
              <div className="feature-card">
                <h3>🔄 Network Switching</h3>
                <p>Seamless network switching with automatic balance updates</p>
              </div>
              <div className="feature-card">
                <h3>⚡ Error Handling</h3>
                <p>Comprehensive error handling and user feedback</p>
              </div>
              <div className="feature-card">
                <h3>📱 Responsive Design</h3>
                <p>Mobile-friendly interface with dark mode support</p>
              </div>
            </div>
          </div>

          <div className="activity-section">
            <ActivityLog 
              maxEntries={5}
              autoRefresh={true}
              refreshInterval={3000}
              className="demo-activity-log"
            />
          </div> */}

        </main>
      </div>
    </WalletProvider>
  );
}

export default App;

/**
 * TrustWalletConnect React Component
 * Production-ready component for Trust Wallet integration with comprehensive error handling
 */

import React, { useEffect, useState } from "react";
import { useWallet } from "../contexts/WalletContext";
import { TrustWalletConnectProps } from "../types/wallet";
import {
  isTrustWalletAvailable,
  shortenAddress,
  formatBalance,
  getNetworkById,
  getTrustWalletDownloadUrl,
} from "../utils/walletUtils";
import "./TrustWalletConnect.css";

const TrustWalletConnect: React.FC<TrustWalletConnectProps> = ({
  onConnect,
  onDisconnect,
  onError,
  className = "",
  showBalance = true,
  showNetwork = true,
  autoConnect = false,
}) => {
  const {
    walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance,
  } = useWallet();
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // Check if Trust Wallet is installed
  useEffect(() => {
    const checkInstallation = () => {
      const installed = isTrustWalletAvailable();
      setIsInstalled(installed);

      if (!installed && walletState.isConnected) {
        disconnectWallet();
      }
    };

    checkInstallation();

    // Re-check periodically in case user installs Trust Wallet
    const interval = setInterval(checkInstallation, 1000);

    return () => clearInterval(interval);
  }, [walletState.isConnected, disconnectWallet]);

  // Auto-connect if requested and Trust Wallet is available
  useEffect(() => {
    if (
      autoConnect &&
      isInstalled &&
      !walletState.isConnected &&
      !walletState.isLoading
    ) {
      handleConnect();
    }
  }, [
    autoConnect,
    isInstalled,
    walletState.isConnected,
    walletState.isLoading,
  ]);

  // Handle successful connection
  useEffect(() => {
    if (walletState.isConnected && walletState.account && onConnect) {
      onConnect(walletState.account);
    }
  }, [walletState.isConnected, walletState.account, onConnect]);

  // Handle disconnection
  useEffect(() => {
    if (!walletState.isConnected && onDisconnect) {
      onDisconnect();
    }
  }, [walletState.isConnected, onDisconnect]);

  // Handle errors
  useEffect(() => {
    if (walletState.error && onError) {
      onError(walletState.error);
    }
  }, [walletState.error, onError]);

  // Connect wallet handler
  const handleConnect = async (): Promise<void> => {
    try {
      await connectWallet();
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
    }
  };

  // Disconnect wallet handler
  const handleDisconnect = (): void => {
    disconnectWallet();
  };

  // Network switch handler
  const handleNetworkSwitch = async (chainId: number): Promise<void> => {
    try {
      await switchNetwork(chainId);
    } catch (error: any) {
      console.error("Failed to switch network:", error);
    }
  };

  // Balance refresh handler
  const handleRefreshBalance = async (): Promise<void> => {
    try {
      await refreshBalance();
    } catch (error: any) {
      console.error("Failed to refresh balance:", error);
    }
  };

  // Get current network information
  const getCurrentNetwork = () => {
    if (!walletState.chainId) return null;
    return getNetworkById(walletState.chainId);
  };

  // Render Trust Wallet not installed message
  const renderNotInstalled = () => (
    <div className={`trust-wallet-not-installed ${className}`}>
      <div className="trust-wallet-icon">
        <img src="/Trust_icon.png" alt="Trust Wallet" style={{width: '32px', height: '32px'}} />
      </div>
      <h3>Trust Wallet Not Detected</h3>
      <p>Trust Wallet browser extension is required to connect your wallet.</p>
      <a
        href={getTrustWalletDownloadUrl()}
        target="_blank"
        rel="noopener noreferrer"
        className="install-button"
      >
        Install Trust Wallet
      </a>
      <p className="install-help">
        After installing, refresh this page and click connect.
      </p>
    </div>
  );

  // Render connection error
  const renderError = () => (
    <div className="trust-wallet-error">
      <div className="error-icon">⚠️</div>
      <p className="error-message">{walletState.error}</p>
      <button onClick={() => window.location.reload()} className="retry-button">
        Retry Connection
      </button>
    </div>
  );

  // Render loading state
  const renderLoading = () => (
    <div className={`trust-wallet-loading ${className}`}>
      <div className="loading-spinner"></div>
      <p>Connecting to Trust Wallet...</p>
      <p className="loading-help">
        Please check your Trust Wallet extension and approve the connection.
      </p>
    </div>
  );

  // Render connect button
  const renderConnectButton = () => (
    <div className={`trust-wallet-connect ${className}`}>
      <button
        onClick={handleConnect}
        className="connect-button"
        disabled={walletState.isLoading}
      >
        <div className="trust-wallet-logo">
          <img src="/Trust_icon.png" alt="Trust Wallet" style={{width: '24px', height: '24px'}} />
        </div>
        Connect Trust Wallet
      </button>
    </div>
  );

  // Render connected state
  const renderConnected = () => {
    const network = getCurrentNetwork();
    const formattedBalance = walletState.balance
      ? formatBalance(walletState.balance)
      : "0";

    return (
      <div className={`trust-wallet-connected ${className}`}>
        <div className="wallet-info">
          <div className="wallet-header">
            <div className="wallet-icon">
              <img src="/Trust_icon.png" alt="Trust Wallet" style={{width: '24px', height: '24px'}} />
            </div>
            <div className="wallet-details">
              <div className="wallet-address">
                {shortenAddress(walletState.account || "")}
              </div>
              {showNetwork && network && (
                <div className="wallet-network">
                  {network.nativeCurrency.symbol} Network
                </div>
              )}
            </div>
          </div>

          {showBalance && (
            <div className="wallet-balance">
              <span className="balance-label">Balance:</span>
              <span className="balance-amount">
                {formattedBalance} {network?.nativeCurrency.symbol || "ETH"}
              </span>
              <button
                onClick={handleRefreshBalance}
                className="refresh-button"
                title="Refresh Balance"
                disabled={walletState.isLoading}
              >
                🔄
              </button>
            </div>
          )}

          <div className="wallet-actions">
            {showNetwork && (
              <div className="network-switcher">
                <select
                  value={walletState.chainId || 1}
                  onChange={(e) => handleNetworkSwitch(Number(e.target.value))}
                  className="network-select"
                  disabled={walletState.isLoading}
                >
                  <option value={1}>Ethereum</option>
                  <option value={56}>BSC</option>
                  <option value={137}>Polygon</option>
                </select>
              </div>
            )}

            <button onClick={handleDisconnect} className="disconnect-button">
              Disconnect
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main render logic
  if (!isInstalled) {
    return renderNotInstalled();
  }

  if (walletState.error) {
    return renderError();
  }

  if (walletState.isLoading) {
    return renderLoading();
  }

  if (walletState.isConnected) {
    return renderConnected();
  }

  return renderConnectButton();
};

export default TrustWalletConnect;

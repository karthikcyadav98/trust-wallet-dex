/**
 * TypeScript types for wallet integration
 */

export interface WalletState {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  balance: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface NetworkConfig {
  chainId: string;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export interface TrustWalletProvider {
  isMetaMask?: boolean;
  isTrust?: boolean;
  request: (request: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, handler: (...args: any[]) => void) => void;
  removeListener: (event: string, handler: (...args: any[]) => void) => void;
  selectedAddress: string | null;
  chainId: string;
  providers?: TrustWalletProvider[];
}

export interface WalletContextType {
  walletState: WalletState;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: (chainId: number) => Promise<void>;
  refreshBalance: () => Promise<void>;
}

export interface TrustWalletConnectProps {
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
  onError?: (error: string) => void;
  className?: string;
  showBalance?: boolean;
  showNetwork?: boolean;
  autoConnect?: boolean;
}

export interface WalletError {
  code: number;
  message: string;
  stack?: string;
}

export interface AccountChangeEvent {
  accounts: string[];
}

export interface ChainChangeEvent {
  chainId: string;
}

export type WalletEventType = 
  | 'accountsChanged' 
  | 'chainChanged' 
  | 'connect' 
  | 'disconnect';

export interface WalletConnectionStatus {
  isTrustWalletInstalled: boolean;
  isConnected: boolean;
  hasPermissions: boolean;
}

export interface NetworkInfo {
  chainId: number;
  name: string;
  symbol: string;
  explorer: string;
  rpc: string;
}

declare global {
  interface Window {
    ethereum?: TrustWalletProvider;
  }
}
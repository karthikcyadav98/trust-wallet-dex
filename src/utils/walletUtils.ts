/**
 * Utility functions for wallet operations
 */

import { ethers } from 'ethers';

/**
 * Shortens a wallet address to display format (0x1234...abcd)
 */
export const shortenAddress = (address: string, startLength: number = 6, endLength: number = 4): string => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Validates if a string is a valid Ethereum address
 */
export const isValidAddress = (address: string): boolean => {
  return ethers.isAddress(address);
};

/**
 * Network configurations for supported chains
 */
export const SUPPORTED_NETWORKS = {
  1: {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io/']
  },
  56: {
    chainId: '0x38',
    chainName: 'Binance Smart Chain',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18
    },
    rpcUrls: ['https://bsc-dataseed.binance.org/'],
    blockExplorerUrls: ['https://bscscan.com/']
  },
  137: {
    chainId: '0x89',
    chainName: 'Polygon',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/']
  }
} as const;

/**
 * Gets network information by chain ID
 */
export const getNetworkById = (chainId: number) => {
  return SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS] || null;
};

/**
 * Formats balance for display
 */
export const formatBalance = (balance: string, decimals: number = 18, displayDecimals: number = 4): string => {
  if (!balance) return '0';
  
  try {
    const formattedBalance = ethers.formatUnits(balance, decimals);
    return parseFloat(formattedBalance).toFixed(displayDecimals);
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
};

/**
 * Detects if Trust Wallet is available
 */
export const isTrustWalletAvailable = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.ethereum && (window.ethereum as any).isTrust);
};

/**
 * Gets the Trust Wallet provider
 */
export const getTrustWalletProvider = () => {
  if (typeof window === 'undefined') return null;
  
  // Check for Trust Wallet specifically
  if (window.ethereum && (window.ethereum as any).isTrust) {
    return window.ethereum;
  }
  
  // Check for Trust Wallet in providers array (for cases with multiple wallets)
  if (window.ethereum && (window.ethereum as any).providers) {
    const providers = (window.ethereum as any).providers;
    return providers.find((provider: any) => provider.isTrust);
  }
  
  return null;
};

/**
 * Request account access from Trust Wallet
 */
export const requestAccounts = async (): Promise<string[]> => {
  const provider = getTrustWalletProvider();
  if (!provider) {
    throw new Error('Trust Wallet not found');
  }
  
  try {
    const accounts = await provider.request({
      method: 'eth_requestAccounts'
    });
    return accounts;
  } catch (error: any) {
    if (error.code === 4001) {
      throw new Error('User rejected the connection request');
    }
    throw new Error(`Failed to connect: ${error.message}`);
  }
};

/**
 * Get current network chain ID
 */
export const getChainId = async (): Promise<string> => {
  const provider = getTrustWalletProvider();
  if (!provider) {
    throw new Error('Trust Wallet not found');
  }
  
  return await provider.request({
    method: 'eth_chainId'
  });
};

/**
 * Get account balance
 */
export const getBalance = async (address: string): Promise<string> => {
  const provider = getTrustWalletProvider();
  if (!provider) {
    throw new Error('Trust Wallet not found');
  }
  
  return await provider.request({
    method: 'eth_getBalance',
    params: [address, 'latest']
  });
};

/**
 * Switch to a specific network
 */
export const switchNetwork = async (chainId: number): Promise<void> => {
  const provider = getTrustWalletProvider();
  if (!provider) {
    throw new Error('Trust Wallet not found');
  }
  
  const network = getNetworkById(chainId);
  if (!network) {
    throw new Error(`Unsupported network: ${chainId}`);
  }
  
  // Add timeout to prevent infinite loading
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Network switch request timed out')), 30000);
  });
  
  try {
    await Promise.race([
      provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }]
      }),
      timeoutPromise
    ]);
  } catch (error: any) {
    // Network not added to wallet, try to add it
    if (error.code === 4902) {
      await Promise.race([
        provider.request({
          method: 'wallet_addEthereumChain',
          params: [network]
        }),
        timeoutPromise
      ]);
    } else if (error.code === 4001) {
      throw new Error('User rejected the network switch request');
    } else {
      throw error;
    }
  }
};

/**
 * Convert hex chain ID to decimal
 */
export const hexToDecimal = (hex: string): number => {
  return parseInt(hex, 16);
};

/**
 * Get Trust Wallet download URL
 */
export const getTrustWalletDownloadUrl = (): string => {
  return 'https://trustwallet.com/browser-extension';
};
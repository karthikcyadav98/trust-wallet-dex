/**
 * Wallet Context for managing Trust Wallet connection state
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  WalletState,
  WalletContextType,
  TrustWalletProvider,
  AccountChangeEvent,
  ChainChangeEvent
} from '../types/wallet';
import {
  isTrustWalletAvailable,
  getTrustWalletProvider,
  requestAccounts,
  getChainId,
  getBalance,
  hexToDecimal,
  switchNetwork as switchNetworkUtil,
  getNetworkById
} from '../utils/walletUtils';
import { activityLogger } from '../utils/encryptedStorage';

// Initial wallet state
const initialState: WalletState = {
  isConnected: false,
  account: null,
  chainId: null,
  balance: null,
  isLoading: false,
  error: null
};

// Action types for wallet state management
type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: { account: string; chainId: number } }
  | { type: 'SET_DISCONNECTED' }
  | { type: 'SET_BALANCE'; payload: string }
  | { type: 'SET_CHAIN_ID'; payload: number }
  | { type: 'RESET_STATE' };

// Wallet state reducer
const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: true,
        account: action.payload.account,
        chainId: action.payload.chainId,
        isLoading: false,
        error: null
      };
    
    case 'SET_DISCONNECTED':
      return {
        ...initialState,
        isLoading: false
      };
    
    case 'SET_BALANCE':
      return { ...state, balance: action.payload };
    
    case 'SET_CHAIN_ID':
      return { ...state, chainId: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// Create wallet context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Wallet Provider component
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [walletState, dispatch] = useReducer(walletReducer, initialState);

  // Connect to Trust Wallet
  const connectWallet = useCallback(async (): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      if (!isTrustWalletAvailable()) {
        const error = 'Trust Wallet is not installed';
        activityLogger.addLogEntry({
          type: 'error',
          message: 'Connection failed - Trust Wallet not available',
          details: { error }
        });
        throw new Error(error);
      }

      const accounts = await requestAccounts();
      if (accounts.length === 0) {
        const error = 'No accounts found';
        activityLogger.addLogEntry({
          type: 'error',
          message: 'Connection failed - No accounts available',
          details: { error }
        });
        throw new Error(error);
      }

      const chainIdHex = await getChainId();
      const chainId = hexToDecimal(chainIdHex);
      const network = getNetworkById(chainId);

      dispatch({
        type: 'SET_CONNECTED',
        payload: {
          account: accounts[0],
          chainId
        }
      });

      // Log successful connection
      activityLogger.addLogEntry({
        type: 'connection',
        message: 'Successfully connected to Trust Wallet',
        details: {
          account: accounts[0],
          chainId,
          networkName: network?.chainName || 'Unknown Network'
        }
      });

      // Get initial balance
      await refreshBalance(accounts[0]);

    } catch (error: any) {
      // Log connection error if not already logged
      if (!error.message.includes('Trust Wallet is not installed') && 
          !error.message.includes('No accounts found')) {
        activityLogger.addLogEntry({
          type: 'error',
          message: 'Wallet connection failed',
          details: { error: error.message }
        });
      }
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback((): void => {
    // Log disconnection
    activityLogger.addLogEntry({
      type: 'disconnection',
      message: 'Wallet disconnected',
      details: {
        account: walletState.account || undefined
      }
    });

    dispatch({ type: 'SET_DISCONNECTED' });
    
    // Remove event listeners
    const provider = getTrustWalletProvider();
    if (provider) {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    }
  }, [walletState.account]);

  // Refresh account balance
  const refreshBalance = useCallback(async (account?: string): Promise<void> => {
    const targetAccount = account || walletState.account;
    if (!targetAccount) return;

    try {
      const balance = await getBalance(targetAccount);
      dispatch({ type: 'SET_BALANCE', payload: balance });
    } catch (error: any) {
      console.error('Failed to refresh balance:', error);
      dispatch({ type: 'SET_ERROR', payload: `Failed to get balance: ${error.message}` });
    }
  }, [walletState.account]);

  // Switch network
  const switchNetwork = useCallback(async (targetChainId: number): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const targetNetwork = getNetworkById(targetChainId);

    try {
      await switchNetworkUtil(targetChainId);
      dispatch({ type: 'SET_CHAIN_ID', payload: targetChainId });
      dispatch({ type: 'SET_LOADING', payload: false });

      // Log successful network switch
      activityLogger.addLogEntry({
        type: 'network_switch',
        message: `Switched to ${targetNetwork?.chainName || 'Unknown Network'}`,
        details: {
          account: walletState.account || undefined,
          chainId: targetChainId,
          networkName: targetNetwork?.chainName || 'Unknown Network'
        }
      });
      
      // Refresh balance after network switch
      if (walletState.account) {
        await refreshBalance(walletState.account);
      }
    } catch (error: any) {
      // Log network switch error
      activityLogger.addLogEntry({
        type: 'error',
        message: `Failed to switch to ${targetNetwork?.chainName || 'network'}`,
        details: {
          account: walletState.account || undefined,
          chainId: targetChainId,
          networkName: targetNetwork?.chainName || 'Unknown Network',
          error: error.message
        }
      });

      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      // Ensure loading is always cleared
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [walletState.account, refreshBalance]);

  // Handle account changes
  const handleAccountsChanged = useCallback((event: string[]) => {
    if (event.length === 0) {
      // User disconnected
      dispatch({ type: 'SET_DISCONNECTED' });
    } else {
      // Account switched
      const newAccount = event[0];
      if (walletState.isConnected && newAccount !== walletState.account) {
        dispatch({
          type: 'SET_CONNECTED',
          payload: {
            account: newAccount,
            chainId: walletState.chainId || 1
          }
        });
        refreshBalance(newAccount);
      }
    }
  }, [walletState.isConnected, walletState.account, walletState.chainId, refreshBalance]);

  // Handle chain changes
  const handleChainChanged = useCallback((chainIdHex: string) => {
    const chainId = hexToDecimal(chainIdHex);
    dispatch({ type: 'SET_CHAIN_ID', payload: chainId });
    
    // Refresh balance on chain change
    if (walletState.account) {
      refreshBalance(walletState.account);
    }
  }, [walletState.account, refreshBalance]);

  // Set up event listeners
  useEffect(() => {
    const provider = getTrustWalletProvider();
    if (!provider) return;

    provider.on('accountsChanged', handleAccountsChanged);
    provider.on('chainChanged', handleChainChanged);

    // Check if already connected
    const checkConnection = async () => {
      try {
        if (provider.selectedAddress) {
          const chainIdHex = await getChainId();
          const chainId = hexToDecimal(chainIdHex);
          
          dispatch({
            type: 'SET_CONNECTED',
            payload: {
              account: provider.selectedAddress,
              chainId
            }
          });
          
          await refreshBalance(provider.selectedAddress);
        }
      } catch (error) {
        console.error('Failed to check existing connection:', error);
      }
    };

    checkConnection();

    // Cleanup event listeners
    return () => {
      provider.removeListener('accountsChanged', handleAccountsChanged);
      provider.removeListener('chainChanged', handleChainChanged);
    };
  }, [handleAccountsChanged, handleChainChanged, refreshBalance]);

  const contextValue: WalletContextType = {
    walletState,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    refreshBalance: () => refreshBalance()
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
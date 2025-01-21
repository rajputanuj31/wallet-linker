import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

interface WalletState {
  // Persisted state
  address: string;
  balance: string;
  chainId: string;
  chainName: string;
  walletType?: 'metamask' | 'phantom' | 'petra' | 'leap' | 'rabby';
  txHash: string | null;
  explorerUrl: string | null;

  // Non-persisted state (will be reset on refresh)
  isConnecting: boolean;
  error: string | null;
  isTransacting: boolean;
  transactionError: string | null;
}

const initialState: WalletState = {
  // Persisted state
  address: '',
  balance: '',
  chainId: '',
  chainName: '',
  walletType: undefined,
  txHash: null,
  explorerUrl: null,

  // Non-persisted state
  isConnecting: false,
  error: null,
  isTransacting: false,
  transactionError: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletInfo: (state, action: PayloadAction<Partial<WalletState>>) => {
      // Only update persisted fields
      const { 
        address, 
        balance, 
        chainId, 
        chainName, 
        walletType,
        txHash,
        explorerUrl
      } = action.payload;

      if (address !== undefined) state.address = address;
      if (balance !== undefined) state.balance = balance;
      if (chainId !== undefined) state.chainId = chainId;
      if (chainName !== undefined) state.chainName = chainName;
      if (walletType !== undefined) state.walletType = walletType;
      if (txHash !== undefined) state.txHash = txHash;
      if (explorerUrl !== undefined) state.explorerUrl = explorerUrl;
    },
    setIsConnecting: (state, action: PayloadAction<boolean>) => {
      state.isConnecting = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setTransactionInfo: (state, action: PayloadAction<{ txHash: string; explorerUrl: string }>) => {
      state.txHash = action.payload.txHash;
      state.explorerUrl = action.payload.explorerUrl;
    },
    resetWallet: () => initialState,
    setIsTransacting: (state, action: PayloadAction<boolean>) => {
      state.isTransacting = action.payload;
    },
    setTransactionError: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state) => {
      // Clear non-persisted state on rehydration
      state.error = null;
      state.isConnecting = false;
      state.isTransacting = false;
      state.transactionError = null;
    });
  },
});

export const {
  setWalletInfo,
  setIsConnecting,
  setError,
  setTransactionInfo,
  resetWallet,
  setIsTransacting,
  setTransactionError,
} = walletSlice.actions;

export default walletSlice.reducer; 
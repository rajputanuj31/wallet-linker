import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WalletState {
  address: string;
  balance: string;
  chainId: string;
  chainName: string;
  walletType?: 'metamask' | 'phantom' | 'petra' | 'leap';
  isConnecting: boolean;
  error: string | null;
  txHash: string | null;
  explorerUrl: string | null;
  isTransacting: boolean;
  transactionError: string | null;
}

const initialState: WalletState = {
  address: '',
  balance: '',
  chainId: '',
  chainName: '',
  walletType: undefined,
  isConnecting: false,
  error: null,
  txHash: null,
  explorerUrl: null,
  isTransacting: false,
  transactionError: null,
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletInfo: (state, action: PayloadAction<Partial<WalletState>>) => {
      return { ...state, ...action.payload };
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
    resetWallet: (state) => {
      return initialState;
    },
    setIsTransacting: (state, action: PayloadAction<boolean>) => {
      state.isTransacting = action.payload;
    },
    setTransactionError: (state, action: PayloadAction<string | null>) => {
      state.transactionError = action.payload;
    },
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
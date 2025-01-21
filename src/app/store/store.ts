import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import walletReducer from './features/walletSlice';

const rootReducer = combineReducers({
  wallet: walletReducer,
});

// Create a nested persist config for the wallet reducer
const walletPersistConfig = {
  key: 'wallet',
  storage,
  blacklist: ['error', 'isConnecting', 'transactionError', 'isTransacting'],
};

// Create a persist config for the root reducer
const rootPersistConfig = {
  key: 'root',
  version: 1,
  storage,
  whitelist: ['wallet'],
};

// First persist the wallet reducer with its config
const persistedWalletReducer = persistReducer(walletPersistConfig, walletReducer);

// Then create the root reducer with the persisted wallet reducer
const rootReducerWithPersistedWallet = combineReducers({
  wallet: persistedWalletReducer,
});

// Finally persist the root reducer
const persistedReducer = persistReducer(rootPersistConfig, rootReducerWithPersistedWallet);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 
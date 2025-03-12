import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // Use localStorage for persistence

// Configuration for Redux Persist
const persistConfig = {
  key: 'root', // Key to identify the storage in localStorage
  storage, // Using localStorage for persistence
};

const persistedReducer = persistReducer(persistConfig, authReducer); // Wrap the auth reducer to persist

const store = configureStore({
  reducer: {
    auth: persistedReducer, // Apply the persisted reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'], // Ignore actions related to persistence
      },
    }),
});

export const persistor = persistStore(store); // Create the persistor

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'fitpilot.access-token';

export class SecureTokenStoreUnavailableError extends Error {
  constructor() {
    super('Secure credential storage is not available on this device.');
    this.name = 'SecureTokenStoreUnavailableError';
  }
}

async function assertAvailable() {
  if (Platform.OS === 'web' || !(await SecureStore.isAvailableAsync())) {
    throw new SecureTokenStoreUnavailableError();
  }
}

export const secureTokenStore = {
  async get(): Promise<string | null> {
    await assertAvailable();
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async set(token: string): Promise<void> {
    if (!token.trim()) throw new Error('A non-empty access token is required.');
    await assertAvailable();
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    await assertAvailable();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};

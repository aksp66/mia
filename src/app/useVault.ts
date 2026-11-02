import { useSyncExternalStore } from 'react';
import { vault } from '../data/vault';

export const useVaultStatus = () => useSyncExternalStore(vault.subscribe, vault.getStatus);



// --- CONSOLIDATED FROM: ./hooks/useSyncProviders.ts ---

import { useSyncExternalStore } from "react";
import { store } from "./store";

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: any;
}

export const useSyncProviders = (): EIP6963ProviderDetail[] => {
  return useSyncExternalStore<EIP6963ProviderDetail[]>(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  );
};

export const useProviderByRDNS = (rdns: string): EIP6963ProviderDetail | undefined => {
  const providers = useSyncProviders();
  return providers.find((p) => p.info.rdns === rdns);
};

export const useMetaMaskProvider = (): EIP6963ProviderDetail | undefined => {
  return useProviderByRDNS("io.metamask");
};

export const useCoinbaseProvider = (): EIP6963ProviderDetail | undefined => {
  return useProviderByRDNS("com.coinbase.wallet");
};

export default useSyncProviders;
import create from "zustand";
import { persist } from "zustand/middleware";

import { Wallet } from "types";

const dummyStorageApi = {
  getItem: () => null,
  removeItem: () => undefined,
  setItem: () => undefined,
};

interface WalletStore {
  address: string;
  injectiveAddress: string;
  addresses: string[];
  metamaskInstalled: boolean;
  wallet: Wallet;
  actions: {
    setAddress: (address: string) => void;
    setMetamaskInstalledStatus: (value: boolean) => void;
  };
}

const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      address: "",
      injectiveAddress: "",
      addresses: [],
      metamaskInstalled: false,
      wallet: Wallet.Metamask,
      actions: {
        setAddress: (address: string) => set(() => ({ address })),
        setMetamaskInstalledStatus: (value: boolean) =>
          set(() => ({ metamaskInstalled: value })),
      },
    }),
    {
      name: "wallet",
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["metamaskInstalled", "actions"].includes(key)
          )
        ),
      // getStorage: () =>
      //   typeof window !== "undefined" ? localStorage : dummyStorageApi,
    }
  )
);

export default useWalletStore;

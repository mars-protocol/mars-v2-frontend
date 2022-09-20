import create from "zustand";

interface CreditManagerStore {
  isOpen: boolean;
  selectedAccount: string | null;
  actions: {
    toggleCreditManager: () => void;
    setSelectedAccount: (id: string) => void;
  };
}

const useCreditManagerStore = create<CreditManagerStore>()((set, get) => ({
  isOpen: false,
  selectedAccount: null,
  actions: {
    toggleCreditManager: () => set(() => ({ isOpen: !get().isOpen })),
    setSelectedAccount: (accountId: string) => {
      set(() => ({
        selectedAccount: accountId,
      }));
    },
  },
}));

export default useCreditManagerStore;

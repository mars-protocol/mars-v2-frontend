import create from "zustand";

interface CreditManagerStore {
  selectedAccount: string | null;
  actions: {
    setSelectedAccount: (id: string) => void;
  };
}

const useCreditManagerStore = create<CreditManagerStore>()((set, get) => ({
  selectedAccount: null,
  actions: {
    setSelectedAccount: (accountId: string) => {
      set(() => ({
        selectedAccount: accountId,
      }));
    },
  },
}));

export default useCreditManagerStore;

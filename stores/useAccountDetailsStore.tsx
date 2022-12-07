import create from 'zustand'

interface AccountDetailsStore {
  isOpen: boolean
  selectedAccount: string | null
  actions: {
    showAccountDetails: (show: boolean) => void
    setSelectedAccount: (id: string) => void
  }
}

export const useAccountDetailsStore = create<AccountDetailsStore>()((set) => ({
  isOpen: true,
  selectedAccount: null,
  actions: {
    showAccountDetails: (show) => set(() => ({ isOpen: show })),
    setSelectedAccount: (accountId: string) => {
      set(() => ({
        selectedAccount: accountId,
      }))
    },
  },
}))

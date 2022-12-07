import create from 'zustand'
import { persist } from 'zustand/middleware'

interface AccountDetailsStore {
  isOpen: boolean
  selectedAccount: string | null
  actions: {
    showAccountDetails: (show: boolean) => void
    setSelectedAccount: (id: string) => void
  }
}

export const useAccountDetailsStore = create<AccountDetailsStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'creditManager',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => ['selectedAccount'].includes(key)),
        ),
    },
  ),
)
